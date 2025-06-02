import axios from "axios";
import React, {useEffect, useState, useRef} from "react";
import styles from "./MainPage.module.css";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import CasterbotModal from "../Chatbot/CasterbotModal";
import TeamTabNav from "../../components/TeamTabNav/TeamTabNav";
import ScheduleSection from "./ScheduleSection";
import DummyMatchData from "../../components/DummyData/DummyMatchData";
import {teamInfoMap} from "../../utils/teamInfoMap";

export default function MainPage() {
    const [showCasterbot, setShowCasterbot] = useState(false);
    const [teams2, setTeams2] = useState([]);
    const [activeTeamIndex, setActiveTeamIndex] = useState(0);
    const selectedTeam = teams2[activeTeamIndex];

    const [showModal, setShowModal] = useState(false);
    const [tempTeam, setTempTeam] = useState(selectedTeam);

    const [favoriteMap, setFavoriteMap] = useState({});
    const [selectedFavorites, setSelectedFavorites] = useState([]);

    const baseUrl = process.env.REACT_APP_LOCAL_BACKEND_URI;
    const sseUrl = `${baseUrl}/user/notifications/connect`;

    // Reference to hold EventSource instance
    const eventSourceRef = useRef(null);

    function setupEventHandlers(es) {
      // 서버가 전송하는 이벤트를 받을 때 처리
      es.onmessage = (e) => {
        const text = e.data;
        if (text.trim().startsWith("{")) {
          try {
            const notification = JSON.parse(text);
            console.log("새 알림 도착:", notification);
            // TODO: 받은 알림을 상태나 Context에 저장하여 화면에 반영
          } catch (err) {
            console.error("JSON 파싱 중 오류:", err);
          }
        } else {
          console.log("SSE 비-JSON 메시지:", text);
        }
      };

      es.onerror = (err) => {
        console.error("SSE 연결 오류:", err);
          if (es.readyState === EventSource.CLOSED) {
                  console.log("SSE 연결이 닫혔습니다. 5초 후 재연결 시도...");
                  setTimeout(() => {
                        if (eventSourceRef.current === es) {
                              const newEs = new EventSource(sseUrl, { withCredentials: true });
                              eventSourceRef.current = newEs;
                              // 이벤트 핸들러 재설정
                                  setupEventHandlers(newEs);
                            }
                      }, 5000);
                }
      };
    }

    useEffect(() => {
        const fetchUserProfileAndFavorites = async () => {
            try {
                const res = await axios.get(`${baseUrl}/user/profile`, {withCredentials: true});
                const favorites = res.data.favoriteTeams;

                const map = {};
                if (Array.isArray(favorites)) {
                    favorites.forEach(fav => {
                        map[fav.teamId] = fav.displayOrder;
                    });
                }
                setFavoriteMap(map);

                const sortedFavorites = Array.isArray(favorites) ? [...favorites].sort((a, b) => a.displayOrder - b.displayOrder) : [];
                const teamIds = sortedFavorites.map(f => f.teamId);
                setSelectedFavorites(teamIds);

                const tabs = teamIds
                    .map(teamId => {
                        const team = teamInfoMap.find(info => info.id === teamId);
                        return team?.name;
                    })
                    .filter(Boolean);
                setTeams2(tabs);
            } catch (err) {
                console.error("선호 팀 정보 가져오기 실패:", err);
            }
        };

        fetchUserProfileAndFavorites();
    }, []);

    // SSE 구독: 로그인 후 "/home"에 도착할 때 바로 실행
    useEffect(() => {
      // 브라우저 기본 EventSource는 쿠키에 들어있는 JWT를 자동으로 포함
      const es = new EventSource(sseUrl, { withCredentials: true });
      eventSourceRef.current = es;

      setupEventHandlers(es);

      // 컴포넌트 언마운트 시에는 EventSource 닫기
      return () => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      };
    }, []);

    const handleOpenModal = () => {
        setTempTeam(selectedTeam);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSelectTeam = async () => {
        try {
            const requests = selectedFavorites.map((teamId, index) => ({
                teamId,
                displayOrder: index + 1
            }));
            await axios.put(`${baseUrl}/user/favorite-teams`, requests, {withCredentials: true});
            setFavoriteMap(Object.fromEntries(requests.map(r => [r.teamId, r.displayOrder])));
            // Inserted block: update tabs and active index
            const updatedTabs = selectedFavorites
                .map(teamId => teamInfoMap.find(team => team.id === teamId)?.name)
                .filter(Boolean);
            setTeams2(updatedTabs);
            setActiveTeamIndex(0);
            setShowModal(false);
        } catch (err) {
            alert("선호 팀 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    };

    // const { schedule, posts, parties } = sampleData[selectedTeam];

    // Schedule extraction logic
    const currentMatch = DummyMatchData[selectedTeam]?.schedule
        ? {
            home_team_name: DummyMatchData[selectedTeam].schedule.home,
            away_team_name: DummyMatchData[selectedTeam].schedule.away,
            home_score: DummyMatchData[selectedTeam].schedule.score?.[0],
            away_score: DummyMatchData[selectedTeam].schedule.score?.[1],
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
                    <ScheduleSection schedule={schedule}/>
                ) : (
                    <p className={styles.noContentText}>해당 팀의 경기가 없습니다.</p>
                )}

                <h2 className={styles.sectionTitleWithMargin}>인기 포스트</h2>
                {/* TODO: 이후 ISSUE에서 커뮤니티 Service 수정 시 적용 예정 */}
                {/*{posts.length > 0 ? (*/}
                {/*    posts.map((post, i) => <PopularPost key={i} {...post} />)*/}
                {/*) : (*/}
                {/*    <p className={styles.noContentText}>게시글이 없습니다.</p>*/}
                {/*)}*/}
            </div>
            <h2 className={styles.sectionTitleWithMargin}>나의 직관팟</h2>
            {/* TODO: 이후 ISSUE에서 TWP SERVICE merge 이후 적용 예정 */}
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
