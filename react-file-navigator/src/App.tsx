import React from 'react';
import Explorer from './components/Explorer';
import { ExplorerContextProvider } from './context/useExplorerContext';
import { ExplorerProps } from './util/types';

const App: React.FC<ExplorerProps> = ({ tree, setTree, config = {}, iconMap, onFileSelectionChange, showOptions, options }) => {
	return (
		<ExplorerContextProvider>
			<Explorer tree={tree} setTree={setTree} config={config} iconMap={iconMap} onFileSelectionChange={onFileSelectionChange} showOptions={showOptions} options={options} />
		</ExplorerContextProvider>
	);
};

export default App;
