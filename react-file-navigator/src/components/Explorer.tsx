import React, { useEffect, useMemo, useRef, useState } from 'react';
import { VscCollapseAll, VscNewFile, VscFolderOpened } from 'react-icons/vsc';
import { FileNode, FolderNode, ExplorerProps, TreeNode } from '../util/types';
import { addNewNode, collapseAllNodes, deleteNodeById, findNodeById, findParentNodeById, generateRandomIntID, getTargetNodeBasedOnType, isChildrenOfNode } from '../util/methods';
import FileTree from './FileTree';
import { useExplorerContext } from '../context/useExplorerContext';

const FolderIcon = VscFolderOpened as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FileIcon = VscNewFile as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const CollapseIcon = VscCollapseAll as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

const Explorer: React.FC<ExplorerProps> = ({ tree, setTree, config = { label: 'File Tree', rename: 'Both', delete: 'Both', fontColor: 'black', accentColor: 'lavendar' }, iconMap, onFileSelectionChange, showOptions = false, options = [] }) => {
	const { currentlySelectedNode, setCurrentlySelectedNode, setIsRenameSelected, setRenameNodeId } = useExplorerContext();
	const containerRef = useRef<any>(null);
	const [clickedDiv, setClickedDiv] = useState<string>('');

	const createNewNode = (type: 'File' | 'Folder') => {
		var newNode: TreeNode;
		if (type === 'Folder') {
			newNode = {
				id: generateRandomIntID(),
				type: 'Folder',
				name: '',
				filePath: '',
				expanded: false,
				children: [],
				icon: 'folderCollapsed',
				new: true,
			} as FolderNode;
		} else {
			newNode = {
				id: generateRandomIntID(),
				type: 'File',
				filePath: '',
				extension: '',
				icon: 'default',
				name: '',
				new: true,
			} as FileNode;
		}

		setCurrentlySelectedNode(newNode);
		setIsRenameSelected(true);
		setRenameNodeId(newNode.id);
		addNewNode(tree, currentlySelectedNode, newNode);
		setTree([...tree]);
	};

	const collapseAll = () => {
		const updatedNodes = collapseAllNodes(tree);
		setTree([...updatedNodes]);
	};

	const updateNodeDetails = (newNodeData: TreeNode) => {
		let nodeDetails = findNodeById(tree, currentlySelectedNode?.id!);
		nodeDetails = { ...newNodeData };
		setTree([...tree]);
	};

	const deleteNode = (nodeId: string) => {
		deleteNodeById(tree, nodeId);
		setTree([...tree]);
	};

	const iconStyle = { cursor: 'pointer', ...(config.headerIconSize ? { fontSize: config.headerIconSize } : { fontSize: 20 }) };

	const handleDrop = (e: any, node: TreeNode) => {
		e.stopPropagation();
		e.preventDefault();

		const draggedNode = JSON.parse(e.dataTransfer.getData('application/json'));
		const draggedNodeTo = getTargetNodeBasedOnType(node, tree);
		const draggedNodeFrom = findParentNodeById(tree, draggedNode.id);
		const isChildOfDraggedNode = isChildrenOfNode(draggedNode, draggedNodeTo?.id!);
		if (isChildOfDraggedNode) return;
		if (node.id === draggedNodeFrom?.id) return;
		if (draggedNode.id === draggedNodeTo?.id) return;

		if (draggedNodeFrom && draggedNodeFrom.children) {
			draggedNodeFrom.children = draggedNodeFrom.children.filter((node: TreeNode) => node.id !== draggedNode.id);
		}

		if (draggedNodeFrom === null) {
			tree = tree.filter((node: TreeNode) => node.id !== draggedNode.id);
		}
		draggedNode.filePath = draggedNodeTo?.filePath + `/${draggedNode.name}`;
		draggedNodeTo?.children.push(draggedNode);

		setTree([...tree]);
	};

	const handleRootDrop = (e: any) => {
		const draggedNode = JSON.parse(e.dataTransfer.getData('application/json'));
		const draggedNodeFrom = findParentNodeById(tree, draggedNode.id);
		if (!draggedNodeFrom) {
			return;
		}

		if (draggedNodeFrom && draggedNodeFrom.children) {
			draggedNodeFrom.children = draggedNodeFrom.children.filter((node: TreeNode) => node.id !== draggedNode.id);
		}

		draggedNode.filePath = `./${draggedNode.name}`;
		setTree([...tree, draggedNode]);
	};

	useEffect(() => {
		const handleClickOutside = (event: any) => {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				// setCurrentlySelectedNode(null);
				setClickedDiv('');
			}
		};

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		if (currentlySelectedNode) onFileSelectionChange(currentlySelectedNode!);
	}, [currentlySelectedNode]);

	return (
		<div style={{ color: config.fontColor, height: '100%' }} ref={containerRef}>
			<div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
				<span
					style={{
						marginBlock: 5,
						padding: 0,
						marginInline: 15,
						...(config.headerFontSize ? { fontSize: config.headerFontSize } : { fontSize: 16 }),
					}}>
					{config.label}
				</span>
				{!config.disableActions && (
					<div
						style={{
							minWidth: '30%',
							maxWidth: '100%',
							alignItems: 'center',
							display: 'flex',
							justifyContent: 'space-evenly',
						}}>
						<FolderIcon style={iconStyle} onClick={() => createNewNode('Folder')} />
						<FileIcon
							style={iconStyle}
							onClick={() => {
								createNewNode('File');
							}}
						/>
						<CollapseIcon style={iconStyle} onClick={() => collapseAll()} />
					</div>
				)}
			</div>
			<div onDrop={(e) => handleRootDrop(e)} onDragOver={(e) => e.preventDefault()} style={{ height: '100%' }}>
				<FileTree tree={tree} updateNodeDetails={updateNodeDetails} deleteNode={deleteNode} config={config} iconMap={iconMap} handleDrop={handleDrop} clickedDiv={clickedDiv} setClickedDiv={setClickedDiv} showOptions={showOptions} options={options} />
			</div>
		</div>
	);
};

export default Explorer;
