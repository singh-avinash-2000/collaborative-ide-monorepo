import React, { useEffect, useRef, useState } from 'react';
import IconMapComponent from './IconMap';
import { useExplorerContext } from '../context/useExplorerContext';
import { SlOptions } from 'react-icons/sl';
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

function isValidFileName(fileName: string) {
	if (!fileName) return false;
	const fileNameRegex = /^[^\\/:\*\?"<>\|]+$/;
	return fileNameRegex.test(fileName);
}

const ElipsisIcon = SlOptions as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

const FileTree: React.FC<FileTreeProps> = React.memo(({ tree, updateNodeDetails, deleteNode, config, iconMap, handleDrop, clickedDiv, setClickedDiv, showOptions, options }) => {
	const { setCurrentlySelectedNode, renameNodeId, isRenameSelected, currentlySelectedNode, setRenameNodeId, setIsRenameSelected } = useExplorerContext();

	const [mouseOverNode, setMouseOverNode] = useState<string | null>(null);
	const renameInputRef = useRef<HTMLInputElement | null>(null);
	const [expandOptions, setExpandOptions] = useState(false);
	const ellipsisRef = useRef<SVGSVGElement>(null);
	const handleSingleClick = (node: TreeNode, idx: number) => {
		if (renameNodeId === node.id) return;
		setCurrentlySelectedNode(node);
		setClickedDiv(node.id);
		if (node.type === 'File') return;

		tree[idx].expanded = !node.expanded;
		tree[idx].icon = node.expanded ? 'folderExpanded' : 'folderCollapsed';
		updateNodeDetails(tree[idx]);
	};

	const handleDoubleClick = (node: TreeNode) => {
		if (config.rename === 'Both' || config.rename === 'DoubleClick' || !config.rename) {
			setIsRenameSelected(true);
			setCurrentlySelectedNode(node);
			setRenameNodeId(node.id);
		}
	};

	const renameNode = (idx: number) => {
		let fileName = renameInputRef.current?.value!;
		fileName = fileName.replace(/[\\/]/g, '');
		if (!isValidFileName || fileName === tree[idx].name) return;

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

	const handleFileRename = (event: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>, idx: number) => {
		event.stopPropagation();
		if (event.key === 'Enter') {
			renameNode(idx);
		}
	};

	const enableRenameAndDeleteForSelectedNode = (e: React.KeyboardEvent<HTMLDivElement>, node: TreeNode) => {
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

	const checkForDeleteCondition = (idx: number) => {
		const fileName = renameInputRef.current?.value!;
		if (tree[idx].new && !fileName) {
			deleteNode(tree[idx].id);
		}
	};

	const handleBlur = (idx: number) => {
		checkForDeleteCondition(idx);
		renameNode(idx);
		setRenameNodeId(null);
		setIsRenameSelected(false);
	};

	const handleDragStart = (e: any, node: TreeNode) => {
		e.stopPropagation();
		e.dataTransfer.setData('application/json', JSON.stringify(node));
	};

	const handleDragOver = (e: any) => {
		e.preventDefault();
	};

	useEffect(() => {
		if (isRenameSelected) {
			renameInputRef.current?.focus();
			renameInputRef.current?.select();
		}
	}, [isRenameSelected]);

	return (
		<div draggable style={{ color: config.fontColor ?? 'black', fontSize: config.fontSize ?? '14px' }}>
			{tree.map((node: TreeNode, index: number) => {
				return (
					<div style={{ paddingInline: 5, paddingBlock: 3, borderLeft: '1px dotted gray' }} key={node.id} draggable onDragStart={(e) => handleDragStart(e, node)} onDragOver={(e) => handleDragOver(e)} onDrop={(e) => handleDrop(e, node)}>
						<div
							style={{
								cursor: 'pointer',
								display: 'flex',
								width: '100%',
								...(clickedDiv === node.id ? { border: '1px solid blue' } : {}),
								...(currentlySelectedNode?.id === node.id ? { backgroundColor: config.accentColor ? `${config.accentColor}` : 'lavender' } : {}),
								...(mouseOverNode === node.id ? { backgroundColor: config.accentColor ? `${config.accentColor}` : 'lavender' } : {}),
							}}
							tabIndex={1}
							onClick={() => handleSingleClick(node, index)}
							onDoubleClick={() => handleDoubleClick(node)}
							onMouseEnter={() => setMouseOverNode(node.id)}
							onMouseLeave={() => setMouseOverNode(null)}
							onKeyDown={(e) => enableRenameAndDeleteForSelectedNode(e, node)}>
							{isRenameSelected && node.id === renameNodeId ? (
								<input type='text' defaultValue={node.name} placeholder='Enter Name' ref={renameInputRef} onKeyDown={(e) => handleFileRename(e, index)} onBlur={() => handleBlur(index)} />
							) : (
								<div style={{ display: 'flex', justifyContent: 'space-between', width: '90%', position: 'relative' }}>
									<div style={{ display: 'flex' }}>
										<span style={{ marginRight: 5 }}>
											<IconMapComponent iconName={node.icon} iconMap={iconMap} />
										</span>
										<span>{node.name}</span>
									</div>
									{mouseOverNode === node.id && showOptions && (
										<ElipsisIcon
											onClick={(e) => {
												setExpandOptions((prev) => !prev);
												e.stopPropagation();
											}}
											ref={ellipsisRef}
											style={{
												cursor: 'pointer',
												fontSize: '18px',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												transition: 'background 0.2s',
											}}
										/>
									)}
									{expandOptions && mouseOverNode === node.id && (
										<div
											style={{
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
											}}>
											{options.map((option, idx) => (
												<div
													key={idx}
													style={{ padding: '8px 12px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '14px', color: '#333' }}
													onClick={() => {
														setExpandOptions(false);
														option.action(node);
													}}
													onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f0f0')}
													onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
													{option.displayName}
												</div>
											))}
										</div>
									)}
								</div>
							)}
						</div>

						{node.type === 'Folder' && node.children.length > 0 && node.expanded && (
							<>
								<div style={{ marginLeft: 15 }}>{node.type === 'Folder' && node.children.length > 0 && <FileTree key={node.id} tree={node.children} updateNodeDetails={updateNodeDetails} deleteNode={deleteNode} config={config} iconMap={iconMap} handleDrop={handleDrop} clickedDiv={clickedDiv} setClickedDiv={setClickedDiv} showOptions={showOptions} options={options} />}</div>
							</>
						)}
					</div>
				);
			})}
		</div>
	);
});

export default FileTree;
