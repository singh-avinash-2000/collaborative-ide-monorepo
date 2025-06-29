import axios from 'axios';
import { gunzipSync } from 'fflate';

interface GeneratedModuleFiles {
	packageName: string;
	version: string;
	files: Record<string, string>;
}

(globalThis as any).process = {
	env: {},
	cwd: () => '/',
	platform: 'browser',
	version: 'v16.0.0',
	versions: { node: '16.0.0' },
};

export class ModuleResolutionUtil {
	private _base_url = 'https://registry.npmjs.org/';
	private _fs: Record<string, string> = {};
	private static _instance: ModuleResolutionUtil | null = null;
	private _addedDependencies: Record<string, Record<string, any>> = {};

	private constructor() {}

	private async fetchTarballURL(packageName: string, version: string): Promise<string | undefined> {
		const url = `${this._base_url}${packageName}/${version}`;
		const response = await axios.get(url);
		return response.data?.dist?.tarball;
	}

	private parseTar(buffer: Uint8Array): Record<string, string> {
		const files: Record<string, string> = {};
		let offset = 0;
		const BLOCK_SIZE = 512;

		while (offset < buffer.length) {
			// Check if block is empty (end of archive)
			if (buffer.slice(offset, offset + BLOCK_SIZE).every((b) => b === 0)) break;

			const nameBytes = buffer.slice(offset, offset + 100);
			const name = new TextDecoder().decode(nameBytes).replace(/\0.*/, '');

			const sizeOctal = new TextDecoder().decode(buffer.slice(offset + 124, offset + 136)).replace(/\0.*/, '');
			const size = parseInt(sizeOctal.trim(), 8);

			const dataStart = offset + BLOCK_SIZE;
			const dataEnd = dataStart + size;
			const content = buffer.slice(dataStart, dataEnd);

			if (name && size > 0) {
				const cleanedName = name.replace(/^package\//, '');
				files[cleanedName] = new TextDecoder().decode(content);
			}

			// Move to next header block (aligned to 512 bytes)
			const totalSize = BLOCK_SIZE + Math.ceil(size / BLOCK_SIZE) * BLOCK_SIZE;
			offset += totalSize;
		}

		return files;
	}

	private async generateModuleFiles(packageName: string, version: string): Promise<GeneratedModuleFiles> {
		const tarballURL = await this.fetchTarballURL(packageName, version);
		if (!tarballURL) throw new Error('Tarball URL not found');

		const response = await axios.get(tarballURL, { responseType: 'arraybuffer' });
		const gzippedData = new Uint8Array(response.data);

		const tarData = gunzipSync(gzippedData);
		const files = this.parseTar(tarData);
		return {
			packageName,
			version,
			files,
		};
	}

	public static getInstance() {
		if (this._instance) {
			return this._instance;
		}

		this._instance = new ModuleResolutionUtil();
		return this._instance;
	}

	public async resolveDependencies(dependencies: Record<string, string>) {
		if (!dependencies) {
			throw new Error(`Could not resolve dependencies.`);
		}

		const rootDependencyPromiseArray: Promise<GeneratedModuleFiles>[] = [];

		for (const [packageName, version] of Object.entries(dependencies)) {
			if (!this._addedDependencies[packageName]) {
				const cleanVersion = version.replace(/[^0-9.]/g, '');
				rootDependencyPromiseArray.push(this.generateModuleFiles(packageName, cleanVersion));
			}
		}

		const rootDependencyFiles = await Promise.all(rootDependencyPromiseArray);

		for (const { packageName, files } of rootDependencyFiles) {
			const filePathPrefix = `node_modules/${packageName}/`;

			for (const filePath of Object.keys(files)) {
				const fullPath = filePathPrefix + filePath;
				this._fs[fullPath] = files[filePath];

				if (filePath.toLowerCase() === 'package.json') {
					const dependencyPackageJson = JSON.parse(files[filePath]);
					this._addedDependencies[packageName] = dependencyPackageJson;
					await this.resolveDependencies(dependencyPackageJson.dependencies || {});
				}
			}
		}
	}

	public getNodeModules() {
		return this._fs;
	}

	public getAddedDependencies() {
		return this._addedDependencies;
	}
}
