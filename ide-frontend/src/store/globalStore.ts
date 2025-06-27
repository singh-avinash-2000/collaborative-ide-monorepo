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

export const useGlobalStore = create<ExplorerState & ModelState>()(
	persist(
		(set, get) => ({
			currentFile: null,
			fileTree: [],
			fileContents: {},
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
