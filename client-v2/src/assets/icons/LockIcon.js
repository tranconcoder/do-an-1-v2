import React from 'react';

const LockIcon = ({ width = '16', height = '16', ...props }) => (
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
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

export default LockIcon;
