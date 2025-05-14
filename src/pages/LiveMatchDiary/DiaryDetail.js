// 직관일지 상세 페이지
import React, {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import dummyDiaries from '../../components/DummyData/dummyDiaries';
import styles from './DiaryDetail.module.css';
import TabNav from "../../components/TabNav/TabNav";
import Modal from "../../components/Modal/Modal";

const DiaryDetail = () => {
    const {id} = useParams();
    const stored = JSON.parse(localStorage.getItem('customDiaries')) || [];
    const allDiaries = [...stored, ...dummyDiaries];
    const diary = allDiaries.find((entry) => entry.id === Number(id));
    const [showMenu, setShowMenu] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();
    const tabLabels = ["나의 직관일지"];
  
    function handleBack() {
        navigate('/diary/list');
    }

    if (!diary) return <div>일지를 찾을 수 없습니다.</div>;

    return (
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
                                    navigate(`/diary/newdiary`, {state: diary});
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

            {diary.image && (
                <div className={styles.imageWrapper}>
                    <img src={diary.image} alt="diary" className={styles.image}/>
                </div>
            )}

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
                            onClick: () => {
                                const stored = JSON.parse(localStorage.getItem('customDiaries')) || [];
                                const updated = stored.filter((entry) => entry.id !== diary.id);
                                localStorage.setItem('customDiaries', JSON.stringify(updated));
                                setShowModal(false);
                                navigate('/diary/list');
                            }
                        }
                    ]}
                />
            )}
        </div>
    );
};

export default DiaryDetail;