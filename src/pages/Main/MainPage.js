import axios from "axios";
import React, {useEffect, useState} from "react";
import styles from "./MainPage.module.css";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import CasterbotModal from "../Chatbot/CasterbotModal";
import TeamTabNav from "../../components/TeamTabNav/TeamTabNav";
import ScheduleSection from "./ScheduleSection";

const teamInfoMap = [
    {id: 1, teamId: 'NC Dinos', name: 'NC', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_NC.png`},
    {id: 2, teamId: 'Samsung Lions', name: '삼성', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SS.png`},
    {id: 3, teamId: 'Doosan Bears', name: '두산', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_OB.png`},
    {id: 4, teamId: 'Hanhwa Eagles', name: '한화', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HH.png`},
    {id: 5, teamId: 'Kia Tigers', name: 'KIA', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HT.png`},
    {id: 6, teamId: 'KT Wiz', name: 'KT', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_KT.png`},
    {id: 7, teamId: 'Lotte Giants', name: '롯데', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LT.png`},
    {id: 8, teamId: 'LG Twins', name: 'LG', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LG.png`},
    {id: 9, teamId: 'SSG Landers', name: 'SSG', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SK.png`},
    {id: 10, teamId: 'Kiwoom Heroes', name: '키움', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_WO.png`},
];

// const sampleData = {
//     "NC 다이노스": {
//         schedule: {home: "NC", away: "삼성", status: "종료", score: [6, 3]},
//         posts: [
//             {
//                 profile: "/profile/user2.jpg",
//                 nickname: "NC팬1",
//                 title: "오늘 경기 너무 재밌었어요!",
//                 date: "2025.05.02 18:00",
//             },
//         ],
//         parties: [
//             {
//                 image: "/profile/party1.png",
//                 filters: ["승인제", "20대", "여자만"],
//                 title: "NC 직관팟 모집",
//                 author: "홍길동",
//                 gender: "남성",
//                 date: "5.5(일) 오후 2:00",
//                 participants: 8,
//                 maxParticipants: 12,
//             },
//         ],
//     },
//     "LG 트윈스": {
//         schedule: {home: "LG", away: "KT", status: "예정", score: [0, 0]},
//         posts: [
//             {
//                 profile: "/profile/party1.png",
//                 nickname: "엘지빠돌이",
//                 title: "비 예보 있어서 걱정이네",
//                 date: "2025.05.02 15:30",
//             },
//         ],
//         parties: [],
//     },
//     "삼성 라이온즈": {
//         schedule: {home: "삼성", away: "SSG", status: "경기중", score: [2, 4]},
//         posts: [],
//         parties: [],
//     },
// };

const sampleData = { // 차후 Match MSA 연결 시 적용
    "NC": {
        schedule: { home: "NC", away: "삼성", status: "종료", score: [5, 3] },
        posts: [
            { profile: "/profile/nc1.jpg", nickname: "NC빠", title: "박민우 대박", date: "2025.05.22 18:00" },
        ]
    },
    "삼성": {
        schedule: { home: "삼성", away: "LG", status: "예정", score: [0, 0] },
        posts: [
            { profile: "/profile/ss1.jpg", nickname: "라이언즈짱", title: "구자욱 살아났네", date: "2025.05.22 16:50" },
        ]
    },
    "두산": {
        schedule: { home: "두산", away: "한화", status: "종료", score: [2, 6] },
        posts: []
    },
    "한화": {
        schedule: { home: "한화", away: "KT", status: "경기중", score: [1, 3] },
        posts: [
            { profile: "/profile/hh1.jpg", nickname: "불꽃한화", title: "오늘 불펜 괜찮은데?", date: "2025.05.22 17:30" },
        ]
    },
    "KIA": {
        schedule: { home: "KIA", away: "롯데", status: "예정", score: [0, 0] },
        posts: []
    },
    "KT": {
        schedule: { home: "KT", away: "두산", status: "종료", score: [7, 4] },
        posts: [
            { profile: "/profile/kt1.jpg", nickname: "ktkt", title: "강백호 미쳤다", date: "2025.05.22 14:00" },
        ]
    },
    "롯데": {
        schedule: { home: "롯데", away: "SSG", status: "예정", score: [0, 0] },
        posts: []
    },
    "LG": {
        schedule: { home: "LG", away: "NC", status: "종료", score: [6, 1] },
        posts: [
            { profile: "/profile/lg1.jpg", nickname: "엘지사랑", title: "문보경 미쳤다 ㄷㄷ", date: "2025.05.22 13:00" },
        ]
    },
    "SSG": {
        schedule: { home: "SSG", away: "키움", status: "예정", score: [0, 0] },
        posts: []
    },
    "키움": {
        schedule: { home: "키움", away: "KIA", status: "경기중", score: [3, 3] },
        posts: [
            { profile: "/profile/wo1.jpg", nickname: "영웅단", title: "이정후 홈런!", date: "2025.05.22 15:10" },
        ]
    },
};

