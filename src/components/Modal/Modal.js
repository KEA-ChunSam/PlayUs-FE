

import React from 'react';
import './Modal.css';

const Modal = ({ title, message, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <button className="modal-confirm-button" onClick={onClose}>확인</button>
      </div>
    </div>
  );
};

export default Modal;