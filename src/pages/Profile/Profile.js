import React, {useState} from 'react';
import {Doughnut} from 'react-chartjs-2';
import {ArcElement, Chart as ChartJS, Legend, Tooltip} from 'chart.js';
import dummyDiaries from '../../components/DummyData/dummyDiaries';
import {useNavigate, useSearchParams} from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../components/CustomCalendar/CalendarOverride.css';
import styles from './Profile.module.css';
import Modal from '../../components/Modal/Modal';
import ProfileEditModal from '../../components/Modal/ProfileEditModal/ProfileEditModal';
import WithdrawalModal from '../../components/Modal/WithdrawalModal/WithdrawalModal';
import CasterbotModal from "../Chatbot/CasterbotModal";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";

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
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId');
    const currentUserId = '1';
    // Move dummyUsers into state with joined and diaryCount added to each user
    const [dummyUsers] = useState({
        '1': {
            nickname: 'ZSJ',
            email: 'cho010105@gachon.ac.kr',
            teamLogo: 'NC',
            profileImg: `${process.env.PUBLIC_URL}/Logo/default.png`,
            joined: '2025년 3월 13일',
        },
        '2': {
            nickname: '다른유저',
            email: 'user2@example.com',
            teamLogo: 'HH',
            profileImg: `${process.env.PUBLIC_URL}/Logo/profile.png`,
            joined: '2025년 1월 20일',
        }
    });
    const targetId = userId || currentUserId;
    // Set diaryCount dynamically from allDiaries, and merge with profile data
    const profileBase = dummyUsers[targetId];
    const diaryCount = allDiaries.filter(d => d.userId === targetId).length;
    const profile = {
        ...profileBase,
        diaryCount
    };
    const isMine = !userId || userId === currentUserId;

    const today = new Date();
    const [value, setValue] = useState(today);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showProfileEditModal, setShowProfileEditModal] = useState(false);
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [showFinalModal, setShowFinalModal] = useState(false);
    const [nickname, setNickname] = useState(profile.nickname);
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
        navigate('/diary/list')
    };

    const handleNewDiary = () => {
        navigate('/diary/newdiary');
    }
    const [showCasterbot, setShowCasterbot] = useState(false);

    return (
        <>
            <div className={styles.container}>
                <header className={styles.header}>
                    <img src={profile.profileImg} alt="profile" className={styles.profileImg}/>
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
                                <div className={styles.withdrawal} onClick={() => setShowWithdrawalModal(true)}>탈퇴하기
                                </div>
                            </>
                        )}
                    </div>
                    <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo_Big/${profile.teamLogo}.png`} alt="team"
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
                {showLogoutModal && (
                    <Modal
                        title="로그아웃"
                        message="로그아웃하시겠어요?"
                        buttons={[
                            {label: '취소', onClick: () => setShowLogoutModal(false)},
                            {
                                label: '확인',
                                onClick: () => {
                                    navigate('/login');
                                    setShowLogoutModal(false);
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
                        onSubmit={(newNickname) => setNickname(newNickname)}
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
