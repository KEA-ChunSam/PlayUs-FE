import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './PostWrite.module.css';
import Modal from '../../components/Modal/Modal';

const PostWrite = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isEditing = location.state?.isEditing;
    const post = location.state?.post;
    const [title, setTitle] = useState(post?.title || '');
    const [content, setContent] = useState(post?.content || '');
    const [image, setImage] = useState(post?.image || null);
    const [imageFile, setImageFile] = useState(null);
    const [team] = useState(post?.team || 'hanwha');
    const [teamName] = useState(post?.teamName || '한화 이글스');
    const selectedTeam = location.state?.team || 'hanwha';
    const [showAbsModal, setShowAbsModal] = useState(false);
    const [profanityMessage, setProfanityMessage] = useState('');
    

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

    // ABS봇 비속어 감지 함수 (API 호출)
    const checkProfanity = async (text) => {
        if (!text) return false;
        try {
            const response = await fetch('https://xrnfbckpskycrstm.tunnel.elice.io/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sentence: text }),
            });
            if (!response.ok) {
                console.error('Profanity API 호출 실패:', response.statusText);
                return false;
            }
            const data = await response.json();
            const resultString = data.result.replace(/```json\n|```/g, '');
            const result = JSON.parse(resultString);
            if (result.is_curse) {
                setProfanityMessage(`감지된 비속어: ${result.words.join(', ')}`);
                setShowAbsModal(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Profanity API 호출 중 오류 발생:', error);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // 비속어 감지
        if (await checkProfanity(title) || await checkProfanity(content)) {
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

        let prev = [];
        try {
            const storedPosts = localStorage.getItem('communityPosts');
            prev = storedPosts ? JSON.parse(storedPosts) : [];
        } catch (error) {
            console.error('게시물 데이터를 불러오는 중 오류가 발생했습니다:', error);
            alert('게시물 데이터를 불러오는 중 오류가 발생했습니다.');
            return;
        }

        let updatedPosts;
        if (isEditing) {
            updatedPosts = prev.map(p => String(p.id) === String(post.id) ? newPost : p);
            try {
                localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
            } catch (error) {
                console.error('게시물을 저장하는 중 오류가 발생했습니다:', error);
                alert('게시물을 저장하는 중 오류가 발생했습니다.');
                return;
            }
            navigate(`/community/post/${newPost.id}`);
        } else {
            updatedPosts = [newPost, ...prev];
            try {
                localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
            } catch (error) {
                console.error('게시물을 저장하는 중 오류가 발생했습니다:', error);
                alert('게시물을 저장하는 중 오류가 발생했습니다.');
                return;
            }
            navigate('/community', { state: { team: selectedTeam } });
        }
    };

    const handleClose = () => {
        navigate(-1);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.headerTitle}>{isEditing ? '게시글 수정' : '게시글 작성'}</span>
                <button className={styles.closeButton} onClick={handleClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    <input type="file" accept="image/*" onChange={handleImageChange} hidden />
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
                        {isEditing ? '수정' : '등록'}
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
                        {label: '확인', onClick: () => setShowAbsModal(false)}
                    ]}
                    onClose={() => setShowAbsModal(false)}
                />
            )}
        </div>
    );
};

export default PostWrite; 