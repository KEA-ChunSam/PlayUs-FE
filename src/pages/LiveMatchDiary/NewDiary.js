// 직관일지 작성 페이지
import React, {useEffect, useState} from 'react';
import Modal from '../../components/Modal/Modal';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import styles from './NewDiary.module.css';
import CasterbotModal from "../Chatbot/CasterbotModal";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import axios from 'axios';
import {kbo_teams, teamMap} from "../../utils/teamInfoMap";



const NewDiary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = useParams();
    // useEffect(() => {
    //     console.log('🧭 location.state:', location.state);
    // }, []);
    const isEditing = !!location.state;
    const postId = isEditing ? location.state?.id : null;
    // Enhanced team/tag initialization for editing mode
    const teamTagFromState = location.state?.tag || null;
    const teamNameFromTag = teamTagFromState
        ? Object.entries(teamMap).find(([, tag]) => tag === teamTagFromState)?.[0]
        : null;
    const [team, setTeam] = useState(location.state?.team || teamNameFromTag || '');
    const teamTag = team ? teamMap[team] : null;
    const [title, setTitle] = useState(location.state?.title || '');
    const [content, setContent] = useState(location.state?.content || '');
    const [image, setImage] = useState(location.state?.image || null);
    const [imageFile, setImageFile] = useState(null);
    const [objectUrl, setObjectUrl] = useState(null);
    const [showCasterbot, setShowCasterbot] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');


    useEffect(() => {
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);

    const handleImageChange = (e) => {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
        const newUrl = URL.createObjectURL(e.target.files[0]);
        setObjectUrl(newUrl);
        setImage(newUrl);
        if (e.target.files && e.target.files[0]) {
            setImage(URL.createObjectURL(e.target.files[0]));
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let imageFileName = null;

        if (imageFile) {
            try {
                const uuid = crypto.randomUUID();
                imageFileName = `diary/${uuid}_${imageFile.name}`;
                // Inserted log statements
                console.log("🧾 imageFile 객체:", imageFile);
                console.log("📛 imageFile.name:", imageFile?.name);
                console.log("📦 최종 imageFileName:", imageFileName);

                const presignedRes = await axios.post(
                    `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/presigned-url`,
                    { imageFileName },
                    { withCredentials: true }
                );

                await fetch(presignedRes.data.presignedUrl, {
                    method: 'PUT',
                    body: imageFile
                });
            } catch (err) {
                console.error("이미지 업로드 실패:", err);
                setModalTitle('오류');
                setModalMessage('이미지 업로드에 실패했습니다.');
                setShowModal(true);
                return;
            }
        }

        const postData = {
            title,
            content,
            image: imageFileName,
            twpDate: isEditing ? location.state?.twpDate : new Date().toISOString().split('T')[0],
            isSecret: true
        };

        try {
            if (isEditing && postId && teamTag) {
                await axios.put(`${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/live-match-diary/${teamTag}/${postId}`, postData, {
                    withCredentials: true
                });
            } else {
                await axios.post(`${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/live-match-diary/${teamTag}`, postData, {
                    withCredentials: true
                });
            }
            setModalTitle('알림');
            setModalMessage(isEditing ? '직관일지가 성공적으로 수정되었습니다!' : '직관일지가 성공적으로 작성되었습니다!');
            setShowModal(true);
        } catch (error) {
            console.error('직관일지 등록 실패:', error);
            setModalTitle('오류');
            setModalMessage('직관일지 등록 중 오류가 발생했습니다.');
            setShowModal(true);
        }
    };

    const handleCancel = () => {
        navigate('/diary/list/1');
    };

    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <span className={styles.title}>{isEditing ? '직관일지 수정' : '직관일지 작성'}</span>
                    <button onClick={handleCancel} className={styles.closeButton}>✕</button>
                </div>

                <form className={styles.body} onSubmit={handleSubmit}>
                    <label className={styles.imageUpload}>
                        {image ? (
                            <img
                              src={
                                image?.startsWith('blob:')
                                  ? image
                                  : `${process.env.REACT_APP_PRESIGNED_URI}/${image}`
                              }
                              alt="preview"
                              className={styles.preview}
                            />
                        ) : (
                            <span>사진/동영상</span>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} hidden/>
                    </label>

                    <div className={styles.formGroup}>
                        <label>직관 팀</label>
                        <select
                            value={team}
                            onChange={(e) => setTeam(e.target.value)}
                            className={styles.select}
                            required
                        >
                            <option value="" disabled>팀을 선택해주세요</option>
                            {kbo_teams.map((t, i) => (
                                <option key={i} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={styles.input}
                            placeholder="제목을 입력해주세요"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>내용</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className={styles.textarea}
                            maxLength={1000}
                            placeholder="직관했던 내용을 자유롭게 작성해 주세요!"
                            required
                        />
                        <div className={styles.charCount}>{`${content.length} / 1000`}</div>
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            onClick={handleSubmit}
                        >
                            {isEditing ? '수정 완료!' : '직관일지 작성!'}
                        </button>
                    </div>
                </form>
            </div>
            <CasterbotButton onClick={() => setShowCasterbot(true)} />

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
            {showModal && (
                <Modal
                    title={modalTitle}
                    message={modalMessage}
                    buttons={[
                        {
                            label: '확인',
                            onClick: () => {
                                setShowModal(false);
                                navigate(`/diary/list/${userId}`);
                            }
                        }
                    ]}
                />
            )}
        </>
    );
};

export default NewDiary;