import React, {useEffect, useState} from 'react';
import {Doughnut} from 'react-chartjs-2';
import {ArcElement, Chart as ChartJS, Legend, Tooltip} from 'chart.js';
import {useNavigate, useParams} from 'react-router-dom';
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
import {teamInfoMapCommunity} from "../../utils/teamInfoMap";

// 팀 정보 맵 (예시, 실제 데이터는 프로젝트에서 적절히 import/정의 필요)
// const teamInfoMapCommunity = [
//     {teamId: 1, name: 'NC 다이노스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_NC.png`},
//     {teamId: 2, name: '삼성 라이온즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SS.png`},
//     {teamId: 3, name: '두산 베어스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_OB.png`},
//     {teamId: 4, name: '한화 이글스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HH.png`},
//     {teamId: 5, name: 'KIA 타이거즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HT.png`},
//     {teamId: 6, name: 'KT 위즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_KT.png`},
//     {teamId: 7, name: '롯데 자이언츠', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LT.png`},
//     {teamId: 8, name: 'LG 트윈스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LG.png`},
//     {teamId: 9, name: 'SSG 랜더스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SK.png`},
//     {teamId: 10, name: '키움 히어로즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_WO.png`}
// ];

ChartJS.register(ArcElement, Tooltip, Legend);

const journalEntries = [
    {date: '2025.03.03', title: '비와서 경기 종료..', image: `${process.env.PUBLIC_URL}/exImage.png`},
    {date: '2025.03.03', title: '편안한 직관~', image: null}
];

const Profile = () => {
    // 최근 직관일지 state
    const [recentDiaries, setRecentDiaries] = useState([]);
    // 최근 커뮤니티 게시글 state
    const [recentPosts, setRecentPosts] = useState([]);
    // 최근 직관일지 fetch
    const [calendarLogs, setCalendarLogs] = useState({});

    // const [searchParams] = useSearchParams();
    // const userId = searchParams.get('userId');
    const {userId} = useParams();

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
                // diary response
                const data = response.data.map(entry => {
                    const teamData = teamInfoMapCommunity.find(team => team.teamId === entry.TeamName);
                    return {
                        id: entry.postId,
                        title: entry.title,
                        date: entry.date,
                        createdAt: entry.createdAt, // Add this line
                        image: entry.thumbnail || null,
                        team: teamData?.name || '',
                        teamLogo: teamData?.logo || `${process.env.PUBLIC_URL}/exImage.png`,
                    };
                });
                // Sort diaries: first by twpDate (date) descending, then by createdAt ascending
                const sortedData = data.sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    if (dateA.getTime() !== dateB.getTime()) {
                        return dateB - dateA; // twpDate descending
                    }
                    return new Date(a.createdAt) - new Date(b.createdAt); // createdAt ascending
                });
                // Filter to top 2 unique date entries
                const recentTwoDates = [];
                const filteredDiaries = [];
                for (const diary of sortedData) {
                    if (!recentTwoDates.includes(diary.date)) {
                        recentTwoDates.push(diary.date);
                        filteredDiaries.push(diary);
                    }
                    if (recentTwoDates.length === 2) break;
                }
                setRecentDiaries(filteredDiaries);

                // calendarLogs logic
                const calendarMap = {};
                sortedData.forEach(entry => {
                    let formattedDate;
                    if (entry.date.includes('.')) {
                        const [year, month, day] = entry.date.split('.').map(str => str.padStart(2, '0'));
                        formattedDate = `${year}-${month}-${day}`;
                    } else if (entry.date.includes('-')) {
                        formattedDate = entry.date;
                    } else {
                        console.warn('Unexpected date format:', entry.date);
                        try {
                            formattedDate = new Date(entry.date).toISOString().split('T')[0];
                        } catch (e) {
                            console.error('Date parsing failed:', entry.date, e);
                            return;
                        }
                    }

                    const key = new Date(formattedDate).toLocaleDateString('sv-SE');
                    if (
                        !calendarMap[key] ||
                        new Date(entry.createdAt) < new Date(calendarMap[key].createdAt)
                    ) {
                        const logoMatch = entry.teamLogo.match(/emblem_(.*?)\.png$/);
                        if (logoMatch) {
                            calendarMap[key] = {
                                logo: `emblem_${logoMatch[1]}.png`,
                                createdAt: entry.createdAt
                            };
                        }
                    }
                });
                // Simplify calendarMap to only logo
                const simplifiedCalendarMap = {};
                Object.keys(calendarMap).forEach(key => {
                    simplifiedCalendarMap[key] = calendarMap[key].logo;
                });
                setCalendarLogs(simplifiedCalendarMap);
            } catch (error) {
                // 최근 직관일지 불러오기 실패
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
                const loggedInRes = await axios.get(`${baseUrl}/user/profile`, {withCredentials: true}); // 배포용
                // const loggedInRes = await axios.get(`${baseUrl}/user/user/profile`, {withCredentials: true}); // 로컬 개발용

                const loggedInData = loggedInRes.data;
                setLoggedInUserId(loggedInData.id);

                // Now fetch the target profile (could be mine or another user's)
                let targetProfileUrl;
                if (!userId) {
                    targetProfileUrl = `${baseUrl}/user/profile`; // 배포용
                    // targetProfileUrl = `${baseUrl}/user/user/profile`; // 로컬 개발용
                } else {
                    targetProfileUrl = `${baseUrl}/user/profile/${userId}`; // 배포용
                    // targetProfileUrl = `${baseUrl}/user/user/profile/${userId}`; // 로컬 개발용
                }
                const res = await axios.get(targetProfileUrl, {withCredentials: true});
                const data = res.data;
                const favoriteTeams = data.favoriteTeams || [];
                const primaryTeam = favoriteTeams.find(team => team.displayOrder === 1);

                const teamLogoMap = {
                    1: 'NC', 2: 'SS', 3: 'OB', 4: 'HH', 5: 'HT',
                    6: 'KT', 7: 'LT', 8: 'LG', 9: 'SK', 10: 'WO'
                };
                const logoPrefix = teamLogoMap[primaryTeam?.teamId] || 'default';
                const teamLogo = `TeamLogo/emblem_${logoPrefix}.png`;

                setProfile({
                    ...data,
                    profileImg: `${process.env.REACT_APP_PRESIGNED_URI}/${data.thumbnailURL}`,
                    teamLogo
                });
                setNickname(data.nickname);

                // Compare logged-in user ID with the profile being viewed
                if (userId) {
                    setIsMine(Number(loggedInData.id) === Number(userId));
                } else {
                    setIsMine(true);
                }
            } catch (err) {
                // 프로필 불러오기 오류
                setError('프로필을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        };

        fetchProfile();
    }, [userId]);

