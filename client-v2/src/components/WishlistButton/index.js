import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import classNames from 'classnames/bind';
import styles from './WishlistButton.module.scss';
import { useProducts } from '../../configs/ProductsData';

const cx = classNames.bind(styles);

const WishlistButton = ({ productId, className }) => {
    const { isInWishlist, addToWishlist, removeFromWishlist, getProductById } = useProducts();
    const [inWishlist, setInWishlist] = useState(isInWishlist(productId));
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        setInWishlist(isInWishlist(productId));
    }, [isInWishlist, productId]);

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const product = getProductById(productId);

        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);

        if (inWishlist) {
            removeFromWishlist(productId);
            // Tùy chọn: hiển thị thông báo
            // toast(`Đã xóa ${product.name} khỏi danh sách yêu thích`);
        } else {
            addToWishlist(productId);
            // Tùy chọn: hiển thị thông báo
            // toast(`Đã thêm ${product.name} vào danh sách yêu thích`);
        }
    };

    return (
        <button
            className={cx('wishlist-btn', { active: inWishlist, animate: isAnimating }, className)}
            onClick={handleToggleWishlist}
            aria-label={
                inWishlist ? 'Xóa khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'
            }
        >
            <FontAwesomeIcon icon={inWishlist ? faHeartSolid : faHeartRegular} />
        </button>
    );
};

export default WishlistButton;
