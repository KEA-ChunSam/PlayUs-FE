import React from 'react';
import styles from './Modal.module.css';

const Modal = ({ title, message, onClose }) => {
  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_box}>
        <h3 className={styles.modal_title}>{title}</h3>
        <p className={styles.modal_message}>{message}</p>
        <button className={styles.modal_confirm_button} onClick={onClose}>확인</button>
      </div>
    </div>
  );
};

export default Modal;