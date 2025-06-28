import { useEffect, useRef, useState } from 'react';
// import { Bundler } from './utils/Bundler';
import { PreviewMessenger } from './utils/PreviewMessenger';
import { ViewManager } from './utils/ViewManager';
function App() {
	const iFrameRef = useRef<HTMLIFrameElement | null>(null);
	const viewer = useRef<ViewManager>(null);
	// const bundler = Bundler.getInstance();

	// const debounce = <F extends (...args: any[]) => void>(func: F, delay: number) => {
	// 	let timeoutId: ReturnType<typeof setTimeout> | null;
	// 	return (...args: Parameters<F>) => {
	// 		if (timeoutId) {
	// 			clearTimeout(timeoutId);
	// 		}
	// 		timeoutId = setTimeout(() => {
	// 			func(...args);
	// 		}, delay);
	// 	};
	// };

	// const debouncedTranspileCode = debounce(async (files: Record<string, string>) => {
	// 	transpileCode(files);
	// }, 100);

	// const transpileCode = async (files: Record<string, string>) => {
	// 	await bundler.rebuild(files);
	// };

	// useEffect(() => {
	// 	// const handleMessage = async (event: MessageEvent) => {
	// 	// 	if (event.origin !== 'http://localhost:3000') return;

	// 	// 	const rootPackages: Record<string, string> = {
	// 	// 		react: '18.2.0',
	// 	// 		'react-dom': '18.2.0',
	// 	// 	};

	// 	// 	if (bundler.isInitialized === false) {
	// 	// 		await bundler.initialize(rootPackages);
	// 	// 	}

	// 	// 	if (event.data.type === 'SET_ENTRY_POINT') {
	// 	// 		bundler.entryPoint = event.data.entryPoint;
	// 	// 		await bundler.initialize(rootPackages);
	// 	// 		return;
	// 	// 	}

	// 	// 	debouncedTranspileCode(event.data.data.files);
	// 	// };

	// 	const messenger = PreviewMessenger.getInstance();
	// 	window.addEventListener('message', (event) => messenger.messageListener(event));
	// 	return () => window.removeEventListener('message', messenger.messageListener);
	// }, []);

	useEffect(() => {
		if (!iFrameRef.current) return;

		viewer.current = ViewManager.createInstance(iFrameRef.current);

		const messenger = PreviewMessenger.getInstance();
		const listener = messenger.messageListener.bind(messenger);

		window.addEventListener('message', listener);

		return () => {
			window.removeEventListener('message', listener);
		};
	}, []);

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				margin: 0,
				padding: 0,
				display: 'flex', // Helps ensure iframe stretches fully
				flexDirection: 'column',
			}}>
			<iframe
				ref={iFrameRef}
				title='Bundled Output'
				sandbox='allow-scripts allow-same-origin'
				src='about:blank'
				style={{
					flex: 1, // Takes all available height
					width: '100%',
					border: 'none',
				}}
			/>
		</div>
	);
}

export default App;
