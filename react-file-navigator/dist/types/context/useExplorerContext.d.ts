import React from 'react';
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
export declare const ExplorerContextProvider: ({ children }: {
    children: any;
}) => React.JSX.Element;
export declare const useExplorerContext: () => ExplorerContextProps;
export {};
