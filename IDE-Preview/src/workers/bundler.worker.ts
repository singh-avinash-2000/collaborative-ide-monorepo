import * as esbuild from 'esbuild-wasm';
import * as Path from 'path-browserify';
import { getReactTemplate, getSrcHtml } from '../templates/template';
import { ModuleResolutionUtil } from '../utils/ModuleResolutionUtil';

interface PackageInfo {
	packageName: string;
	additionalPath: string;
	isScoped: boolean;
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

(async () => {
	const moduleResolver = ModuleResolutionUtil.getInstance();

	const rootPackages: Record<string, string> = {
		react: '18.2.0',
		'react-dom': '18.2.0',
		'react-router-dom': '6.9.0',
		'react-redux': '8.0.5',
		'@reduxjs/toolkit': '1.8.6',
		'chart.js': '4.2.1',
		'react-chartjs-2': '4.2.0',
	};

	try {
		console.log('Resolving dependencies...');
		await moduleResolver.resolveDependencies(rootPackages);
		console.log('Resoled dependencies');
	} catch (error) {
		console.log('Error occured trying to resolve dependencies', error);
	}

	try {
		console.log('Initializing bundler...');
		await esbuild.initialize({
			worker: false,
			wasmURL: 'https://unpkg.com/esbuild-wasm@0.19.12/esbuild.wasm',
		});
		console.log('Initialized bundler');
	} catch (error) {
		console.log('Error occured initializing bundler', error);
	}

	const fileTree = moduleResolver.getNodeModules();
	const addedPackages = moduleResolver.getAddedDependencies();

	var context: esbuild.BuildContext | null = null;

	const CustomFileHandler: esbuild.Plugin = {
		name: 'Custom File Handler',
		setup(build) {
			build.onResolve({ filter: /.*/ }, async (args) => {
				console.log('Resolving : ', args);
				if (args.namespace != 'node_modules' && (args.path.startsWith('.') || args.path.startsWith('..'))) {
					const absolutePath = '.' + Path.resolve(Path.dirname(args.importer), args.path);
					let filePathFound = checkFileExists(absolutePath);
					console.log('File Found : ', filePathFound);
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
						console.log('Resolving package : ', packageName);

						// if a package has an import like - react-dom/client then /client becomes the additionalPath and in that case we should not the default entry point for the package thus keeping it null
						let entryPoint = !additionalPath ? getPackageEntryPoint(addedPackages[packageName], args.kind) : null;

						if (entryPoint) {
							absolutePath = Path.join('/node_modules', packageName, entryPoint);
						} else {
							absolutePath = Path.join('/node_modules', args.path);
						}
					}

					const filePathFound = checkFileExists(absolutePath.substring(1));
					console.log('File Found : ', filePathFound);
					return {
						path: filePathFound,
						namespace: 'node_modules',
					};
				}
			});

			build.onLoad({ namespace: 'file-tree', filter: /.*/ }, async (args) => {
				console.log('Loading from file tree : ', args);
				const { contents, ext } = fetchFileContents(args.path);
				return { contents, loader: getLoader(ext) };
			});

			build.onLoad({ namespace: 'node_modules', filter: /.*/ }, async (args) => {
				console.log('Loading from node_modules: ', args);
				const { contents, ext } = fetchFileContents(args.path);
				return { contents, loader: getLoader(ext) };
			});
		},
	};

	var entryPoint = './main.tsx';

	context = await esbuild.context({
		bundle: true,
		entryPoints: [entryPoint],
		platform: 'browser',
		format: 'iife',
		minify: false,
		treeShaking: false,
		resolveExtensions: ['.tsx', '.ts', '.js', '.jsx', '.css'],
		plugins: [CustomFileHandler],
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

	self.addEventListener('message', async (event) => {
		if (event.data.type === 'SET_ENTRY_POINT') {
			console.log('Setting entry point:', event.data.entryPoint);
			entryPoint = event.data.entryPoint;
			return;
		}
		console.time('BUNDLING');
		(globalThis as any).process = {
			env: {},
			cwd: () => '/',
			platform: 'browser',
			version: 'v16.0.0',
			versions: { node: '16.0.0' },
		};

		const localFileTree = event.data;

		Object.keys(localFileTree).forEach((filePath) => {
			fileTree[filePath] = localFileTree[filePath];
		});

		try {
			const content = await context?.rebuild();

			if (content && content.outputFiles?.length) {
				const htmlContent = getSrcHtml(content.outputFiles[0].text);
				self.postMessage({ content: htmlContent });
				console.timeEnd('BUNDLING');
			}
		} catch (error) {
			console.log(error);
			console.timeEnd('BUNDLING');
		}
	});

	const fetchFileContents = (filePath: string): { contents: string; ext: string } => {
		const fileExtension = Path.extname(filePath);
		return { contents: fileTree[filePath], ext: fileExtension };
	};

	const checkFileExists = (filePath: string): string => {
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
})();
