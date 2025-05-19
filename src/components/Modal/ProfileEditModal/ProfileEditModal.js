// 프로필 편집 모달 컴포넌트
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import styles from './ProfileEditModal.module.css';

const ProfileEditModal = ({ onClose, onSubmit, initialNickname }) => {
    const [nickname, setNickname] = useState(initialNickname);
    const [validationMessage, setValidationMessage] = useState('사용할 수 있는 닉네임입니다.');
    const [isValid, setIsValid] = useState(true);
    const [profileImage, setProfileImage] = useState(`${process.env.PUBLIC_URL}/profile/user2.jpg`);
    const [objectUrl, setObjectUrl] = useState(null);

    useEffect(() => {
        setNickname(initialNickname);
    }, [initialNickname]);

    useEffect(() => {
        // 컴포넌트 언마운트 시 객체 URL 해제
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
            setObjectUrl(imageUrl);
        }
    };

    const handleNicknameChange = (e) => {
        const value = e.target.value;
        setNickname(value);

        if (value.length < 2 || value.length > 8) {
            setValidationMessage('2~8자의 닉네임을 입력해주세요.');
            setIsValid(false);
        } else if (value === 'existing_user') {
            // Replace with real duplication check
            setValidationMessage('이미 사용중인 닉네임입니다.');
            setIsValid(false);
        } else {
            setValidationMessage('사용할 수 있는 닉네임입니다.');
            setIsValid(true);
        }
    };

    const handleSubmit = async () => {
        if (!isValid) return;

        try {
            const res = await axios.put(
                `${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/nickname`,
                { nickname },
                { withCredentials: true }
            );

            if (res.status === 200) {
                onSubmit(nickname);
                onClose();
            }
        } catch (error) {
            console.error("닉네임 수정 오류:", error);
            setValidationMessage('닉네임 수정 중 오류가 발생했습니다.');
            setIsValid(false);
        }
    };

    return (
        <div className={styles.modal_overlay}>
            <div className={styles.modal_box}>
                <label htmlFor="profile-image-upload">
                    <img
                        src={profileImage}
                        alt="프로필 사진"
                        className={styles.profile_img}
                        style={{cursor: 'pointer', position: 'relative'}}
                    />
                </label>
                <input
                    type="file"
                    id="profile-image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{display: 'none'}}
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
                    // validationMessage === '사용할 수 있는 닉네임입니다.'
                    isValid
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
