import React, { useState } from 'react';
import styles from './ProfileEditModal.module.css';

const ProfileEditModal = ({ nickname, onCancel, onSave }) => {
  const [newNickname, setNewNickname] = useState(nickname);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(newNickname);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>프로필 수정</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>닉네임</label>
            <input
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" onClick={onCancel} className={styles.cancelButton}>
              취소
            </button>
            <button type="submit" className={styles.saveButton}>
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal; 