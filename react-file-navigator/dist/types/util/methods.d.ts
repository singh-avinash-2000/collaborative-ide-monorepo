import { Tree, FolderNode, TreeNode } from './types';
export declare const findNodeById: (nodes: Tree, id: string) => TreeNode | null;
export declare const findParentNodeById: (fileTree: Tree, fileId: string, parent?: FolderNode | null) => FolderNode | null;
export declare const collapseAllNodes: (tree: Tree) => Tree;
export declare const addNewNode: (nodes: Tree, currentlySelected: TreeNode | null, newEntry: TreeNode) => void;
export declare const deleteNodeById: (files: Tree, fileId: string) => boolean;
export declare const getTargetNodeBasedOnType: (node: TreeNode, tree: Tree) => FolderNode | null;
export declare const isChildrenOfNode: (node: TreeNode, nodeId: string) => boolean;
export declare const generateRandomIntID: () => string;
