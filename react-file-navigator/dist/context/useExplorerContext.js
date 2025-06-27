import React, { createContext, useContext, useState } from 'react';
const defaultValue = {
    tree: [],
    currentlySelectedNode: null,
    isRenameSelected: false,
    renameNodeId: null,
    setCurrentlySelectedNode: () => { },
    setIsRenameSelected: () => { },
    setTree: () => { },
    setRenameNodeId: () => { },
};
const ExplorerContext = createContext(defaultValue);
export const ExplorerContextProvider = ({ children }) => {
    const [currentlySelectedNode, setCurrentlySelectedNode] = useState(null);
    const [isRenameSelected, setIsRenameSelected] = useState(false);
    const [renameNodeId, setRenameNodeId] = useState(null);
    const [tree, setTree] = useState([]);
    const value = {
        currentlySelectedNode,
        isRenameSelected,
        renameNodeId,
        tree,
        setTree,
        setIsRenameSelected,
        setCurrentlySelectedNode,
        setRenameNodeId,
    };
    return React.createElement(ExplorerContext.Provider, { value: value }, children);
};
export const useExplorerContext = () => useContext(ExplorerContext);
