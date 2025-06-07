import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './SetProfile.module.css';
import LoginHeader from "../../components/Header/LoginHeader/LoginHeader";
import Modal from "../../components/Modal/Modal";
import CropModal from "../../components/Modal/CropModal/CropModal";

const SetProfile = () => {
    const [nickname, setNickname] = useState('');
    const [isValid, setIsValid] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedTeam, setSelectedTeam] = useState(() => {
        const fromState = location.state?.selectedTeam;
        if (fromState) return fromState;
        const fromStorage = localStorage.getItem('selectedTeam');
        return fromStorage ? Number(fromStorage) : '';
    });

    // Profile image crop state
    const [profileImage, setProfileImage] = useState(null); // DataURL
    const [selectedImage, setSelectedImage] = useState(null); // ObjectURL
    const [showCropModal, setShowCropModal] = useState(false);
    const [originalFile, setOriginalFile] = useState(null); // File 객체

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                alert('이미지 파일만 선택할 수 있습니다.');
                return;
            }
            setOriginalFile(file); // File 객체 저장
            setSelectedImage(URL.createObjectURL(file));
            setShowCropModal(true);
        }
    };

    const handleNicknameChange = (e) => {
        const value = e.target.value;
        setNickname(value);
        setIsValid(value.length <= 8 && /^[a-zA-Z0-9가-힣]*$/.test(value));
    };

    const handleSubmit = async () => {
        if (!isValid || nickname === '') {
            setShowModal(true);
            return;
        }

        let thumbnailURL = 'default.png';

        if (profileImage) {
            try {
                // profileImage는 DataURL임. Blob으로 변환
                const fileBlob = await fetch(profileImage).then(res => res.blob());
                let fileName;

                if (originalFile && originalFile.name) {
                    fileName = `profile/${originalFile.name}`;
                } else {
                    const uuid = crypto.randomUUID();
                    fileName = `profile/${uuid}.png`;
                }

                const presignedRes = await axios.post(
                    `${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/presigned-url`,
                    { imageFileName: fileName },
                    { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
                );

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

                thumbnailURL = fileName;
            } catch (err) {
                console.error("이미지 업로드 실패:", err);
                setShowModal(true);
                return;
            }
        }

        const payload = {
            nickname,
            teamId: Number(selectedTeam),
            thumbnailURL
        };

        try {
            await axios.post(
                `${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/register`,
                payload,
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );
            navigate('/login-complete');
        } catch (error) {
            console.error("❌ 요청 실패:", error.response ? error.response.data : error.message);
            setShowModal(true);
        }
    };

    return (
        <div className={styles.container}>
            <LoginHeader style={{ marginBottom: '-50px' }} />
            <h1 className={styles.title}>프로필 이미지를 설정해 주세요.</h1>

            <div className={styles.profileSection}>
                <div className={styles.profileImageWrapper}
                     onClick={() => document.getElementById('imageInput').click()}>
                    {profileImage ? (
                        <img src={profileImage} alt="프로필 이미지" className={styles.profileImage} />
                    ) : (
                        <div className={styles.profilePlaceholder}>이미지 설정</div>
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    id="imageInput"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </div>

            {showCropModal && (
                <CropModal
                    image={selectedImage}
                    onClose={() => setShowCropModal(false)}
                    onCropDone={(croppedDataUrl) => {
                        // croppedDataUrl(DataURL)을 Blob으로 변환 후 File 객체로 만들어 원본 파일명 유지
                        fetch(croppedDataUrl)
                            .then(res => res.blob())
                            .then(blob => {
                                if (originalFile && originalFile.name) {
                                    const croppedFile = new File([blob], originalFile.name, { type: blob.type });
                                    setOriginalFile(croppedFile); // 잘린 이미지로 File 객체 갱신
                                }
                                setProfileImage(croppedDataUrl);
                                setShowCropModal(false);
                            });
                    }}
                />
            )}

            <h1 className={styles.title}>사용하실 닉네임을 설정해 주세요.</h1>
            <p className={styles.subtitle}>
                (닉네임은 한글/영어/숫자 포함 최대 8글자까지 가능합니다.)
            </p>
            <input
                type="text"
                placeholder="닉네임은 8자 이내로 입력해 주세요."
                value={nickname}
                onChange={handleNicknameChange}
                className={`${styles.input} ${!isValid ? styles.invalid : ''}`}
            />
            {!isValid && <div className={styles.error}>닉네임이 유효하지 않습니다.</div>}

            <div className={styles.buttonGroup}>
                <button className={styles.backButton} onClick={() => navigate('/choice-team')}>이전으로</button>
                <button className={styles.submitButton} onClick={handleSubmit}>가입 완료!</button>
            </div>
            {showModal && (
                <Modal
                    title="알림"
                    message="유효한 닉네임을 입력해주세요."
                    buttons={[
                        {
                            label: '확인', onClick: () => {
                                setShowModal(false)
                            }
                        }
                    ]}
                />
            )}
        </div>
    );
};

export default SetProfile;
