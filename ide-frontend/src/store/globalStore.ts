import { FileNode, Tree } from 'react-file-navigator';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExplorerState {
	currentFile: FileNode | null;
	fileTree: Tree;
	entryPoint: string;
	setCurrentFile: (file: FileNode | null) => void;
	setFileTree: (newTree: Tree) => void;
	setEntryPoint: (node: FileNode) => void;
}

export interface ModelState {
	fileContents: Record<string, string>;
	setFileContents: (filePath: string, content: string) => void;
	getFileContent: (filePath: string) => string | undefined;
}

const defaultValues = {
	fileContents: {
		'./index.html': '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <link rel="stylesheet" href="src/style.css">\n  </head>\n  <body>\n    <div id="root"></div>\n\n    <script src="src/index2.tsx"></script>\n  </body>\n</html>',
		'./package.json': '{\n  "dependencies": {\n    "react": "18.0.0",\n    "react-dom": "18.0.0",\n    "react-redux": "8.0.2",\n    "@reduxjs/toolkit": "1.8.3"\n  }\n}',
		'./src/index.tsx': "import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\n\nconst container = document.getElementById('root')!;\nconst root = createRoot(container);\n\nroot.render(\n  <React.StrictMode>\n      <App />\n  </React.StrictMode>\n);\n",
		'./src/App.tsx': 'import React from "react";\n\nexport default App = () => {\n  return (<h1> avinash singh </h1>);\n}',
	},
	fileTree: [
		{
			id: '1455657581022543',
			type: 'File',
			filePath: './index.html',
			extension: 'html',
			icon: 'html',
			name: 'index.html',
		},
		{
			id: '4736178704888742',
			type: 'File',
			filePath: './package.json',
			extension: 'json',
			icon: 'json',
			name: 'package.json',
		},
		{
			id: '1642976358772309',
			type: 'Folder',
			name: 'src',
			filePath: './src',
			expanded: true,
			children: [
				{
					id: '3700474563723490',
					type: 'File',
					filePath: './src/index.tsx',
					extension: 'tsx',
					icon: 'tsx',
					name: 'index.tsx',
				},
				{
					id: '2573601255833667',
					type: 'File',
					filePath: './src/App.tsx',
					extension: 'tsx',
					icon: 'tsx',
					name: 'App.tsx',
				},
			],
			icon: 'folderExpanded',
		},
	],
};

export const useGlobalStore = create<ExplorerState & ModelState>()(
	persist(
		(set, get) => ({
			currentFile: {
				id: '2573601255833667',
				type: 'File',
				filePath: './src/App.tsx',
				extension: 'tsx',
				icon: 'tsx',
				name: 'App.tsx',
			},
			fileTree: defaultValues.fileTree as Tree,
			fileContents: defaultValues.fileContents,
			setCurrentFile: (file: FileNode | null) => set((state) => (state.currentFile !== file ? { currentFile: file } : state)),
			setFileTree: (newTree: Tree) => set(() => ({ fileTree: newTree })),
			setFileContents: (filePath: string, content: string) =>
				set((state) => {
					state.fileContents[filePath] = content;
					return state;
				}),
			getFileContent: (filePath: string) => {
				const { fileContents } = get();
				return fileContents[filePath];
			},
			entryPoint: './main.tsx', //Default entry point
			setEntryPoint: (newEntryPoint: FileNode) => set(() => ({ entryPoint: newEntryPoint.filePath })),
		}),
		{
			name: 'global-store', // 🔒 Storage key name in localStorage
			partialize: (state) => ({
				fileContents: state.fileContents,
				currentFile: state.currentFile,
				fileTree: state.fileTree,
			}),
		}
	)
);
