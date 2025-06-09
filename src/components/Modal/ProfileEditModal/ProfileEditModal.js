// 프로필 편집 모달 컴포넌트
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import styles from './ProfileEditModal.module.css';

const ProfileEditModal = ({ onClose, onSubmit, initialNickname, initialProfileImage }) => {
    const [nickname, setNickname] = useState(initialNickname);
    const [validationMessage, setValidationMessage] = useState('사용할 수 있는 닉네임입니다.');
    const [isValid, setIsValid] = useState(true);
    const [profileImage, setProfileImage] = useState(initialProfileImage || `${process.env.PUBLIC_URL}/profile/user2.jpg`);
    const [objectUrl, setObjectUrl] = useState(null);
    const [originalFile, setOriginalFile] = useState(null);
    const [uploadError, setUploadError] = useState(false);
    const [isImageChanged, setIsImageChanged] = useState(false);

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
            setOriginalFile(file); // 원본 파일 저장
            setIsImageChanged(true); // 이미지 변경 상태 업데이트
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

        // 변경사항이 없으면 API 호출 없이 모달만 닫기
        if (!isImageChanged && nickname === initialNickname) {
            onClose();
            return;
        }

        let thumbnailURL = null;

        // 이미지가 변경되었을 경우에만 이미지 업로드 수행
        if (isImageChanged && profileImage && profileImage !== `${process.env.PUBLIC_URL}/profile/user2.jpg`) {
            try {
                // profileImage가 ObjectURL인 경우와 DataURL인 경우 모두 처리
                let fileBlob;
                if (profileImage.startsWith('blob:')) {
                    // ObjectURL인 경우 원본 파일 사용
                    fileBlob = originalFile;
                } else {
                    // DataURL인 경우 Blob으로 변환
                    fileBlob = await fetch(profileImage).then(res => res.blob());
                }

                // 파일명 생성
                let fileName;
                // if (originalFile && originalFile.name) {
                //     fileName = `profile/${originalFile.name}`;
                // } else {
                //     const uuid = crypto.randomUUID();
                //     fileName = `profile/${uuid}.png`;
                // }
                fileName = `profile/${originalFile.name}`;

                // presigned URL 요청
                const presignedRes = await axios.post(
                    `${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/presigned-url`,
                    { imageFileName: fileName },
                    { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
                );

                // S3에 이미지 업로드
                await new Promise((resolve, reject) => {
                    fetch(presignedRes.data.presignedUrl, {
                        method: 'PUT',
                        body: fileBlob,
                        headers: {
                            // 'Content-Type': 'image/png',
                            // 다른 헤더 추가하지 마세요!
                        },
                    })
                        .then(response => {
                            if (!response.ok) throw new Error("이미지 업로드 실패");
                            resolve();
                        })
                        .catch(reject);
                });

                thumbnailURL = `${fileName}`;
            } catch (err) {
                console.error("이미지 업로드 실패:", err);
                setUploadError(true);
                setValidationMessage('이미지 업로드에 실패했습니다.');
                setIsValid(false);
                return;
            }
        }

        try {
            // 닉네임만 변경하는 경우
            if (!thumbnailURL) {
                thumbnailURL = initialProfileImage?.replace(`${process.env.REACT_APP_PRESIGNED_URI}/`, '');
                const res = await axios.put(
                    `${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/profile`,
                    { nickname, thumbnailURL },
                    { withCredentials: true }
                );

                if (res.status === 200) {
                    onSubmit(nickname);
                    onClose();
                }
            }
            // 이미지와 닉네임 모두 변경하는 경우
            else {
                const payload = {
                    nickname,
                    thumbnailURL
                };

                const res = await axios.put(
                    `${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/profile`,
                    payload,
                    { withCredentials: true }
                );

                if (res.status === 200) {
                    onSubmit(nickname, thumbnailURL);
                    onClose();
                }
            }
        } catch (error) {
            console.error("프로필 수정 오류:", error);
            setValidationMessage('프로필 수정 중 오류가 발생했습니다.');
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
