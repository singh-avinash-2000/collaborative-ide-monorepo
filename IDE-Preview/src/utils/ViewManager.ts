export class ViewManager {
	private constructor() {}
	private static _iFrame: HTMLIFrameElement;
	private static _instance: ViewManager | null;

	public static createInstance(iFrame: HTMLIFrameElement) {
		if (this._iFrame) {
			console.log('Instance already exists');
			return this._instance;
		}

		this._iFrame = iFrame;
		this._instance = new ViewManager();
		return this._instance;
	}

	public static getInstance() {
		if (!this._instance) {
			throw new Error('Create an instance first');
		}

		return this._instance;
	}

	public updatePreview(content: string | undefined) {
		const iframeWindow = ViewManager._iFrame.contentWindow;

		if (iframeWindow) {
			// Capture the current route inside the iframe
			const currentIframeRoute = iframeWindow.location.hash || iframeWindow.location.pathname;

			const doc = iframeWindow.document;
			if (doc) {
				doc.open();
				doc.write(content || ''); // Write the new content into the iframe
				doc.close();

				if (currentIframeRoute && currentIframeRoute != 'blank') {
					iframeWindow.history.replaceState(null, '', currentIframeRoute);
				}
			}
		}
	}
}
