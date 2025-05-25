// 직관일지 작성 페이지
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import styles from './NewDiary.module.css';
import CasterbotModal from "../Chatbot/CasterbotModal";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import axios from 'axios';

const teams = [
    '한화 이글스', '기아 타이거즈', '두산 베어스', 'LG 트윈스', '롯데 자이언츠',
    '삼성 라이온즈', 'SSG 랜더스', 'NC 다이노스', '키움 히어로즈', 'KT 위즈'
];

// const teamLogos = {
//     '한화 이글스': `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HH.png`,
//     '기아 타이거즈': `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HT.png`,
//     '두산 베어스': `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_OB.png`,
//     'LG 트윈스': `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LG.png`,
//     '롯데 자이언츠': `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LT.png`,
//     '삼성 라이온즈': `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SS.png`,
//     'SSG 랜더스': `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SK.png`,
//     'NC 다이노스': `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_NC.png`,
//     '키움 히어로즈': `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_WO.png`,
//     'KT 위즈': `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_KT.png`
// };

const teamMap = {
    '한화 이글스': 'HANHWA_EAGLES',
    '기아 타이거즈': 'KIA_TIGERS',
    '두산 베어스': 'DOOSAN_BEARS',
    'LG 트윈스': 'LG_TWINS',
    '롯데 자이언츠': 'LOTTE_GIANTS',
    '삼성 라이온즈': 'SAMSUNG_LIONS',
    'SSG 랜더스': 'SSG_LANDERS',
    'NC 다이노스': 'NC_DINOS',
    '키움 히어로즈': 'KIWOOM_HEROES',
    'KT 위즈': 'KT_WIZ'
};

const NewDiary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isEditing = !!location.state;
    const [team, setTeam] = useState(location.state?.team || '');
    const [title, setTitle] = useState(location.state?.title || '');
    const [content, setContent] = useState(location.state?.content || '');
    const [image, setImage] = useState(location.state?.image || null);
    const [imageFile, setImageFile] = useState(null);
    const [objectUrl, setObjectUrl] = useState(null);
    const [showCasterbot, setShowCasterbot] = useState(false);


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

        const postData = {
            title,
            content,
            image: image || null,
            twpDate: isEditing ? location.state?.twpDate : new Date().toISOString().split('T')[0],
            isSecret: true
        };

        try {
            const teamTag = teamMap[team];
            if (isEditing) {
                const postId = location.state?.id;
                await axios.patch(`${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/live-match-diary/${teamTag}/${postId}`, postData, {
                    withCredentials: true
                });
            } else {
                await axios.post(`${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/live-match-diary/${teamTag}`, postData, {
                    withCredentials: true
                });
            }
            navigate('/diary/list');
        } catch (error) {
            console.error('직관일지 등록 실패:', error);
            alert('직관일지 등록 중 오류가 발생했습니다.');
        }
    };

    const handleCancel = () => {
        navigate('/diary/list');
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
                            <img src={image} alt="preview" className={styles.preview}/>
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
                            {teams.map((t, i) => (
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
        </>
    );
};

export default NewDiary;