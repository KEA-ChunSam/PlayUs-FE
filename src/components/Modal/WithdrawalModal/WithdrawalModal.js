import React from 'react';
import styles from './WithdrawalModal.module.css';

const WithdrawalModal = ({ nickname, onCancel, onWithdraw }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>회원 탈퇴</h2>
        <p className={styles.message}>
          {nickname}님, 정말로 탈퇴하시겠습니까?<br />
          탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.
        </p>
        <div className={styles.buttonGroup}>
          <button onClick={onCancel} className={styles.cancelButton}>
            취소
          </button>
          <button onClick={onWithdraw} className={styles.withdrawButton}>
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal; 