export type Tree = TreeNode[];
export type IconMap = {
	default: React.ReactNode;
	folderCollapsed: React.ReactNode;
	folderExpanded: React.ReactNode;
	[extension: string]: React.ReactNode;
};
export type TreeNode = FileNode | FolderNode;

export interface FileNode {
	id: string;
	type: 'File';
	filePath: string;
	extension: string;
	icon: string;
	name: string;
	[key: string]: any;
}

export interface FolderNode {
	id: string;
	type: 'Folder';
	filePath: string;
	expanded: boolean;
	icon: 'folderCollapsed' | 'folderExpanded';
	name: string;
	children: TreeNode[];
	[key: string]: any;
}

export interface Option {
	displayName: string;
	action: (node: TreeNode) => any;
}

export interface ExplorerProps {
	tree: Tree;
	setTree: (newTree: TreeNode[]) => void;
	config?: ExplorerConfig;
	iconMap: IconMap;
	onFileSelectionChange: (node: TreeNode | null) => any;
	showOptions?: boolean;
	options?: Option[];
}

export interface ExplorerConfig {
	label?: string;
	rename?: 'DoubleClick' | 'Enter' | 'Both';
	delete?: 'Delete' | 'CMD + Backspace' | 'Both';
	fontColor?: string;
	accentColor?: string;
	headerFontSize?: string;
	headerIconSize?: string;
	fontSize?: string;
	iconSize?: string;
	disableActions?: boolean;
}
