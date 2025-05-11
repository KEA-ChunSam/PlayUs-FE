import React from 'react';
import styles from './Modal.module.css';

const Modal = ({ title, message, buttons }) => {
    //TODO: 차후 취소 버튼 or 모달 닫기 버튼 구현 필요
  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_box}>
        <h3 className={styles.modal_title}>{title}</h3>
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