// DiaryList.js
// 직관일지 목록 페이지
import React, {useEffect, useState} from 'react';
import {useNavigate, useSearchParams, useParams} from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import styles from './DiaryList.module.css';
import TabNav from "../../components/TabNav/TabNav";
import CasterbotModal from "../Chatbot/CasterbotModal";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import axios from 'axios';
import {teamInfoMapCommunity} from "../../utils/teamInfoMap";
import Modal from "../../components/Modal/Modal";


const DiaryList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page")) || 1;
    const [diaries, setDiaries] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    const navigate = useNavigate();
    const tabLabels = ["나의 직관일지"];
    const [showCasterbot, setShowCasterbot] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const { id: userId } = useParams();

    useEffect(() => {
        const fetchMyDiaries = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/live-match-diary/my`, {
                    withCredentials: true, // 필요시 쿠키 인증
                });

                let entriesArray;
                if (Array.isArray(response.data)) {
                  // Backend returned a simple list
                  entriesArray = response.data;
                } else {
                  entriesArray = [];
                }
                const data = entriesArray.map((entry) => {
                    const teamData = teamInfoMapCommunity.find(team => team.teamId === entry.TeamName);
                    return {
                        id: entry.postId,
                        title: entry.title,
                        date: entry.twpDate || entry.date,
                        image: entry.thumbnail ? `${process.env.REACT_APP_PRESIGNED_URI}/${entry.thumbnail}` : null,
                        // image: `${process.env.PUBLIC_URL}/exImage.png` || null, // 임시 이미지
                        team: teamData?.name || '',
                        teamLogo: teamData?.logo || `${process.env.PUBLIC_URL}/exImage.png`,
                        content: '',
                    };
                });
                data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setDiaries(data);
                setTotalPages(Math.ceil(data.length / 8));

            } catch (error) {
                console.error('직관일지 목록 불러오기 실패:', error);
                setError('직관일지를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyDiaries();
        // setDiaries([...customDiaries, ...dummyDiaries]);
    }, [page]);

    const handlePageChange = (_, value) => {
        setSearchParams({page: value});
    };

    function handleBack() {
        navigate(`/profile/${userId}`);
    }

    const pagedDiaries = diaries.slice((page - 1) * 8, page * 8);

    // Navigate to diary detail page
    const handleClickDiary = (id) => {
        const clickedDiary = diaries.find(d => d.id === id);
        if (!clickedDiary) {
            setShowModal(true);
            return;
        }
        const teamTag = teamInfoMapCommunity.find(team => team.name === clickedDiary.team)?.teamId;
        if (teamTag) {
            navigate(`/diary/${teamTag}/${id}`);
        }
    };

    return (
        <>
            <div className={styles.container}>
                {/*<h2 className={styles.title}>나의 직관일지</h2>*/}
                <TabNav tabs={tabLabels} onBack={handleBack}/>
                <div className={styles.entryBox}>
                    {pagedDiaries.length === 0 ? (
                        <div className={styles.emptyMessage}>아직 작성한 직관일지가 없어요!</div>
                    ) : pagedDiaries.map((entry) => (
                        <div
                            key={entry.id}
                            className={styles.entry}
                            onClick={() => handleClickDiary(entry.id)}
                            style={{cursor: 'pointer'}}
                        >
                            {entry.image ? (
                                <img src={entry.image || `${process.env.PUBLIC_URL}/exImage.png`} alt="thumbnail"
                                     className={styles.thumbnail}/>
                            ) : null}
                            <div className={styles.entryContent}>
                                <div>
                                    <span className={styles.entryTitle}>{entry.title}</span>
                                    {entry.teamLogo && <img src={entry.teamLogo} alt="logo" className={styles.teamLogo}/>}
                                </div>
                                <span className={styles.entryDate}>{entry.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.paginationWrapper}>
                    <Stack spacing={2}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Stack>
                </div>
            </div>
            <CasterbotButton onClick={() => setShowCasterbot(true)}/>

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
            {showModal && (
                <Modal
                    title="알림"
                    message="직관일지를 찾을 수 없습니다!"
                    buttons={[
                        {label: '확인', onClick: () => setShowModal(false)},
                    ]}
                />
            )}
        </>
    );
};
export default DiaryList;