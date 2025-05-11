import React, { useState } from 'react';
import styles from './ProfileEditModal.module.css';

const ProfileEditModal = ({ onClose, onSubmit }) => {
  const [nickname, setNickname] = useState('ZSJ');
  const [validationMessage, setValidationMessage] = useState('사용할 수 있는 닉네임입니다.');
  const [profileImage, setProfileImage] = useState(`${process.env.PUBLIC_URL}/Logo/profile2.png`);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setNickname(value);

    if (value.length < 2 || value.length > 8) {
      setValidationMessage('2~12자의 닉네임을 입력해주세요.');
    } else if (value === 'existing_user') {
      // Replace with real duplication check
      setValidationMessage('이미 사용중인 닉네임입니다.');
    } else {
      setValidationMessage('사용할 수 있는 닉네임입니다.');
    }
  };

  const handleSubmit = () => {
    if (validationMessage !== '사용할 수 있는 닉네임입니다.') return;
    onSubmit(nickname);
    onClose();
  };

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_box}>
        <label htmlFor="profile-image-upload">
          <img
            src={profileImage}
            alt="프로필 사진"
            className={styles.profile_img}
            style={{ cursor: 'pointer' }}
          />
        </label>
        <input
          type="file"
          id="profile-image-upload"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        <div className={styles.input_container}>
          <input
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            className={styles.nickname_input}
          />
          <button className={styles.clear_button} onClick={() => setNickname('')}>×</button>
        </div>
        <div className={
          validationMessage === '사용할 수 있는 닉네임입니다.'
            ? styles.valid_message
            : styles.error_message
        }>
          {validationMessage}
        </div>
        <button className={styles.confirm_button} onClick={handleSubmit}>수정 완료</button>
      </div>
    </div>
  );
};

export default ProfileEditModal;