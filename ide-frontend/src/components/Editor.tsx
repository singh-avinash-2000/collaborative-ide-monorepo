import React, { useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { useGlobalStore } from '@/store/globalStore';

const EditorComponent = ({ iFrameRef }: { iFrameRef: React.RefObject<HTMLIFrameElement | null> }) => {
	const { currentFile, getFileContent, setFileContents, fileContents } = useGlobalStore();
	const monacoRef = useRef<any>(null);

	function handleEditorWillMount(monaco: Monaco) {
		monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
	}

	function handleEditorDidMount(_editor: any, _monaco: any) {
		monacoRef.current = _editor;
	}

	const handleChange = (value: string | undefined, _ev: any) => {
		if (!currentFile) {
			alert('Please select a file to edit.');
			return;
		}

		setFileContents(currentFile?.filePath, value || '');
		iFrameRef.current?.contentWindow?.postMessage({ type: 'Update_Code', files: fileContents }, 'http://localhost:5173');
	};

	return (
		<Editor
			height='90vh'
			defaultLanguage='typescript'
			beforeMount={handleEditorWillMount}
			onMount={handleEditorDidMount}
			onChange={handleChange}
			value={getFileContent(currentFile?.filePath || '') || ''}
			options={{
				codeLens: true,
				autoClosingBrackets: 'always',
				autoClosingQuotes: 'always',
				automaticLayout: true,
				bracketPairColorization: {
					enabled: true,
					independentColorPoolPerBracketType: true,
				},

				wrappingIndent: 'same',
				dragAndDrop: true,
				fontSize: 15,
				formatOnPaste: true,
				formatOnType: true,
				minimap: {
					enabled: true,
					autohide: true,
				},
				smoothScrolling: true,
				scrollbar: {
					horizontal: 'hidden',
					vertical: 'hidden',
				},
				showUnused: true,
			}}
			language='typescript'
		/>
	);
};

export default EditorComponent;
