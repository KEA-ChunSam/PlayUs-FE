// 직관일지 상세 페이지
import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import styles from './DiaryDetail.module.css';
import TabNav from "../../components/TabNav/TabNav";
import Modal from "../../components/Modal/Modal";
import CasterbotModal from "../Chatbot/CasterbotModal";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import axios from 'axios';
import { getTeamTagFromKoreanName } from "../../utils/teamInfoMap";

const DiaryDetail = () => {
    const {tag, id} = useParams();
    const [diary, setDiary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showCasterbot, setShowCasterbot] = useState(false);

    const navigate = useNavigate();
    const tabLabels = ["나의 직관일지"];

    function handleBack() {
        navigate('/diary/list');
    }

    useEffect(() => {
        const fetchDiary = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/live-match-diary/${tag}/${id}`, {
                    withCredentials: true,
                });
                setDiary(response.data);
            } catch (error) {
                console.error('일지 불러오기 실패:', error);
                setDiary(null);
            } finally {
                setLoading(false);
            }
        };
        fetchDiary();
    }, [tag, id]);

    if (loading) return <div>로딩 중...</div>;
    if (!diary) return <div>일지를 찾을 수 없습니다.</div>;

    return (
        <>
            <div className={styles.container}>
                <TabNav tabs={tabLabels} onBack={handleBack}/>
                {/*<div className={styles.innerWrapper}>*/}
                <div className={styles.header}>
                    {diary.teamLogo && <img src={diary.teamLogo} alt="logo" width={60}/>}
                    <span>{diary.team}</span>
                </div>

                <div className={styles.titleRow}>
                    <h2 className={styles.titleText}>{diary.title}</h2>
                    <div className={styles.menuWrapper}>
                        <span className={styles.menuDate}>{diary.date}</span>
                        <button
                            onClick={() => setShowMenu((prev) => !prev)}
                            className={styles.menuButton}
                        >⋮
                        </button>
                        {showMenu && (
                            <div className={styles.menuPopup}>
                                <div
                                    className={styles.menuItem}
                                    onClick={() => {
                                        navigate(`/diary/newdiary`, {
                                            state: {
                                                id: diary.postId,          // ✅ 이걸 명시적으로 넣어줘야 NewDiary.js에서 인식 가능
                                                team: diary.team,
                                                tag: tag,
                                                title: diary.title,
                                                content: diary.content,
                                                image: diary.image,
                                                twpDate: diary.date
                                            }
                                        });
                                    }}
                                >
                                    수정하기
                                </div>
                                <div
                                    className={styles.menuItem}
                                    onClick={() => {
                                        setShowMenu(false);
                                        setShowModal(true);
                                    }}
                                >
                                    삭제하기
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.imageWrapper}>
                    <img src={diary.image || `${process.env.PUBLIC_URL}/exImage.png`} alt="diary" className={styles.image}/>
                </div>

                <div className={styles.content}>
                    {diary.content}
                </div>
                {/*</div>*/}
                {showModal && (
                    <Modal
                        title="알림"
                        message="삭제하시겠습니까?"
                        buttons={[
                            {label: '취소', onClick: () => setShowModal(false)},
                            {
                                label: '확인',
                                onClick: async () => {
                                    try {
                                        await axios.delete(`${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/live-match-diary/${id}`, {
                                            withCredentials: true
                                        });
                                        setShowModal(false);
                                        navigate('/diary/list');
                                    } catch (error) {
                                        console.error('삭제 실패:', error);
                                        setShowModal(false);
                                        alert('삭제 중 오류가 발생했습니다.');
                                    }
                                }
                            }
                        ]}
                    />
                )}
            </div>
            <CasterbotButton onClick={() => setShowCasterbot(true)} />

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
        </>
    );
};

export default DiaryDetail;