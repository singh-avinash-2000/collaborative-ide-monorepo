import * as esbuild from 'esbuild-wasm';
import { ModuleResolutionUtil } from './ModuleResolutionUtil';
import { getSrcHtml } from '../templates/template';
import * as Path from 'path-browserify';
import { ViewManager } from './ViewManager';

interface PackageInfo {
	packageName: string;
	additionalPath: string;
	isScoped: boolean;
}

export class Bundler {
	private constructor() {
		this._moduleResolver = ModuleResolutionUtil.getInstance();
		this._viewer = ViewManager.getInstance();
	}

	private static _instance: Bundler | null = null;
	private _entryPoint: string = './main.tsx';
	private _module_files: Record<string, string> = {};
	private _project_files: Record<string, string> = {};
	private _moduleResolver: ModuleResolutionUtil;
	private _lastBundle: string | undefined;
	private _isInitialized: boolean = false;
	private _builderContext: esbuild.BuildContext | undefined;
	private _viewer: ViewManager;

	public get isInitialized(): boolean {
		return this._isInitialized;
	}

	public get isFirstBundle(): boolean {
		return this._lastBundle === undefined;
	}

	public set entryPoint(value: string) {
		this._entryPoint = value;
	}

	public projectDependencies: Record<string, string> = {};

	public static getInstance(): Bundler {
		if (!this._instance) {
			this._instance = new Bundler();
		}

		return this._instance;
	}

	public async initialize(packageJson: Record<string, string>, files: Record<string, string>): Promise<void> {
		try {
			console.time('Bundler Initialization');
			this._project_files = files;
			if (!this._isInitialized) {
				await esbuild.initialize({
					worker: false,
					wasmURL: 'https://unpkg.com/esbuild-wasm@0.19.12/esbuild.wasm',
				});
				this._isInitialized = true;
				console.log('Bundler initialized');
			}

			this.projectDependencies = packageJson;

			await this._moduleResolver.resolveDependencies(packageJson);
			console.log('Resoled dependencies');

			this._module_files = this._moduleResolver.getNodeModules();

			this._builderContext = await esbuild.context({
				bundle: true,
				entryPoints: [this._entryPoint],
				platform: 'browser',
				format: 'esm',
				minify: true,
				treeShaking: false,
				resolveExtensions: ['.tsx', '.ts', '.js', '.jsx', '.css'],
				plugins: [this.CustomFileHandlerPlugin],
				target: ['esnext'],
				logLevel: 'info',
				loader: {
					'.ts': 'ts',
					'.tsx': 'tsx',
					'.js': 'js',
					'.jsx': 'jsx',
					'.css': 'css',
				},
				write: false,
			});
			console.timeEnd('Bundler Initialization');
			await this.rebuild(files);
		} catch (error) {
			console.log('Error occured initializing bundler', error);
		}
	}

	public updateProjectFiles(filePath: string, content: string): void {
		this._project_files[filePath] = content;
	}

	public async addProjectDependency(packageName: string, version: string): Promise<void> {
		const moduleResolver = ModuleResolutionUtil.getInstance();
		await moduleResolver.resolveDependencies({ [packageName]: version });
		this._module_files = moduleResolver.getNodeModules();
	}

	private CustomFileHandlerPlugin: esbuild.Plugin = {
		name: 'Custom File Handler',
		setup: (build) => {
			build.onResolve({ filter: /.*/ }, async (args) => {
				if (args.namespace != 'node_modules' && (args.path.startsWith('.') || args.path.startsWith('..'))) {
					const absolutePath = '.' + Path.resolve(Path.dirname(args.importer), args.path);
					let filePathFound = checkFileExists(this._project_files, absolutePath);

					return {
						namespace: 'file-tree',
						path: filePathFound,
					};
				} else {
					let absolutePath = '';
					if (args.path.startsWith('.') || args.path.startsWith('..')) {
						const ext = Path.extname(args.importer);
						if (ext) {
							// importer: 'node_modules/react-dom/index.js';
							// path: './cjs/react-dom.development.js';
							absolutePath = Path.resolve(Path.dirname(args.importer), args.path);
						} else {
							// importer: 'node_modules/scheduler';
							// path: './cjs/scheduler.development.js';
							absolutePath = Path.resolve(args.importer, args.path);
						}
					} else {
						const { packageName, additionalPath } = parsePackagePathSimple(args.path);

						const addedPackages = this._moduleResolver.getAddedDependencies();

						// if a package has an import like - react-dom/client then /client becomes the additionalPath and in that case we should not the default entry point for the package thus keeping it null

						let entryPoint = !additionalPath ? getPackageEntryPoint(addedPackages[packageName], args.kind) : null;

						if (entryPoint) {
							absolutePath = Path.join('/node_modules', packageName, entryPoint);
						} else {
							absolutePath = Path.join('/node_modules', args.path);
						}
					}

					const filePathFound = checkFileExists(this._module_files, absolutePath.substring(1));

					return {
						path: filePathFound,
						namespace: 'node_modules',
					};
				}
			});

			build.onLoad({ namespace: 'file-tree', filter: /.*/ }, async (args) => {
				const { contents, ext } = fetchFileContents(this._project_files, args.path);
				return { contents, loader: getLoader(ext) };
			});

			build.onLoad({ namespace: 'node_modules', filter: /.*/ }, async (args) => {
				const { contents, ext } = fetchFileContents(this._module_files, args.path);
				return { contents, loader: getLoader(ext) };
			});
		},
	};

