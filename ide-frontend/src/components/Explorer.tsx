import React, { RefObject } from 'react';
import { Explorer, IconMap, ExplorerConfig, TreeNode } from 'react-file-navigator';
import { IoLogoCss3, IoLogoReact, IoLogoHtml5, IoLogoSass, IoDocumentText } from 'react-icons/io5';
import { IoLogoJavascript } from 'react-icons/io';
import { FaCaretDown, FaCaretRight } from 'react-icons/fa6';
import { useGlobalStore } from '@/store/globalStore';

interface FileExplorerProps {
	iFrameRef: RefObject<HTMLIFrameElement | null>;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ iFrameRef }) => {
	const { fileTree, setFileTree, setCurrentFile, setEntryPoint } = useGlobalStore();

	const handleFileSelectionChange = (currentFile: TreeNode | null) => {
		console.log('File selection changed:', currentFile);
		if (currentFile?.type === 'File') {
			setCurrentFile(currentFile);
		}
	};

	const iconMap: IconMap = {
		tsx: <IoLogoReact />,
		jsx: <IoLogoReact />,
		js: <IoLogoJavascript />,
		html: <IoLogoHtml5 />,
		css: <IoLogoCss3 />,
		scss: <IoLogoSass />,
		default: <IoDocumentText />,
		folderCollapsed: <FaCaretRight />,
		folderExpanded: <FaCaretDown />,
	};

	const config: ExplorerConfig = {
		accentColor: 'lavender',
		label: 'EXPLORER',
	};

	const updateApplicationEntryPoint = (node: TreeNode) => {
		if (node.type !== 'File') {
			console.error('Selected node is not a file.');
			return;
		}
		iFrameRef?.current?.contentWindow?.postMessage({ type: 'SET_ENTRY_POINT', entryPoint: node.filePath }, 'http://localhost:5173');
		setEntryPoint(node);
	};

	const options = [
		{
			displayName: 'Set Entry Point',
			action: updateApplicationEntryPoint,
		},
	];

	return <Explorer tree={fileTree} setTree={setFileTree} onFileSelectionChange={(node) => handleFileSelectionChange(node)} iconMap={iconMap} config={config} showOptions={true} options={options} />;
};

export default FileExplorer;
