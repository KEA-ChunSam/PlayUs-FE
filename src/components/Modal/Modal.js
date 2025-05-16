// 메인 베이직 모달 컴포넌트
import React, { useEffect, useRef } from 'react';
import FocusTrap from 'focus-trap-react';
import styles from './Modal.module.css';

const Modal = ({ title, message, buttons, onClose }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    return (
        <FocusTrap>
            <div 
                className={styles.modal_overlay}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                ref={modalRef}
            >
                <div className={styles.modal_box}>
                    <h3 id="modal-title" className={styles.modal_title}>{title}</h3>
                    <p className={styles.modal_message}>{message}</p>
                    <div className={styles.modal_button_group}>
                        {buttons && buttons.length > 0 && buttons.map((btn, i) => (
                            <button
                                key={i}
                                className={styles.modal_confirm_button}
                                onClick={btn.onClick}
                            >
                                {btn.label}
                            </button>
                        ))}
                        <button
                            className={styles.modal_close_button}
                            onClick={onClose}
                            aria-label="모달 닫기"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        </FocusTrap>
    );
};

export default Modal;