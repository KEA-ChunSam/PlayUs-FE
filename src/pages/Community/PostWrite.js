import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './PostWrite.module.css';

const PostWrite = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editingPost = location.state?.post;
    const [title, setTitle] = useState(editingPost ? editingPost.title : '');
    const [content, setContent] = useState(editingPost ? editingPost.content : '');
    const [image, setImage] = useState(editingPost ? editingPost.image : null);
    const [imageFile, setImageFile] = useState(null);
    const [objectUrl, setObjectUrl] = useState(null);
    const selectedTeam = location.state?.team || 'hanwha';
    const teamNameMap = {
      hanwha: '한화 이글스', lg: 'LG 트윈스', kt: 'KT 위즈', ssg: 'SSG 랜더스', nc: 'NC 다이노스', doosan: '두산 베어스', kia: 'KIA 타이거즈', samsung: '삼성 라이온즈', lotte: '롯데 자이언츠', kiwoom: '키움 히어로즈'
    };

    useEffect(() => {
        if (editingPost) {
            setTitle(editingPost.title);
            setContent(editingPost.content);
            setImage(editingPost.image);
        }
    }, [editingPost]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setObjectUrl(url);
            setImage(url);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const now = new Date();
        const user = JSON.parse(localStorage.getItem('user'));
        const author = user?.nickname || user?.name || '익명';
        const time = editingPost ? editingPost.time : now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        const newPost = {
            id: editingPost ? editingPost.id : Date.now(),
            title,
            time,
            author,
            team: selectedTeam,
            teamName: teamNameMap[selectedTeam],
            image: image,
            content,
        };
        const prev = JSON.parse(localStorage.getItem('communityPosts')) || [];
        let updatedPosts;
        if (editingPost) {
            updatedPosts = prev.map(p => String(p.id) === String(editingPost.id) ? newPost : p);
            localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
            navigate(`/community/post/${newPost.id}`);
            return;
        } else {
            updatedPosts = [newPost, ...prev];
            localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
            navigate('/community', { state: { team: selectedTeam } });
        }
    };

    const handleCancel = () => {
        navigate('/community');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.closeButton} onClick={handleCancel}>
                    ✕
                </button>
                <span className={styles.title}>게시글 작성</span>
                <div style={{ width: '24px' }}></div>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.imageUpload}>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="image" className={styles.imageLabel}>
                        {image ? (
                            <img src={image} alt="Preview" className={styles.preview} />
                        ) : (
                            <div className={styles.uploadPlaceholder}>
                                <span>+</span>
                                <span>이미지 추가</span>
                            </div>
                        )}
                    </label>
                </div>

                <div className={styles.formGroup}>
                    <input
                        type="text"
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <textarea
                        placeholder="내용을 입력하세요"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className={styles.textarea}
                        required
                    />
                    <div className={styles.charCount}>
                        {content.length}/1000
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button type="submit" className={styles.submitButton}>
                        등록하기
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostWrite; 