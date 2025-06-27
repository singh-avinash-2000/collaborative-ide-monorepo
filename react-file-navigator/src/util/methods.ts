import { Tree, FolderNode, TreeNode } from './types';

export const findNodeById = (nodes: Tree, id: string): TreeNode | null => {
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

export const findParentNodeById = (fileTree: Tree, fileId: string, parent: FolderNode | null = null): FolderNode | null => {
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

export const collapseAllNodes = (tree: Tree): Tree => {
	return tree.map((item: TreeNode): TreeNode => {
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

export const addNewNode = (nodes: Tree, currentlySelected: TreeNode | null, newEntry: TreeNode): void => {
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
	} else {
		newEntry.filePath = './' + newEntry.name;
		nodes.push(newEntry);
		return;
	}
};

export const deleteNodeById = (files: Tree, fileId: string) => {
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

export const getTargetNodeBasedOnType = (node: TreeNode, tree: Tree): FolderNode | null => {
	return node.type === 'File' ? findParentNodeById(tree, node.id) : (findNodeById(tree, node.id) as FolderNode);
};

export const isChildrenOfNode = (node: TreeNode, nodeId: string): boolean => {
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
