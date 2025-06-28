import { Bundler } from './Bundler';

export enum MessengerDataTypePost {
	INITIALIZED = 'initialized',
	ADDED_PACKAGE = 'added_package',
	REMOVED_PACKAGE = 'removed_package',
}

export enum MessengerDataTypeGet {
	INITIALIZE = 'initialize',
	ADD_PACKAGE = 'add_package',
	REMOVE_PACKAGE = 'remove_package',
	REBUILD = 'rebuild',
}

interface IMessengerDataPost {
	type: MessengerDataTypePost;
	data: any;
}

interface IMessengerDataGet {
	type: MessengerDataTypeGet;
	data: any;
}

export class PreviewMessenger {
	private constructor() {
		this._bundler = Bundler.getInstance();
	}

	private _bundler: Bundler;
	private _baseURl: string = 'http://localhost:3000';
	private messenger: Window = window;
	private static _instance: PreviewMessenger | null = null;

	public static getInstance() {
		if (!this._instance) {
			this._instance = new PreviewMessenger();
		}
		return this._instance;
	}

	public sendMessage(message: IMessengerDataPost) {
		this.messenger.postMessage(message, this._baseURl);
	}

	public async messageListener(event: MessageEvent<IMessengerDataGet>) {
		if (event.origin !== this._baseURl) return;

		const { type, data } = event.data;
		switch (type) {
			case MessengerDataTypeGet.INITIALIZE:
				await this._bundler.initialize(data.packages, data.files);
				break;
			case MessengerDataTypeGet.REBUILD:
				await this._bundler.rebuild(data.files);
				break;
			default:
				console.warn('Unknown message type:', type);
		}
	}
}
