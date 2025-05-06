import React, { useState } from 'react';
import styles from './ReviewSelectModal.module.css';
import PropTypes from "prop-types";

const ReviewSelectModal = ({ title, selectedMessage, onSelect, onClose }) => {
    const [open, setOpen] = useState(false);

    const PRESET_MESSAGES = [
        '답장이 빨라요.',
        '시간 약속을 잘 지켜요.',
        '경기 직관이 열정적이에요.',
        '상대방에 대한 배려심이 깊어요.',
        '어색한 분위기를 잘 풀어요.',
        '야구 경기에 박식해요.'
    ];

    return (
        <div className={styles.modal_overlay} onClick={onClose}>
            <div className={styles.modal_box} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.modal_title}>{title}</h3>
                <div className={styles.dropdown_wrapper}>
                    <div className={styles.dropdown_selected} onClick={() => setOpen(!open)}>
                        {selectedMessage || '후기를 선택해 주세요.'}
                        <span className={styles.dropdown_arrow}>{open ? '▲' : '▼'}</span>
                    </div>
                    {open && (
                        <div className={styles.dropdown_list}>
                            {PRESET_MESSAGES.map((msg, i) => (
                                <div
                                    key={i}
                                    className={styles.dropdown_item}
                                    onClick={() => {
                                        onSelect(msg);
                                        setOpen(false);
                                    }}
                                >
                                    {msg}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button className={styles.modal_confirm_button} onClick={onClose}>확인</button>
            </div>
        </div>
    );
};

export default ReviewSelectModal;

ReviewSelectModal.propTypes = {
    title: PropTypes.string.isRequired,
    selectedMessage: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

ReviewSelectModal.defaultProps = {
    selectedMessage: '',
    title: '후기 선택'
};