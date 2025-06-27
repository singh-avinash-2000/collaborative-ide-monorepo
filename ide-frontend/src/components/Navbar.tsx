'use client';
import React from 'react';
import { RxCodesandboxLogo } from 'react-icons/rx';

const Navbar: React.FC = () => {
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				margin: 'auto',
			}}>
			<RxCodesandboxLogo size={30} />
			<span style={{ marginInline: 15 }}>workwith.avinashsingh@gmail.com / custom-react-snippet</span>
		</div>
	);
};

export default Navbar;
