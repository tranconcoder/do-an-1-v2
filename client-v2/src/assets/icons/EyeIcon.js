import React from 'react';

const EyeIcon = ({ width = '16', height = '16', ...props }) => (
    <svg
        viewBox="0 0 24 24"
        width={width}
        height={height}
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

export default EyeIcon;
