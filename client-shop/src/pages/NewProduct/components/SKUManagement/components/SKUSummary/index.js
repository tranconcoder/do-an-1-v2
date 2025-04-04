import React from 'react';
import classNames from 'classnames/bind';
import styles from './SKUSummary.module.scss';

const cx = classNames.bind(styles);

function SKUSummary({ sku, hasVariations, variations }) {
    return (
        <div className={cx('sku-summary')}>
            <h3>Selected Combination</h3>
            {hasVariations ? (
                <div className={cx('selected-options-tags')}>
                    {Object.entries(sku.selected_options || {}).length > 0 ? (
                        Object.entries(sku.selected_options || {}).map(
                            ([varIdx, optIdx]) => {
                                const variation = variations[varIdx];
                                return variation ? (
                                    <span key={varIdx} className={cx('option-tag')}>
                                        {variation.name}: {variation.options[optIdx]}
                                    </span>
                                ) : null;
                            }
                        )
                    ) : (
                        <span className={cx('no-options-selected')}>
                            No options selected
                        </span>
                    )}
                </div>
            ) : (
                <span className={cx('no-variations-defined')}>
                    No variations defined
                </span>
            )}
        </div>
    );
}

export default SKUSummary;
