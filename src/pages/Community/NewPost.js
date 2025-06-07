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
    // console.log('NewPost location.state:', location.state);
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
            console.log('전달받은 post 객체:', post);
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

    // ABS봇 비속어 감지 함수 (API 호출)
    const checkProfanity = async (text) => {
        try {
            // Extract access token from cookies
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
            console.error('비속어 필터링 오류:', error);
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

        // 사용자 정보 검증
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
            console.error('사용자 정보를 불러오는 중 오류가 발생했습니다:', error);
            user = null;
        }

        const author = user?.nickname || user?.name || '익명';

        // 날짜/시간 형식 현지화
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

        // 이미지 파일이 있는 경우 FileReader를 사용하여 base64로 변환
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
            
            // teamInfoMapCommunity에서 id(숫자)와 name을 찾아 team 객체 구성
            const teamInfo = teamInfoMapCommunity.find(t => t.teamId === team);
            if (!teamInfo) {
                alert('팀 정보를 찾을 수 없습니다.');
                return;
            }

            if (isEditing && postId) {
                // 게시글 수정 시 필요한 정보만 전송
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
                console.log('최종 postData(수정):', postData);

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
                    console.error('게시글 수정 실패:', error.response?.data || error);
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
                console.log('최종 postData(작성):', postData);
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
            console.error('Error saving post:', error.response?.data || error.message);
            if (error.response) {
                if (error.response.status === 403) {
                    alert('게시글을 수정할 권한이 없습니다.');
                } else if (error.response.status === 401) {
                    alert('로그인이 필요합니다. 다시 로그인해주세요.');
                    // 로그인 페이지로 리다이렉트
                    navigate('/login');
                } else {
                    alert(`게시글 저장 중 오류가 발생했습니다: ${error.response.data?.message || error.message}`);
                }
            } else {
                alert(`게시글 저장 중 오류가 발생했습니다: ${error.message}`);
            }
            navigate(`/community/post/${team}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        navigate(-1);
    };

    if (!team || !teamName) {
        return <div>팀 정보가 없습니다. 메인으로 돌아가세요.</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.headerTitle}>{isEditing ? '게시글 수정' : '게시글 작성'}</span>
                <button className={styles.closeButton} onClick={handleClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="#111" strokeWidth="2" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.imageUpload}>
                    {image ? (
                        <img src={image} alt="preview" className={styles.preview}/>
                    ) : (
                        <span>사진/동영상</span>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} hidden/>
                </label>
                <div className={styles.formGroup}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <textarea
                        className={styles.textarea}
                        placeholder="내용을 입력하세요"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                    <div className={styles.charCount}>{content.length}/1000</div>
                </div>
                <div className={styles.formActions}>
                    <button type="submit" className={styles.submitButton}>
                        {isEditing ? '게시글 수정하기' : '게시글 등록하기'}
                    </button>
                </div>
            </form>
            {showAbsModal && (
                <Modal
                    title="ABS봇이 작동중입니다."
                    message={
                        <>
                            ABS봇이 부적절한 키워드를 감지했습니다.
                            <br/>
                            작성글을 수정해 주세요.
                            <br/>
                            <br />
                            감지된 단어: {profanityMessage}
                        </>
                    }
                    buttons={[
                        {
                            label: '확인',
                            onClick: () => setShowAbsModal(false)
                        }
                    ]}
                />
            )}
            <CasterbotButton onClick={() => setShowCasterbot(true)}/>

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
        </div>
    );
};

export default NewPost; 