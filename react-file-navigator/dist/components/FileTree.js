import React, { useEffect, useRef, useState } from 'react';
import IconMapComponent from './IconMap';
import { useExplorerContext } from '../context/useExplorerContext';
import { SlOptions } from 'react-icons/sl';
function isValidFileName(fileName) {
    if (!fileName)
        return false;
    const fileNameRegex = /^[^\\/:\*\?"<>\|]+$/;
    return fileNameRegex.test(fileName);
}
const ElipsisIcon = SlOptions;
const FileTree = React.memo(({ tree, updateNodeDetails, deleteNode, config, iconMap, handleDrop, clickedDiv, setClickedDiv, showOptions, options }) => {
    const { setCurrentlySelectedNode, renameNodeId, isRenameSelected, currentlySelectedNode, setRenameNodeId, setIsRenameSelected } = useExplorerContext();
    const [mouseOverNode, setMouseOverNode] = useState(null);
    const renameInputRef = useRef(null);
    const [expandOptions, setExpandOptions] = useState(false);
    const ellipsisRef = useRef(null);
    const handleSingleClick = (node, idx) => {
        if (renameNodeId === node.id)
            return;
        setCurrentlySelectedNode(node);
        setClickedDiv(node.id);
        if (node.type === 'File')
            return;
        tree[idx].expanded = !node.expanded;
        tree[idx].icon = node.expanded ? 'folderExpanded' : 'folderCollapsed';
        updateNodeDetails(tree[idx]);
    };
    const handleDoubleClick = (node) => {
        if (config.rename === 'Both' || config.rename === 'DoubleClick' || !config.rename) {
            setIsRenameSelected(true);
            setCurrentlySelectedNode(node);
            setRenameNodeId(node.id);
        }
    };
    const renameNode = (idx) => {
        let fileName = renameInputRef.current?.value;
        fileName = fileName.replace(/[\\/]/g, '');
        if (!isValidFileName || fileName === tree[idx].name)
            return;
        let fileNameBrokenArray = fileName.split('.');
        const filePath = tree[idx].filePath.split('/');
        filePath[filePath.length - 1] = fileName;
        tree[idx].name = fileName;
        tree[idx].filePath = filePath.join('/');
        delete tree[idx].new;
        if (tree[idx].type === 'File') {
            const extension = fileNameBrokenArray[fileNameBrokenArray.length - 1];
            tree[idx].extension = extension;
            tree[idx].icon = extension;
        }
        setRenameNodeId(null);
        setIsRenameSelected(false);
        updateNodeDetails(tree[idx]);
        setClickedDiv('');
    };
    const handleFileRename = (event, idx) => {
        event.stopPropagation();
        if (event.key === 'Enter') {
            renameNode(idx);
        }
    };
    const enableRenameAndDeleteForSelectedNode = (e, node) => {
        if (e.key === 'Enter' && !isRenameSelected && (!config.rename || config.rename === 'Both' || config.rename === 'Enter')) {
            setIsRenameSelected(true);
            setCurrentlySelectedNode(node);
            setRenameNodeId(node.id);
        }
        if (e.key === 'Delete' && (!config.delete || config.delete === 'Both' || config.delete === 'Delete')) {
            deleteNode(node.id);
        }
        if ((e.metaKey || e.ctrlKey) && e.keyCode === 8 && (!config.delete || config.delete === 'Both' || config.delete === 'CMD + Backspace')) {
            deleteNode(node.id);
        }
    };
    const checkForDeleteCondition = (idx) => {
        const fileName = renameInputRef.current?.value;
        if (tree[idx].new && !fileName) {
            deleteNode(tree[idx].id);
        }
    };
    const handleBlur = (idx) => {
        checkForDeleteCondition(idx);
        renameNode(idx);
        setRenameNodeId(null);
        setIsRenameSelected(false);
    };
    const handleDragStart = (e, node) => {
        e.stopPropagation();
        e.dataTransfer.setData('application/json', JSON.stringify(node));
    };
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    useEffect(() => {
        if (isRenameSelected) {
            renameInputRef.current?.focus();
            renameInputRef.current?.select();
        }
    }, [isRenameSelected]);
    return (React.createElement("div", { draggable: true, style: { color: config.fontColor ?? 'black', fontSize: config.fontSize ?? '14px' } }, tree.map((node, index) => {
        return (React.createElement("div", { style: { paddingInline: 5, paddingBlock: 3, borderLeft: '1px dotted gray' }, key: node.id, draggable: true, onDragStart: (e) => handleDragStart(e, node), onDragOver: (e) => handleDragOver(e), onDrop: (e) => handleDrop(e, node) },
            React.createElement("div", { style: {
                    cursor: 'pointer',
                    display: 'flex',
                    width: '100%',
                    ...(clickedDiv === node.id ? { border: '1px solid blue' } : {}),
                    ...(currentlySelectedNode?.id === node.id ? { backgroundColor: config.accentColor ? `${config.accentColor}` : 'lavender' } : {}),
                    ...(mouseOverNode === node.id ? { backgroundColor: config.accentColor ? `${config.accentColor}` : 'lavender' } : {}),
                }, tabIndex: 1, onClick: () => handleSingleClick(node, index), onDoubleClick: () => handleDoubleClick(node), onMouseEnter: () => setMouseOverNode(node.id), onMouseLeave: () => setMouseOverNode(null), onKeyDown: (e) => enableRenameAndDeleteForSelectedNode(e, node) }, isRenameSelected && node.id === renameNodeId ? (React.createElement("input", { type: 'text', defaultValue: node.name, placeholder: 'Enter Name', ref: renameInputRef, onKeyDown: (e) => handleFileRename(e, index), onBlur: () => handleBlur(index) })) : (React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', width: '90%', position: 'relative' } },
                React.createElement("div", { style: { display: 'flex' } },
                    React.createElement("span", { style: { marginRight: 5 } },
                        React.createElement(IconMapComponent, { iconName: node.icon, iconMap: iconMap })),
                    React.createElement("span", null, node.name)),
                mouseOverNode === node.id && showOptions && (React.createElement(ElipsisIcon, { onClick: (e) => {
                        setExpandOptions((prev) => !prev);
                        e.stopPropagation();
                    }, ref: ellipsisRef, style: {
                        cursor: 'pointer',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s',
                    } })),
                expandOptions && mouseOverNode === node.id && (React.createElement("div", { style: {
                        position: 'absolute',
                        top: '110%',
                        right: 0,
                        background: '#fff',
                        border: '1px solid #ddd',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        borderRadius: '6px',
                        padding: '6px 0',
                        minWidth: '140px',
                        zIndex: 1000,
                    } }, options.map((option, idx) => (React.createElement("div", { key: idx, style: { padding: '8px 12px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '14px', color: '#333' }, onClick: () => {
                        setExpandOptions(false);
                        option.action(node);
                    }, onMouseEnter: (e) => (e.currentTarget.style.background = '#f0f0f0'), onMouseLeave: (e) => (e.currentTarget.style.background = 'transparent') }, option.displayName)))))))),
            node.type === 'Folder' && node.children.length > 0 && node.expanded && (React.createElement(React.Fragment, null,
                React.createElement("div", { style: { marginLeft: 15 } }, node.type === 'Folder' && node.children.length > 0 && React.createElement(FileTree, { key: node.id, tree: node.children, updateNodeDetails: updateNodeDetails, deleteNode: deleteNode, config: config, iconMap: iconMap, handleDrop: handleDrop, clickedDiv: clickedDiv, setClickedDiv: setClickedDiv, showOptions: showOptions, options: options }))))));
    })));
});
export default FileTree;
