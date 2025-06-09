import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import classNames from 'classnames/bind';
import styles from './MarkdownEditor.module.scss';
import MarkdownHelper from './MarkdownHelper';

const cx = classNames.bind(styles);

function MarkdownEditor({
    label,
    value,
    onChange,
    placeholder = '',
    required = false,
    helpText = '',
    compact = false,
    height = 200,
    preview = 'edit'
}) {
    const [editorValue, setEditorValue] = useState(value || '');

    useEffect(() => {
        setEditorValue(value || '');
    }, [value]);

    const handleChange = (val) => {
        setEditorValue(val || '');
        if (onChange) {
            onChange(val || '');
        }
    };

    return (
        <div className={cx('markdown-editor-container', { compact })}>
            {label && (
                <label>
                    {label}
                    {required && <span className={cx('required-mark')}>*</span>}
                </label>
            )}

            <div className={cx('editor-wrapper')} data-color-mode="light">
                <MDEditor
                    value={editorValue}
                    onChange={handleChange}
                    preview={preview}
                    height={height}
                    visibleDragBar={false}
                    textareaProps={{
                        placeholder: placeholder,
                        style: {
                            fontSize: '0.95rem',
                            lineHeight: '1.6',
                            fontFamily: 'inherit'
                        }
                    }}
                />
            </div>

            {helpText && (
                <div className={cx('help-text')}>
                    {helpText}
                    <MarkdownHelper />
                </div>
            )}
        </div>
    );
}

export default MarkdownEditor;
