import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './HomeCategory.module.scss';

// const cx = classNames.bind(styles);
// const HomeCategory = () => {
//     return (
//         <section className={cx('category-section')}>
//             <div className={cx('section-header')}>
//                 <h2 className={cx('section-title')}>Shop by Category</h2>
//                 <p className={cx('section-subtitle')}>
//                     Explore our wide range of products by category
//                 </p>
//             </div>

//             <div className={cx('category-grid')}>
//                 {categories.map((category) => (
//                     <Link
//                         to={`/category/${category.slug}`}
//                         key={category.id}
//                         className={cx('category-item')}
//                     >
//                         <div className={cx('category-image-container')}>
//                             <img
//                                 src={category.image}
//                                 alt={category.name}
//                                 className={cx('category-image')}
//                             />
//                         </div>
//                         <h3 className={cx('category-name')}>{category.name}</h3>
//                     </Link>
//                 ))}

//                 {/* View All Categories item */}
//                 <Link to="/categories" className={cx('category-item', 'view-all-item')}>
//                     <div className={cx('view-all-container')}>
//                         <div className={cx('view-all-icon')}>
//                             <span>+</span>
//                         </div>
//                     </div>
//                     <h3 className={cx('category-name')}>View All Categories</h3>
//                 </Link>
//             </div>
//         </section>
//     );
// };

// export default HomeCategory;
