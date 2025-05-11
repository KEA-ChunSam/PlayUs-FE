import React, { useState } from 'react';
import styles from './WithdrawalModal.module.css';

const WithdrawalModal = ({ nickname, onCancel, onWithdraw }) => {
  const [reason, setReason] = useState('');
  const [agreed, setAgreed] = useState(false);
  const reasons = [
    '원하는 기능이 없어요',
    '야구에 관심 없어졌어요',
    '비매너 사용자를 만났어요',
    '기타'
  ];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onCancel}>×</button>
        <div className={styles.messageBox}>
          <p className={styles.headline}><strong>{nickname}님, 탈퇴하신다니 너무 아쉬워요 🥺</strong></p>
          <p className={styles.subtext}>
            지금 탈퇴하시면 커뮤니티, 직관팟, 승부예측, 직관일지 등의 PlayUs의 기능을 사용할 수 없어요
          </p>
        </div>

        <label className={styles.label}>탈퇴하려는 이유가 궁금해요</label>
        <select className={styles.select} value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">선택해주세요</option>
          {reasons.map((r, i) => <option key={i} value={r}>{r}</option>)}
        </select>

        <p className={styles.notice}>
          <span className={styles.red}>회원정보 및 서비스 이용기록은 모두 삭제</span>되며, 탈퇴 후 30일 경과 이후에는
          <br />재사용 및 복구가 <strong>불가</strong>하오니 신중하게 선택해주세요.
        </p>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          안내사항을 모두 읽었으며, 탈퇴하겠습니다
        </label>

        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onCancel}>계정 유지하기</button>
          <button
            className={styles.withdrawButton}
            onClick={onWithdraw}
            disabled={!reason || !agreed}
          >
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;
