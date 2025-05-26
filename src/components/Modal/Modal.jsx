// 메인 베이직 모달 컴포넌트
import React, {useEffect, useRef} from 'react';
import styles from './Modal.module.css';

const Modal = ({title, message, buttons, onClose}) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);
    return (
        <div className={styles.modal_overlay}>
            <div
                className={styles.modal_box}
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <h3 id="modal-title" className={styles.modal_title}>{title}</h3>
                <p className={styles.modal_message}>{message}</p>
                {buttons && buttons.length > 0 && (
                    <div className={styles.modal_button_group}>
                        {buttons.map((btn, i) => (
                            <button
                                key={i}
                                className={styles.modal_confirm_button}
                                onClick={btn.onClick}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;