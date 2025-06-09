import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './MarkdownEditor.module.scss';

const cx = classNames.bind(styles);

const MarkdownHelper = () => {
    const [showHelper, setShowHelper] = useState(false);

    const markdownExamples = [
        { syntax: '**Bold text**', description: 'In đậm' },
        { syntax: '*Italic text*', description: 'In nghiêng' },
        { syntax: '# Heading 1', description: 'Tiêu đề cấp 1' },
        { syntax: '## Heading 2', description: 'Tiêu đề cấp 2' },
        { syntax: '- List item', description: 'Danh sách không đánh số' },
        { syntax: '1. Numbered item', description: 'Danh sách có đánh số' },
        { syntax: '[Link text](https://example.com)', description: 'Liên kết' },
        { syntax: '`Code`', description: 'Mã lệnh inline' },
        { syntax: '```\nCode block\n```', description: 'Khối mã lệnh' },
        { syntax: '> Quote', description: 'Trích dẫn' },
        { syntax: '---', description: 'Đường kẻ ngang' }
    ];

    if (!showHelper) {
        return (
            <button
                type="button"
                onClick={() => setShowHelper(true)}
                className={cx('help-toggle')}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#3498db',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    padding: 0
                }}
            >
                Xem hướng dẫn Markdown
            </button>
        );
    }

    return (
        <div
            className={cx('markdown-helper')}
            style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                marginTop: '0.5rem'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem'
                }}
            >
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                    Hướng dẫn sử dụng Markdown
                </h4>
                <button
                    type="button"
                    onClick={() => setShowHelper(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: 0
                    }}
                >
                    ×
                </button>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '0.5rem'
                }}
            >
                {markdownExamples.map((example, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.25rem 0',
                            fontSize: '0.8rem'
                        }}
                    >
                        <code
                            style={{
                                backgroundColor: '#e2e8f0',
                                padding: '0.125rem 0.25rem',
                                borderRadius: '0.25rem',
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                color: '#1e293b'
                            }}
                        >
                            {example.syntax}
                        </code>
                        <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>
                            {example.description}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MarkdownHelper;