// 최근 커뮤니티 게시글 fetch
    useEffect(() => {
        const fetchRecentPosts = async () => {
            if (!userId) return;

            try {
                const res = await axios.get(`${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/writer/${userId}`, {
                    withCredentials: true
                });
                setRecentPosts(res.data);
            } catch (err) {
                // 커뮤니티 게시글 불러오기 실패
            }
        };

        fetchRecentPosts();
    }, [userId]);

    const today = new Date();
    const [value, setValue] = useState(today);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showProfileEditModal, setShowProfileEditModal] = useState(false);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [showFinalModal, setShowFinalModal] = useState(false);
    const navigate = useNavigate();
    const handleLogout = () => {
        // 로그아웃 확인됨
        setShowLogoutModal(false);
        navigate('/login');
    };

    // 후기 태그 요약 정보 state 및 fetch
    const [tagSummary, setTagSummary] = useState(null);
    useEffect(() => {
        if (!isMine && userId) {
            const fetchTagSummary = async () => {
                try {
                    const res = await axios.get(
                        `${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/${userId}/tags/summary`,
                        {withCredentials: true}
                    );
                    setTagSummary(res.data);
                } catch (err) {
                    setTagSummary(null);
                }
            };
            fetchTagSummary();
        }
    }, [isMine, userId]);

    const tileContent = ({date, view}) => {
        if (view === 'month') {
            const key = date.toLocaleDateString('sv-SE');
            if (calendarLogs[key]) {
                return (
                    <div className={styles.logoWrapper}>
                        <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo/${calendarLogs[key]}`} alt="logo"
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
            navigate(`/diary/list/${userId}`);
            alert('직관일지 목록은 본인만 확인할 수 있습니다.');
        }
    };

    const handleNewDiary = () => {
        navigate('/diary/newdiary');
    }
    const [showCasterbot, setShowCasterbot] = useState(false);

    const handlePostClick = async (writerId, postId) => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/writer/${writerId}/${postId}`, {
                withCredentials: true,
            });
            const teamTag = res.data.tag;
            navigate(`/community/post/${teamTag}/${postId}`);
        } catch (error) {
            console.error('게시글 정보를 불러오지 못했습니다:', error);
        }
    };

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
                                        : encodeURI(profile.profileImg)
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
                                        가입일: 2025년 5월 26일
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
                                                    <img
                                                        src={`${process.env.REACT_APP_PRESIGNED_URI}/${entry.image}`}
                                                        alt="entry"
                                                        className={styles.entryImg}
                                                    />
                                                )}
                                                <span className={styles.entryTitle}>{entry.title}</span>
                                                <span className={styles.entryDate}>
                                                    {entry.date?.replace(/-/g, '.')}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </>
                        ) : (
                            <>
                                {!isMine && (
                                    <section className={styles.accuracySection}>
                                        <h2>직관 타율</h2>
                                        {tagSummary ? (
                                            <div className={styles.accuracyChartWrapper}>
                                                <div className={styles.accuracyCircle}>
                                                    <Doughnut
                                                        data={{
                                                            labels: ['타율', '빈 공간'],
                                                            datasets: [
                                                                {
                                                                    data: [
                                                                        profile.userScore || 0,
                                                                        1 - (profile.userScore || 0)
                                                                    ],
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
                                                    <div className={styles.accuracyNumberOverlay}>
                                                        {(profile.userScore || 0).toFixed(3)}
                                                    </div>
                                                </div>
                                                <div className={styles.reviewSummary}>
                                                    <p>이 회원님께서는...</p>
                                                    <div className={styles.reviewTagContainer}>
                                                        {tagSummary.topTags.length > 0 ? (
                                                            tagSummary.topTags.map((tagName, idx) => (
                                                                <span key={idx} className={styles.reviewTag}>
                                                                    {tagName}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className={styles.noTagsText}>태그가 없습니다.</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p>후기 정보를 불러오는 중입니다...</p>
                                        )}
                                    </section>
                                )}

                                <section className={styles.journalSection}>
                                    <div className={styles.journalHeader}>
                                        <h2>최근 커뮤니티 게시글</h2>
                                    </div>
                                    <ul className={styles.journalList}>
                                        {Array.isArray(recentPosts) && recentPosts.length > 0 ? [...recentPosts]
                                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                                            .slice(0, 3)
                                            .map((entry, idx) => (
                                                <li
                                                    key={idx}
                                                    className={styles.journalItem}
                                                    onClick={() => handlePostClick(userId, entry.postId)}
                                                >
                                                    {entry?.image && (
                                                        <img src={entry.image} alt="entry" className={styles.entryImg}/>
                                                    )}
                                                    <span className={styles.entryTitle}>{entry?.title || '제목 없음'}</span>
                                                    <span className={styles.entryDate}>{entry?.date || ''}</span>
                                                </li>
                                            )) : (
                                            <li className={styles.noPostsMessage}>게시글이 없습니다.</li>
                                        )}
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
                            {label: '취소', onClick: () => setShowLogoutModal(false)},
                            {
                                label: '확인',
                                onClick: async () => {
                                    const baseUrl = process.env.REACT_APP_LOCAL_BACKEND_URI;
                                    try {
                                        await axios.post(`${baseUrl}/user/auth/logout`, {}, {withCredentials: true});
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
                        onSubmit={(newNickname, newImageUrl) => {
                            setNickname(newNickname);
                            setProfile(prev => ({
                                ...prev,
                                nickname: newNickname,
                                profileImg: newImageUrl
                                    ? `${process.env.REACT_APP_PRESIGNED_URI}/${newImageUrl}`
                                    : prev.profileImg
                            }));
                        }}
                        initialNickname={nickname}
                        initialProfileImage={profile?.profileImg}
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