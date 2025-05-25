// 직관일지 목록 페이지
import React, {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import styles from './DiaryList.module.css';
import TabNav from "../../components/TabNav/TabNav";
import CasterbotModal from "../Chatbot/CasterbotModal";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import axios from 'axios';

const teamInfoMap = [
    {id: 1, teamId: 'NC_DINOS', name: 'NC', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_NC.png`},
    {id: 2, teamId: 'SAMSUNG_LIONS', name: '삼성', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SS.png`},
    {id: 3, teamId: 'DOOSAN_BEARS', name: '두산', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_OB.png`},
    {id: 4, teamId: 'HANWHA_EAGLES', name: '한화', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HH.png`},
    {id: 5, teamId: 'KIA_TIGERS', name: 'KIA', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HT.png`},
    {id: 6, teamId: 'KT_WIZ', name: 'KT', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_KT.png`},
    {id: 7, teamId: 'LOTTE_GIANTS', name: '롯데', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LT.png`},
    {id: 8, teamId: 'LG_TWINS', name: 'LG', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LG.png`},
    {id: 9, teamId: 'SSG_LANDERS', name: 'SSG', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SK.png`},
    {id: 10, teamId: 'KIWOOM_HEROES', name: '키움', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_WO.png`},
];

const DiaryList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page")) || 1;
    const [diaries, setDiaries] = useState([]);
    const PER_PAGE = 6;

    const navigate = useNavigate();
    const tabLabels = ["나의 직관일지"];
    const [showCasterbot, setShowCasterbot] = useState(false);


    useEffect(() => {
        const fetchMyDiaries = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/live-match-diary/my`, {
                    params: {
                        page: page - 1,
                        size: PER_PAGE,
                    },
                    withCredentials: true, // 필요시 쿠키 인증
                });

                const data = response.data.map((entry) => {
                    const teamData = teamInfoMap.find(team => team.teamId === entry.TeamName);
                    return {
                        id: entry.postId,
                        title: entry.title,
                        date: entry.twpDate || entry.date,
                        image: entry.thumbnail || null,
                        // image: `${process.env.PUBLIC_URL}/exImage.png` || null, // 임시 이미지
                        team: teamData?.name || '',
                        teamLogo: teamData?.logo || '/Logo/TeamLogo/default_logo.png',
                        content: '',
                    };
                });
                setDiaries(data);

            } catch (error) {
                console.error('직관일지 목록 불러오기 실패:', error);
            }
        };

        fetchMyDiaries();
        // setDiaries([...customDiaries, ...dummyDiaries]);
    }, [page]);

    const handlePageChange = (_, value) => {
        setSearchParams({page: value});
    };

    function handleBack() {
        navigate('/profile');
    }

    const pagedDiaries = diaries.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    // Navigate to diary detail page
    const handleClickDiary = (id) => {
        navigate(`/diary/${id}`);
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
                                <img src={entry.image} alt="thumbnail" className={styles.thumbnail}/>
                            ) : null}
                            <div className={styles.entryContent}>
                                <span className={styles.entryTitle}>{entry.title}</span>
                                <span className={styles.entryDate}>{entry.date}</span>
                                {entry.teamLogo && <img src={entry.teamLogo} alt="logo" className={styles.teamLogo}/>}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.paginationWrapper}>
                    <Pagination
                        count={Math.ceil(diaries.length / PER_PAGE)}
                        page={page}
                        onChange={handlePageChange}
                        variant="outlined"
                        shape="rounded"
                        sx={{
                            '& .MuiPaginationItem-root': {
                                color: '#784af4',
                                border: '1px solid #784af4',
                                cursor: 'pointer',
                            },
                            '& .Mui-selected': {
                                backgroundColor: '#784af4',
                                color: '#fff',
                                borderColor: '#784af4',
                            },
                            '& .MuiPaginationItem-ellipsis': {
                                border: 'none',
                                color: '#784af4',
                                backgroundColor: 'transparent',
                            },
                        }}
                    />
                </div>
            </div>
            <CasterbotButton onClick={() => setShowCasterbot(true)}/>

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
        </>
    );
};
export default DiaryList;