export default function MainPage() {
    const [showCasterbot, setShowCasterbot] = useState(false);
    const [teams2, setTeams2] = useState([]);
    const [activeTeamIndex, setActiveTeamIndex] = useState(0);
    const selectedTeam = teams2[activeTeamIndex];

    const [showModal, setShowModal] = useState(false);
    const [tempTeam, setTempTeam] = useState(selectedTeam);

    const [favoriteMap, setFavoriteMap] = useState({});
    const [selectedFavorites, setSelectedFavorites] = useState([]);

    useEffect(() => {
        const baseUrl = process.env.REACT_APP_LOCAL_BACKEND_URI;
        axios.get(`${baseUrl}/user/profile`, { withCredentials: true })
            .then(res => {
                const favorites = res.data.favoriteTeams;
                const map = {};
                favorites.forEach(fav => {
                    map[fav.teamId] = fav.displayOrder;
                });
                setFavoriteMap(map);
                const sorted = [...favorites].sort((a, b) => a.displayOrder - b.displayOrder);
                setSelectedFavorites(sorted.map(f => f.teamId));
            })
            .catch(err => console.error("선호 팀 정보 가져오기 실패", err));
    }, []);

    useEffect(() => {
        const fetchUserFavoriteTeams = async () => {
            const baseUrl = process.env.REACT_APP_LOCAL_BACKEND_URI;
            try {
                const res = await axios.get(`${baseUrl}/user/profile`, {withCredentials: true});
                const data = res.data;
                const sortedFavorites = data.favoriteTeams.sort((a, b) => a.displayOrder - b.displayOrder);
                const tabs = sortedFavorites
                    .map(fav => {
                        const team = teamInfoMap.find(info => info.id === fav.teamId);
                        return team?.name;
                    })
                    .filter(Boolean);
                setTeams2(tabs);
            } catch (err) {
                console.error('사용자 선호 팀 목록 불러오기 실패:', err);
            }
        };

        fetchUserFavoriteTeams();
    }, []);

    const handleOpenModal = () => {
        setTempTeam(selectedTeam);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSelectTeam = async () => {
        const baseUrl = process.env.REACT_APP_LOCAL_BACKEND_URI;
        try {
            const requests = selectedFavorites.map((teamId, index) => ({
                teamId,
                displayOrder: index + 1
            }));
            await axios.put(`${baseUrl}/user/favorite-teams`, requests, { withCredentials: true });
            setFavoriteMap(Object.fromEntries(requests.map(r => [r.teamId, r.displayOrder])));
            // Inserted block: update tabs and active index
            const updatedTabs = selectedFavorites
                .map(teamId => teamInfoMap.find(team => team.id === teamId)?.name)
                .filter(Boolean);
            setTeams2(updatedTabs);
            setActiveTeamIndex(0);
            setShowModal(false);
        } catch (err) {
            console.error("선호 팀 저장 실패", err);
        }
    };

    // const { schedule, posts, parties } = sampleData[selectedTeam];

    // Schedule extraction logic
    const currentMatch = sampleData[selectedTeam]?.schedule
      ? {
          home_team_name: sampleData[selectedTeam].schedule.home,
          away_team_name: sampleData[selectedTeam].schedule.away,
          home_score: sampleData[selectedTeam].schedule.score?.[0],
          away_score: sampleData[selectedTeam].schedule.score?.[1],
        }
      : null;
    const schedule = currentMatch
      ? {
          home: currentMatch.home_team_name,
          away: currentMatch.away_team_name,
          status:
            currentMatch.home_score != null && currentMatch.away_score != null
              ? "종료"
              : "예정",
          score: [
            currentMatch.home_score ?? 0,
            currentMatch.away_score ?? 0,
          ],
        }
      : null;

    return (
        <div className={styles.main_page}>
            <TeamTabNav
                tabs={teams2}
                activeIndex={activeTeamIndex}
                onTabClick={setActiveTeamIndex}
                onPlusClick={handleOpenModal}
            />
            <div>
                <h2 className={styles.sectionTitle}>오늘의 일정</h2>
                {schedule ? (
                  <ScheduleSection schedule={schedule} />
                ) : (
                  <p className={styles.noContentText}>해당 팀의 경기가 없습니다.</p>
                )}

                <h2 className={styles.sectionTitleWithMargin}>인기 포스트</h2>
                {/*{posts.length > 0 ? (*/}
                {/*    posts.map((post, i) => <PopularPost key={i} {...post} />)*/}
                {/*) : (*/}
                {/*    <p className={styles.noContentText}>게시글이 없습니다.</p>*/}
                {/*)}*/}
            </div>
            <h2 className={styles.sectionTitleWithMargin}>나의 직관팟</h2>
            {/*{parties.length > 0 ? (*/}
            {/*    parties.map((party, i) => <MyPartyCard key={i} {...party} />)*/}
            {/*) : (*/}
            {/*    <p className={styles.noContentText}>등록된 직관팟이 없습니다.</p>*/}
            {/*)}*/}
            <CasterbotButton onClick={() => setShowCasterbot(true)}/>

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
            {showModal && (
                <div
                    className={styles.modalOverlay}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="community-modal-title"
                >
                    <div className={styles.modalContent}>
                        <h2 id="community-modal-title" className={styles.modalTitle}>선호 팀 선택</h2>
                        <div
                            className={styles.teamGrid}
                            role="radiogroup"
                            aria-label="팀 선택"
                        >
                            {teamInfoMap.map((team) => (
                                <div key={team.id} className={styles.teamBtnWrapper}>
                                    <button
                                        className={`${styles.teamBtn} ${
                                            selectedFavorites.includes(team.id) ? styles.teamBtnSelected : ''
                                        }`}
                                        onClick={() => {
                                            setSelectedFavorites(prev => {
                                                if (prev.includes(team.id)) {
                                                    const index = prev.indexOf(team.id);
                                                    const newList = prev.filter(id => id !== team.id);
                                                    return newList;
                                                } else {
                                                    return [...prev, team.id];
                                                }
                                            });
                                        }}
                                        role="radio"
                                        aria-checked={selectedFavorites.includes(team.id)}
                                        aria-label={`${team.name} 선택`}
                                    >
                                        <img src={team.logo} alt="" className={styles.teamModalLogo}/>
                                        <span>{team.name}</span>
                                    </button>
                                    {selectedFavorites.includes(team.id) && (
                                        <div className={styles.displayOrderBadge}>
                                            {selectedFavorites.indexOf(team.id) + 1}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.selectBtn}
                                onClick={handleSelectTeam}
                                aria-label="선택한 팀으로 이동"
                            >
                                선택
                            </button>
                            <button
                                className={styles.cancelBtn}
                                onClick={handleCloseModal}
                                aria-label="팀 선택 취소"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}
