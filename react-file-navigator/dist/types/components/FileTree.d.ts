import React from 'react';
import { Tree, ExplorerConfig, IconMap, TreeNode, Option } from '../util/types';
interface FileTreeProps {
    tree: Tree;
    updateNodeDetails: (newNodeData: TreeNode) => void;
    deleteNode: (idx: string) => void;
    config: ExplorerConfig;
    iconMap: IconMap;
    handleDrop: (e: any, node: TreeNode) => void;
    clickedDiv: string;
    setClickedDiv: React.Dispatch<React.SetStateAction<string>>;
    showOptions: boolean;
    options: Option[];
}
declare const FileTree: React.FC<FileTreeProps>;
export default FileTree;
