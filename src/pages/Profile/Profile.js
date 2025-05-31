import React, {useEffect, useState} from 'react';
import {Doughnut} from 'react-chartjs-2';
import {ArcElement, Chart as ChartJS, Legend, Tooltip} from 'chart.js';
import dummyDiaries from '../../components/DummyData/dummyDiaries';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../components/CustomCalendar/CalendarOverride.css';
import styles from './Profile.module.css';
import Modal from '../../components/Modal/Modal';
import ProfileEditModal from '../../components/Modal/ProfileEditModal/ProfileEditModal';
import WithdrawalModal from '../../components/Modal/WithdrawalModal/WithdrawalModal';
import CasterbotModal from "../Chatbot/CasterbotModal";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import axios from "axios";

// 팀 정보 맵 (예시, 실제 데이터는 프로젝트에서 적절히 import/정의 필요)
const teamInfoMapCommunity = [
    { teamId: 1, name: 'NC 다이노스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_NC.png` },
    { teamId: 2, name: '삼성 라이온즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SS.png` },
    { teamId: 3, name: '두산 베어스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_OB.png` },
    { teamId: 4, name: '한화 이글스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HH.png` },
    { teamId: 5, name: 'KIA 타이거즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HT.png` },
    { teamId: 6, name: 'KT 위즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_KT.png` },
    { teamId: 7, name: '롯데 자이언츠', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LT.png` },
    { teamId: 8, name: 'LG 트윈스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LG.png` },
    { teamId: 9, name: 'SSG 랜더스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SK.png` },
    { teamId: 10, name: '키움 히어로즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_WO.png` }
];

ChartJS.register(ArcElement, Tooltip, Legend);
const storedDiaries = JSON.parse(localStorage.getItem('customDiaries')) || [];
const allDiaries = [...storedDiaries, ...dummyDiaries];

const mergedLogs = allDiaries.reduce((acc, entry) => {
    const dateKey = entry.date.replace(/\./g, '-');
    if (entry.teamLogo) {
        const logoMatch = entry.teamLogo.match(/emblem_(.*?)\.png$/);
        if (logoMatch) {
            acc[dateKey] = `${logoMatch[1]}.png`;
        }
    }
    return acc;
}, {});

const journalEntries = [
    {date: '2025.03.03', title: '비와서 경기 종료..', image: `${process.env.PUBLIC_URL}/exImage.png`},
    {date: '2025.03.03', title: '편안한 직관~', image: null}
];

const Profile = () => {
    // 최근 직관일지 state
    const [recentDiaries, setRecentDiaries] = useState([]);
    // 최근 직관일지 fetch

    // const [searchParams] = useSearchParams();
    // const userId = searchParams.get('userId');
    const { userId } = useParams();

    const [profile, setProfile] = useState(null);
    const [nickname, setNickname] = useState('');
    const [isMine, setIsMine] = useState(false);
    const [error, setError] = useState(null);
    const [loggedInUserId, setLoggedInUserId] = useState(null);
    useEffect(() => {
        const fetchRecentDiaries = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/live-match-diary/my`, {
                    params: {
                        page: 0,
                        size: 2,
                    },
                    withCredentials: true,
                });
                // Log the full result to verify backend response
                console.log('diary response:', response.data);

                const data = response.data.map(entry => {
                    const teamData = teamInfoMapCommunity.find(team => team.teamId === entry.TeamName);
                    return {
                        id: entry.postId,
                        title: entry.title,
                        date: entry.twpDate || entry.date,
                        image: entry.thumbnail || null,
                        team: teamData?.name || '',
                        teamLogo: teamData?.logo || `${process.env.PUBLIC_URL}/exImage.png`,
                    };
                });
                setRecentDiaries(data);
            } catch (error) {
                console.error('최근 직관일지 불러오기 실패:', error);
            }
        };

        if (isMine) {
            fetchRecentDiaries();
        }
    }, [isMine]);

useEffect(() => {
    const fetchProfile = async () => {
        const baseUrl = process.env.REACT_APP_LOCAL_BACKEND_URI;
        try {
            // Always fetch the logged-in user's profile to get their ID
            const loggedInRes = await axios.get(`${baseUrl}/user/profile`, { withCredentials: true });
            const loggedInData = loggedInRes.data;
            setLoggedInUserId(loggedInData.id);

            // Now fetch the target profile (could be mine or another user's)
            let targetProfileUrl;
            if (!userId) {
                targetProfileUrl = `${baseUrl}/user/profile`;
            } else {
                targetProfileUrl = `${baseUrl}/user/profile/${userId}`;
            }
            const res = await axios.get(targetProfileUrl, { withCredentials: true });
            const data = res.data;
            const favoriteTeams = data.favoriteTeams || [];
            const primaryTeam = favoriteTeams.find(team => team.displayOrder === 1);

            const teamLogoMap = {
                1: 'NC', 2: 'SS', 3: 'OB', 4: 'HH', 5: 'HT',
                6: 'KT', 7: 'LT', 8: 'LG', 9: 'SK', 10: 'WO'
            };
            const logoPrefix = teamLogoMap[primaryTeam?.teamId] || 'default';
            const teamLogo = `TeamLogo/emblem_${logoPrefix}.png`;

            setProfile({ ...data, teamLogo });
            setNickname(data.nickname);

            // Compare logged-in user ID with the profile being viewed
            if (userId) {
                setIsMine(Number(loggedInData.id) === Number(userId));
            } else {
                setIsMine(true);
            }
        } catch (err) {
            console.error('프로필 불러오기 오류:', err);
            setError('프로필을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    fetchProfile();
}, [userId]);

    const today = new Date();
    const [value, setValue] = useState(today);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showProfileEditModal, setShowProfileEditModal] = useState(false);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [showFinalModal, setShowFinalModal] = useState(false);
    const navigate = useNavigate();
    const handleLogout = () => {
        console.log('로그아웃 확인됨');
        setShowLogoutModal(false);
        navigate('/login');
    };

    const accuracyValue = 9.3; // TODO: 해당 값은 후기 타율 데이터를 받아와 구현

    const tileContent = ({date, view}) => {
        if (view === 'month') {
            const key = date.toLocaleDateString('sv-SE');
            if (mergedLogs[key]) {
                return (
                    <div className={styles.logoWrapper}>
                        <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_${mergedLogs[key]}`} alt="logo"
                             className={styles.teamLogo}/>
                    </div>
                );
            }
        }
        return null;
    };

    const handleDiaryList = () => {
        if (userId) {
            navigate(`/diary/list/${userId}`);
        } else {
            navigate('/diary/list');
        }
    };

    const handleNewDiary = () => {
        navigate('/diary/newdiary');
    }
    const [showCasterbot, setShowCasterbot] = useState(false);

    return (
        <>
            <div className={styles.container}>

                {error && (
                    <Modal
                        title="에러 발생"
                        message={error}
                        buttons={[
                            {
                                label: '확인',
                                onClick: () => setError(null)
                            }
                        ]}
                        onClose={() => setError(null)}
                    />
                )}

                {profile && (
                    <>
                        <header className={styles.header}>
                            <img
                                src={
                                    !profile.profileImg || profile.profileImg.includes('default.png')
                                        ? `${process.env.PUBLIC_URL}/profile/user2.jpg`
                                        : profile.profileImg
                                }
                                alt="profile"
                                className={styles.profileImg}
                            />
                            <div className={styles.userInfo}>
                                <div className={styles.username}>
                                    <span>{profile.nickname}</span>
                                    {isMine && (
                                        <img
                                            src={`${process.env.PUBLIC_URL}/Button/create.png`}
                                            alt="edit"
                                            className={styles.editIcon}
                                            onClick={() => setShowProfileEditModal(true)}
                                        />
                                    )}
                                </div>
                                {isMine ? (
                                    <div className={styles.email}>{profile.email}</div>
                                ) : (
                                    <div className={styles.email}>
                                        직관일지 {profile.diaryCount}회 작성 · {profile.joined} 가입
                                    </div>
                                )}
                                {isMine && (
                                    <>
                                        <div className={styles.logout} onClick={() => setShowLogoutModal(true)}>
                                            <img src={`${process.env.PUBLIC_URL}/Button/logout.png`} alt="logout"
                                                 className={styles.logoutImg}/>로그아웃
                                        </div>
                                        <div className={styles.withdrawal}
                                             onClick={() => setShowWithdrawalModal(true)}>탈퇴하기
                                        </div>
                                    </>
                                )}
                            </div>
                            <img src={`${process.env.PUBLIC_URL}/Logo/${profile.teamLogo}`} alt="team"
                                 className={styles.teamImg}/>
                        </header>

                        {isMine ? (
                            <>
                                <section className={styles.calendarSection}>
                                    <h2>직관 달력</h2>
                                    <div className={styles.calendarSectionDiv}>
                                        <Calendar
                                            onChange={setValue}
                                            value={value}
                                            tileContent={tileContent}
                                            formatDay={(locale, date) => date.getDate().toString()}
                                            locale="ko-KR"
                                        />
                                    </div>
                                </section>

                                <section className={styles.journalSection}>
                                    <div className={styles.journalHeader}>
                                        <h2>이번 달 나의 직관일지</h2>
                                        <button className={styles.writeBtn} onClick={handleNewDiary}>직관일지 작성하기</button>
                                        <div className={styles.logout} onClick={handleDiaryList}>더보기</div>
                                    </div>
                                    <ul className={styles.journalList}>
                                        {recentDiaries.slice(0, 2).map((entry, idx) => (
                                            <li key={idx} className={styles.journalItem}>
                                                {entry.image && (
                                                    <img src={entry.image} alt="entry" className={styles.entryImg} />
                                                )}
                                                <span className={styles.entryTitle}>{entry.title}</span>
                                                <span className={styles.entryDate}>{entry.date}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </>
                        ) : (
                            <>
                                <section className={styles.accuracySection}>
                                    <h2>직관 타율</h2>
                                    <div className={styles.accuracyChartWrapper}>
                                        <div className={styles.accuracyCircle}>
                                            <Doughnut
                                                data={{
                                                    labels: ['타율', '빈 공간'],
                                                    datasets: [
                                                        {
                                                            data: [accuracyValue, 100 - accuracyValue],
                                                            backgroundColor: ['#f66', '#f2f2f2'],
                                                            borderWidth: 0
                                                        }
                                                    ]
                                                }}
                                                options={{
                                                    cutout: '70%',
                                                    plugins: {
                                                        legend: {display: false},
                                                        tooltip: {enabled: false}
                                                    }
                                                }}
                                            />
                                            <div
                                                className={styles.accuracyNumberOverlay}>{(accuracyValue / 100).toFixed(3)}</div>
                                        </div>
                                        <div className={styles.reviewSummary}>
                                            <p>100명 중 42명이 직관팟에 만족했어요.</p>
                                            <div className={styles.reviewTag}>답장이 빨라요.</div>
                                            <div className={styles.reviewTag}>시간 약속을 잘 지켜요.</div>
                                            <div className={styles.reviewTag}>경기 직관이 열정적이에요.</div>
                                        </div>
                                    </div>
                                </section>

                                <section className={styles.journalSection}>
                                    <div className={styles.journalHeader}>
                                        <h2>최근 커뮤니티 게시글</h2>
                                        <div className={styles.logout} onClick={handleDiaryList}>더보기</div>
                                    </div>
                                    <ul className={styles.journalList}>
                                        {journalEntries.map((entry, idx) => (
                                            <li key={idx} className={styles.journalItem}>
                                                {entry.image &&
                                                    <img src={entry.image} alt="entry" className={styles.entryImg}/>}
                                                <span className={styles.entryTitle}>{entry.title}</span>
                                                <span className={styles.entryDate}>{entry.date}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </>
                        )}
                    </>
                )}
                {showLogoutModal && (
                    <Modal
                        title="로그아웃"
                        message="로그아웃하시겠어요?"
                        buttons={[
                            { label: '취소', onClick: () => setShowLogoutModal(false) },
                            {
                                label: '확인',
                                onClick: async () => {
                                    const baseUrl = process.env.REACT_APP_LOCAL_BACKEND_URI;
                                    try {
                                        await axios.post(`${baseUrl}/auth/logout`, {}, { withCredentials: true });
                                        navigate('/login');
                                    } catch (err) {
                                        navigate('/login');
                                        alert('logout failed');
                                    } finally {
                                        setShowLogoutModal(false);
                                    }
                                }
                            }
                        ]}
                    />
                )}
                {showWithdrawalModal && (
                    <WithdrawalModal
                        nickname={nickname}
                        onCancel={() => setShowWithdrawalModal(false)}
                        onWithdraw={() => {
                            setShowWithdrawalModal(false);
                            setShowFinalModal(true);
                        }}
                    />
                )}
                {showFinalModal && (
                    <Modal
                        title="탈퇴 완료"
                        message={"탈퇴가 완료되었습니다.\n언제든 다시 돌아오세요!"}
                        buttons={[
                            {
                                label: '확인',
                                onClick: () => {
                                    setShowFinalModal(false);
                                    navigate('/login');
                                }
                            }
                        ]}
                    />
                )}
                {showProfileEditModal && (
                    <ProfileEditModal
                        onClose={() => setShowProfileEditModal(false)}
                        onSubmit={(newNickname) => {
                            setNickname(newNickname);
                            setProfile(prev => ({...prev, nickname: newNickname}));
                        }}
                        initialNickname={nickname}
                    />
                )}
            </div>
            <CasterbotButton onClick={() => setShowCasterbot(true)}/>

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
        </>
    );
};

export default Profile;
