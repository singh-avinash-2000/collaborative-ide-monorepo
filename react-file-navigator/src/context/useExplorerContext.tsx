import React, { createContext, useContext, useState } from 'react';
import { Tree, TreeNode } from '../util/types';

interface ExplorerContextProps {
	currentlySelectedNode: TreeNode | null;
	isRenameSelected: boolean;
	renameNodeId: string | null;
	tree: Tree;
	setTree: React.Dispatch<React.SetStateAction<Tree>>;
	setIsRenameSelected: React.Dispatch<React.SetStateAction<boolean>>;
	setCurrentlySelectedNode: React.Dispatch<React.SetStateAction<TreeNode | null>>;
	setRenameNodeId: React.Dispatch<React.SetStateAction<string | null>>;
}

const defaultValue: ExplorerContextProps = {
	tree: [],
	currentlySelectedNode: null,
	isRenameSelected: false,
	renameNodeId: null,
	setCurrentlySelectedNode: () => {},
	setIsRenameSelected: () => {},
	setTree: () => {},
	setRenameNodeId: () => {},
};

const ExplorerContext = createContext(defaultValue);

export const ExplorerContextProvider = ({ children }: { children: any }) => {
	const [currentlySelectedNode, setCurrentlySelectedNode] = useState<TreeNode | null>(null);
	const [isRenameSelected, setIsRenameSelected] = useState<boolean>(false);
	const [renameNodeId, setRenameNodeId] = useState<string | null>(null);
	const [tree, setTree] = useState<Tree>([]);

	const value: ExplorerContextProps = {
		currentlySelectedNode,
		isRenameSelected,
		renameNodeId,
		tree,
		setTree,
		setIsRenameSelected,
		setCurrentlySelectedNode,
		setRenameNodeId,
	};

	return <ExplorerContext.Provider value={value}>{children}</ExplorerContext.Provider>;
};

export const useExplorerContext = () => useContext(ExplorerContext);
