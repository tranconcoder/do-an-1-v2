import React from 'react';

const CartIcon = ({ width = '20', height = '20', ...props }) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        {...props}
    >
        <path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path>
        <path d="M20 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
);

export default CartIcon;
