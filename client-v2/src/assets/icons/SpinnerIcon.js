import React from 'react';

const SpinnerIcon = ({ width = '16', height = '16', ...props }) => (
    <svg
        viewBox="0 0 24 24"
        width={width}
        height={height}
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        {...props}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2a10 10 0 0 1 10 10"></path>
    </svg>
);

export default SpinnerIcon;
