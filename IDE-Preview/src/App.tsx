import { useEffect, useRef } from 'react';
import { Bundler } from './utils/Bundler';
function App() {
	const iFrameRef = useRef<HTMLIFrameElement | null>(null);
	const bundler = Bundler.getInstance();

	const debounce = <F extends (...args: any[]) => void>(func: F, delay: number) => {
		let timeoutId: ReturnType<typeof setTimeout> | null;
		return (...args: Parameters<F>) => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			timeoutId = setTimeout(() => {
				func(...args);
			}, delay);
		};
	};

	const debouncedTranspileCode = debounce(async (files: Record<string, string>) => {
		transpileCode(files);
	}, 0);

	const transpileCode = async (files: Record<string, string>) => {
		let result: string | undefined;
		result = await bundler.bundle(files);

		updatePreview(result || '');
	};

	const updatePreview = (content: string) => {
		const iframe = iFrameRef.current;
		if (iframe) {
			const iframeWindow = iframe.contentWindow;

			if (iframeWindow) {
				// Capture the current route inside the iframe
				const currentIframeRoute = iframeWindow.location.hash || iframeWindow.location.pathname;

				const doc = iframeWindow.document;
				if (doc) {
					doc.open();
					doc.write(content); // Write the new content into the iframe
					doc.close();

					if (currentIframeRoute && currentIframeRoute != 'blank') {
						iframeWindow.history.replaceState(null, '', currentIframeRoute);
					}
				}
			}
		}
	};

	useEffect(() => {
		const handleMessage = async (event: MessageEvent) => {
			if (event.origin !== 'http://localhost:3000') return;

			if (bundler.isInitialized === false) {
				const rootPackages: Record<string, string> = {
					react: '18.2.0',
					'react-dom': '18.2.0',
				};
				await bundler.initialize(rootPackages);
			}

			if (event.data.type === 'SET_ENTRY_POINT') {
				bundler.entryPoint = event.data.entryPoint;
			}

			debouncedTranspileCode(event.data.files);
		};

		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, []);

	return (
		<div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
			<iframe
				ref={iFrameRef}
				style={{
					width: '100vw',
					height: '100vh',
					border: 'none',
				}}
				title='Bundled Output'
				src='about:blank'
				sandbox='allow-scripts allow-same-origin'
			/>
		</div>
	);
}

export default App;