	public async rebuild(files: Record<string, string>): Promise<void> {
		try {
			this._project_files = files;
			console.time('Bundling');
			const content = await this._builderContext!.rebuild();
			if (content && content.outputFiles?.length) {
				const htmlContent = getSrcHtml(content.outputFiles[0].text);
				this._lastBundle = htmlContent;
				console.timeEnd('Bundling');
				this._viewer.updatePreview(htmlContent);
			}
		} catch (error) {
			console.log('Error during bundling:', error);
			console.timeEnd('BUNDLING');
		}
	}
}

function parsePackagePathSimple(modulePath: string): PackageInfo {
	const parts = modulePath.split('/');

	// Handle scoped packages (e.g., @babel/core/lib/utils)
	if (parts[0].startsWith('@')) {
		const packageName = `${parts[0]}/${parts[1]}`;
		const additionalPath = parts.slice(2).join('/');
		return {
			packageName,
			additionalPath,
			isScoped: true,
		};
	}

	// Handle regular packages (e.g., react-dom/internal/utils)
	const packageName = parts[0];
	const additionalPath = parts.slice(1).join('/') || '';

	return {
		packageName,
		additionalPath,
		isScoped: false,
	};
}

function getPackageEntryPoint(packageJson: any, kind: esbuild.ImportKind): string | null {
	const exportsField = packageJson.exports;

	const resolveExports = (target: any): string | null => {
		if (typeof target === 'string') return target;

		if (kind === 'import-statement' || kind === 'dynamic-import') {
			if (target?.import) return resolveExports(target.import);
		}

		if (kind === 'require-call' || kind === 'require-resolve') {
			if (target?.require) return resolveExports(target.require);
		}

		if (target?.default) return resolveExports(target.default);

		return null;
	};

	// 1. Prefer "exports" if defined
	if (exportsField) {
		if (typeof exportsField === 'string') {
			return exportsField;
		} else if (exportsField['.']) {
			return resolveExports(exportsField['.']);
		}
	}

	// 2. Fallback to "module" (for ESM)
	if ((kind === 'import-statement' || kind === 'dynamic-import') && packageJson.module) {
		return packageJson.module;
	}

	// 3. Fallback to "main"
	if (packageJson.main) {
		return packageJson.main;
	}

	// 4. No valid entry point found
	return null;
}

function getLoader(ext: string): esbuild.Loader {
	const loaderMap: Record<string, string> = {
		'.mjs': 'js',
		'.mts': 'ts',
		'.cjs': 'js',
		'.cts': 'ts',
	};

	return (loaderMap[ext] || ext.substring(1)) as esbuild.Loader;
}

const fetchFileContents = (fileTree: Record<string, string>, filePath: string): { contents: string; ext: string } => {
	const fileExtension = Path.extname(filePath);
	return { contents: fileTree[filePath], ext: fileExtension };
};

const checkFileExists = (fileTree: Record<string, string>, filePath: string): string => {
	const extensions = ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts', '.json'];
	const fileExtension = Path.extname(filePath);

	// If file path already has an extension, try directly fetching it
	if (fileExtension) {
		if (fileTree[filePath]) {
			return filePath;
		}

		throw new Error(`Failed to resolve file: ${filePath}`);
	}

	// If no extension, try appending possible extensions
	for (const ext of extensions) {
		const fullPath = filePath + ext;
		const defaultFilePath = filePath + '/index' + ext;

		if (fileTree[fullPath]) {
			return fullPath;
		}

		if (fileTree[defaultFilePath]) {
			return defaultFilePath;
		}
	}

	throw new Error(`Failed to find file: ${filePath}`);
};
