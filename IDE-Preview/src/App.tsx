import { useEffect, useRef } from 'react';
import { PreviewMessenger } from './utils/PreviewMessenger';
import { ViewManager } from './utils/ViewManager';
function App() {
	const iFrameRef = useRef<HTMLIFrameElement | null>(null);
	const viewer = useRef<ViewManager>(null);

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
				display: 'flex',
				flexDirection: 'column',
			}}>
			<iframe
				ref={iFrameRef}
				title='Bundled Output'
				sandbox='allow-scripts allow-same-origin'
				src='about:blank'
				style={{
					flex: 1,
					width: '100%',
					border: 'none',
				}}
			/>
		</div>
	);
}

export default App;
