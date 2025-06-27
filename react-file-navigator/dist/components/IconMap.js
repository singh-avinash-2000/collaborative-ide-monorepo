import React from 'react';
const IconMapComponent = ({ iconName, iconMap }) => {
    const icon = iconMap[iconName] || iconMap.default;
    return React.createElement("div", null, icon);
};
export default IconMapComponent;
