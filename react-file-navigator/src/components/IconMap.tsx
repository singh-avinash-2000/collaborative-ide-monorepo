import React from 'react';
import { IconMap } from '../util/types';

interface IconMapProps {
	iconName: 'tsx' | 'jsx' | 'js' | 'html' | 'css' | 'scss' | 'folderCollapsed' | 'folderExpanded' | string;
	iconMap: IconMap;
}

const IconMapComponent: React.FC<IconMapProps> = ({ iconName, iconMap }) => {
	const icon = iconMap[iconName] || iconMap.default;
	return <div>{icon}</div>;
};

export default IconMapComponent;
