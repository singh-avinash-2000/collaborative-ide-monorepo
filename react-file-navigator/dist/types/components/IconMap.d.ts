import React from 'react';
import { IconMap } from '../util/types';
interface IconMapProps {
    iconName: 'tsx' | 'jsx' | 'js' | 'html' | 'css' | 'scss' | 'folderCollapsed' | 'folderExpanded' | string;
    iconMap: IconMap;
}
declare const IconMapComponent: React.FC<IconMapProps>;
export default IconMapComponent;
