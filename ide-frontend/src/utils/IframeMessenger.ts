export enum MessengerDataTypePost {
	REBUILD = 'rebuild',
	INITIALIZE = 'initialize',
}

interface IMessengerData {
	type: MessengerDataTypePost;
	data: any;
}

export class IframeMessenger {
	private constructor() {}

	private _baseURl: string = 'http://localhost:5173';
	private static _messenger: HTMLIFrameElement;
	private static _instance: IframeMessenger | null = null;

	public static getInstance() {
		if (!this._instance) {
			throw new Error('Create an instance first');
		}
		return this._instance;
	}

	public static createInstance(iFrameWindow: HTMLIFrameElement) {
		if (this._instance) {
			console.log('Instance already exits');
			return this._instance;
		}

		this._messenger = iFrameWindow;
		this._instance = new IframeMessenger();
		return this._instance;
	}

	public sendMessage(message: IMessengerData) {
		if (IframeMessenger._messenger) {
			IframeMessenger._messenger.contentWindow?.postMessage(message, this._baseURl);
		}
	}
}
