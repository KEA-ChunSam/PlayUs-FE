import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import styles from './NewPost.module.css';
import Modal from '../../components/Modal/Modal';
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import CasterbotModal from "../Chatbot/CasterbotModal";
import axios from 'axios';
import { teamInfoMapCommunity } from '../../utils/teamInfoMap';

const NewPost = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { team, teamName } = location.state || {};
    const isEditing = location.state?.isEditing;
    const post = location.state?.post;
    const postId = post?.id || post?.postId;
    const [title, setTitle] = useState(post?.title || '');
    const [content, setContent] = useState(post?.content || '');
    const [image, setImage] = useState(post?.image || null);
    const [imageFile, setImageFile] = useState(null);
    const selectedTeam = location.state?.team || 'hanwha';
    const [showAbsModal, setShowAbsModal] = useState(false);
    const [profanityMessage, setProfanityMessage] = useState('');
    const [showCasterbot, setShowCasterbot] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
            setImage(post.image);
        }
    }, [post]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setImage(url);
        }
    };

    const checkProfanity = async (text) => {
        try {
            const token = document.cookie
                .split('; ')
                .find(cookie => cookie.startsWith('Access='))
                ?.split('=')[1];
            const response = await axios.post(
                `${process.env.REACT_APP_AI_API_BASE}/detect`,
                { sentence: text },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    withCredentials: true
                }
            );

            let result = response.data?.result || response.data;

            if (typeof result === 'string') {
                result = result
                    .replace(/```json\n/, '')
                    .replace(/`{3,}[\s\S]*$/, '')
                    .trim();
                result = JSON.parse(result);
            }

            const isCurse = result && (String(result.isCurse || result.is_curse).toLowerCase() === 'true');
            return {
                isCurse,
                words: result.words || [],
            };
        } catch (error) {
            return { isCurse: false, words: [] };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 비속어 감지
        const profanityResultTitle = await checkProfanity(title);
        const profanityResultContent = await checkProfanity(content);

        const isProfane = profanityResultTitle.isCurse || profanityResultContent.isCurse;

        if (isProfane) {
            const words = [
                ...(profanityResultTitle.words || []),
                ...(profanityResultContent.words || [])
            ].join(', ');
            setProfanityMessage(words);
            setShowAbsModal(true);
            return;
        }

        const now = new Date();

        let user = null;
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                user = JSON.parse(userData);
                if (!user || typeof user !== 'object') {
                    throw new Error('Invalid user data');
                }
            }
        } catch (error) {
            user = null;
        }

        const author = user?.nickname || user?.name || '익명';

        const date = now.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\. /g, '.').replace('.', '');

        const time = now.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        let imageData = image;
        if (imageFile) {
            const reader = new FileReader();
            imageData = await new Promise((resolve) => {
                reader.onloadend = () => {
                    resolve(reader.result);
                };
                reader.readAsDataURL(imageFile);
            });
        }

        const newPost = {
            id: post?.id || Date.now(),
            title,
            time,
            date,
            author,
            team,
            teamName,
            image: imageData,
            content,
            timestamp: Date.now(),
        };

        try {
            setIsSubmitting(true);
            
            const teamInfo = teamInfoMapCommunity.find(t => t.teamId === team);
            if (!teamInfo) {
                alert('팀 정보를 찾을 수 없습니다.');
                return;
            }

            if (isEditing && postId) {
                const postData = {
                    postId: parseInt(postId),  // id 대신 postId 사용
                    title,
                    content,
                    image: image || null,
                    date: new Date().toISOString(),  // twpDate 대신 date 사용
                    isSecret: false,
                    writerNickname: post.writerNickname,  // 원래 작성자 정보 유지
                    writerProfileImage: post.writerProfileImage  // 원래 작성자 정보 유지
                };

                try {
                    const response = await axios.patch(
                        `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/${team}/${postId}`,
                        postData,
                        {
                            withCredentials: true,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if (response.data) {
                        alert('게시글이 수정되었습니다.');
                        navigate(`/community/post/${team}/${postId}`);
                    }
                } catch (error) {
                    if (error.response?.data?.message) {
                        alert(error.response.data.message);
                    } else {
                        alert('게시글 수정 중 오류가 발생했습니다.');
                    }
                    return;
                }
            } else {
                // 새 게시글 작성 시 필요한 정보만 전송
                let uploadedImageUrl = null;
                if (imageFile) {
                    try {
                        const presignedResponse = await axios.post(
                            `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/presigned-url`,
                            {
                                imageFileName: `community/${imageFile.name}`
                            },
                            {
                                withCredentials: true,
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                        const presignedUrl = presignedResponse.data?.presignedUrl;
                        if (presignedUrl) {
                            await axios.put(presignedUrl, imageFile, {
                                headers: {
                                    'Content-Type': imageFile.type
                                }
                            });
                            uploadedImageUrl = presignedUrl.split('?')[0];
                        }
                    } catch (error) {
                        console.error('이미지 업로드 실패:', error);
                        alert('이미지 업로드 중 문제가 발생했습니다.');
                        return;
                    }
                }
              
                const postData = {
                    title,
                    content,
                    image: uploadedImageUrl, // 이 시점에서 uploadedImageUrl은 presigned URL이 없는 경우 null이 아님
                    twpDate: new Date().toISOString().split('T')[0],  // yyyy-MM-dd 형식으로 변경
                    isSecret: false
                };
                const response = await axios.post(
                    `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/${team}`,
                    postData,
                    {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.data) {
                    throw new Error('서버 응답이 없습니다.');
                }

                const newPostId = response.data.postId || response.data.id;
                if (!newPostId) {
                    throw new Error('게시글 ID를 받지 못했습니다.');
                }

                alert('게시글이 작성되었습니다.');
                navigate(`/community/post/${team}/${newPostId}`);
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 403) {
                    alert('게시글을 수정할 권한이 없습니다.');
                } else if (error.response.status === 401) {
                    alert('로그인이 필요합니다. 다시 로그인해주세요.');
                    navigate('/login');
                } else {
                    alert(`게시글 저장 중 오류가 발생했습니다: ${error.response.data?.message || error.message}`);
                }
            } else {
                alert(`게시글 저장 중 오류가 발생했습니다: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (isEditing && postId) {
            navigate(`/community/post/${team}/${postId}`);
        } else {
            navigate(-1);
        }
    };

    const handleOpenAbsModal = (message) => {
        setProfanityMessage(message);
        setShowAbsModal(true);
    };

    const handleCloseAbsModal = () => {
        setShowAbsModal(false);
    };

    const handleCasterbotButtonClick = () => {
        setShowCasterbot(true);
    };

    const handleCasterbotClose = () => {
        setShowCasterbot(false);
    };

    const teamInfo = teamInfoMapCommunity.find(t => t.teamId === team);
    const currentTeamName = teamInfo ? teamInfo.name : '알 수 없음';

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={handleCancel} className={styles.backButton}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <span className={styles.headerTitle}>{isEditing ? '게시글 수정' : '새 게시글 작성'}</span>
            </header>
            <main className={styles.mainContent}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.teamInfo}>
                        <img src={teamInfo?.logo} alt="팀 로고" className={styles.teamLogo} />
                        <span className={styles.teamName}>{currentTeamName}</span>
                    </div>
                    <input
                        type="text"
                        placeholder="제목"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.titleInput}
                        required
                    />
                    <textarea
                        placeholder="내용을 입력하세요."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={styles.contentInput}
                        rows="10"
                        required
                    />
                    <div className={styles.imageUploadContainer}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            id="imageUpload"
                            className={styles.imageUploadInput}
                        />
                        <label htmlFor="imageUpload" className={styles.imageUploadLabel}>
                            {image ? '이미지 변경' : '이미지 추가'}
                        </label>
                        {image && (
                            <div className={styles.imagePreviewContainer}>
                                <img src={image} alt="미리보기" className={styles.imagePreview} />
                                <button type="button" onClick={() => setImage(null)} className={styles.removeImageButton}>X</button>
                            </div>
                        )}
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                        {isEditing ? '수정 완료' : '작성 완료'}
                    </button>
                </form>
            </main>
            {showAbsModal && (
                <Modal show={showAbsModal} onClose={handleCloseAbsModal} title="비속어 감지">
                    <p>{profanityMessage}</p>
                </Modal>
            )}
            <CasterbotButton onClick={handleCasterbotButtonClick} />

            {showCasterbot && (
                <CasterbotModal onClose={handleCasterbotClose}/>
            )}
        </div>
    );
};

export default NewPost; 