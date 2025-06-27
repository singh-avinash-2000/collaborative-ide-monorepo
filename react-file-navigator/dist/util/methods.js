export const findNodeById = (nodes, id) => {
    for (const node of nodes) {
        if (node.id === id) {
            return node;
        }
        if (node.type === 'Folder' && node.children) {
            const foundNode = findNodeById(node.children, id);
            if (foundNode) {
                return foundNode;
            }
        }
    }
    return null;
};
export const findParentNodeById = (fileTree, fileId, parent = null) => {
    for (const node of fileTree) {
        if (node.id === fileId) {
            return parent;
        }
        if (node.type === 'Folder' && node.children && node.children.length > 0) {
            const result = findParentNodeById(node.children, fileId, node);
            if (result) {
                return result;
            }
        }
    }
    return null;
};
export const collapseAllNodes = (tree) => {
    return tree.map((item) => {
        if (item.type === 'Folder') {
            return {
                ...item,
                expanded: false,
                icon: 'folderCollapsed',
                children: collapseAllNodes(item.children), // Recursively collapse children
            };
        }
        return item;
    });
};
export const addNewNode = (nodes, currentlySelected, newEntry) => {
    if (!currentlySelected) {
        newEntry.filePath = './' + newEntry.name;
        nodes.push(newEntry);
        return;
    }
    // when selected node is file we add the new node to the parent folder and when its a folder we add to that selected node
    const parentFolder = getTargetNodeBasedOnType(currentlySelected, nodes);
    if (parentFolder) {
        newEntry.filePath = parentFolder.filePath + '/' + newEntry.name;
        parentFolder.expanded = true;
        parentFolder.icon = 'folderExpanded';
        parentFolder.children.push(newEntry);
        return;
    }
    else {
        newEntry.filePath = './' + newEntry.name;
        nodes.push(newEntry);
        return;
    }
};
export const deleteNodeById = (files, fileId) => {
    for (let i = 0; i < files.length; i++) {
        const node = files[i];
        if (node.id === fileId) {
            let response = true;
            if (node.type === 'Folder' && node.children.length > 0) {
                response = confirm('This folder is not empty, you might want to reconsider');
            }
            if (response) {
                files.splice(i, 1);
            }
            return true;
        }
        if (node.type === 'Folder' && node.children && node.children.length > 0) {
            const nodeDeleted = deleteNodeById(node.children, fileId);
            if (nodeDeleted) {
                return true;
            }
        }
    }
    return false;
};
export const getTargetNodeBasedOnType = (node, tree) => {
    return node.type === 'File' ? findParentNodeById(tree, node.id) : findNodeById(tree, node.id);
};
export const isChildrenOfNode = (node, nodeId) => {
    if (!node.children) {
        return false;
    }
    for (const child of node.children) {
        if (child.id === nodeId) {
            return true;
        }
        if (isChildrenOfNode(child, nodeId)) {
            return true;
        }
    }
    return false;
};
export const generateRandomIntID = () => {
    return `${Math.ceil(Math.random() * 9999999999999999)}`;
};
