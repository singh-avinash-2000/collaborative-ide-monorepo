import React from 'react';
import Explorer from './components/Explorer';
import { ExplorerContextProvider } from './context/useExplorerContext';
const App = ({ tree, setTree, config = {}, iconMap, onFileSelectionChange, showOptions, options }) => {
    return (React.createElement(ExplorerContextProvider, null,
        React.createElement(Explorer, { tree: tree, setTree: setTree, config: config, iconMap: iconMap, onFileSelectionChange: onFileSelectionChange, showOptions: showOptions, options: options })));
};
export default App;
