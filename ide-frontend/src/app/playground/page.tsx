'use client';

import React, { useRef } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import Navbar from '@/components/Navbar';
import FileExplorer from '@/components/Explorer';
import EditorComponent from '@/components/Editor';

const Playground: React.FC = () => {
	const IFrameRef = useRef<HTMLIFrameElement>(null);
	return (
		<div
			style={{
				height: '100vh',
				width: '100vw',
				display: 'flex',
				flexDirection: 'column',
			}}>
			<Navbar />
			<Allotment>
				<Allotment defaultSizes={[1, 4]}>
					<Allotment.Pane snap>
						<div style={{ height: '100vh' }}>
							<FileExplorer iFrameRef={IFrameRef} />
						</div>
					</Allotment.Pane>
					<Allotment vertical defaultSizes={[4, 1]}>
						<Allotment.Pane snap>
							<div style={{ height: '100vh' }}>
								<EditorComponent iFrameRef={IFrameRef} />
							</div>
						</Allotment.Pane>
					</Allotment>
				</Allotment>
				<Allotment.Pane>
					<iframe ref={IFrameRef} title='Monaco Editor' width='100%' height='100%' frameBorder='0' src='http://localhost:5173' />
				</Allotment.Pane>
			</Allotment>
		</div>
	);
};

export default Playground;
