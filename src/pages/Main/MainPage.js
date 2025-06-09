import axios from "axios";
import React, {useEffect, useState, useRef} from "react";
import { useAuth} from "../../utils/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./MainPage.module.css";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import CasterbotModal from "../Chatbot/CasterbotModal";
import TeamTabNav from "../../components/TeamTabNav/TeamTabNav";
import ScheduleSection from "./ScheduleSection";
import DummyMatchData from "../../components/DummyData/DummyMatchData";
import {teamInfoMap, teamInfoMapCommunity} from "../../utils/teamInfoMap";

export default function MainPage() {
    const { user } = useAuth();
    const loginUserId = user?.id;
    const [showCasterbot, setShowCasterbot] = useState(false);
    const [teams2, setTeams2] = useState([]);
    const [activeTeamIndex, setActiveTeamIndex] = useState(0);
    const selectedTeam = teams2[activeTeamIndex];

    const [showModal, setShowModal] = useState(false);
    const [tempTeam, setTempTeam] = useState(selectedTeam);

    const [favoriteMap, setFavoriteMap] = useState({});
    const [selectedFavorites, setSelectedFavorites] = useState([]);
    const [allMatches, setAllMatches] = useState([]);
    const [myApprovalPartyDetail, setMyApprovalPartyDetail] = useState(null);
    const today = new Date().toISOString().split("T")[0];

    // 인기 포스트 상태
    const [popularPosts, setPopularPosts] = useState([]);

    const baseUrl = process.env.REACT_APP_LOCAL_BACKEND_URI;
    const sseUrl = `${baseUrl}/user/notifications/connect`;

    const navigate = useNavigate();

    // Reference to hold EventSource instance
    const eventSourceRef = useRef(null);

    function setupEventHandlers(es) {
        // 서버가 전송하는 이벤트를 받을 때 처리
        es.onmessage = (e) => {
            const text = e.data;
            if (text.trim().startsWith("{")) {
                try {
                    const notification = JSON.parse(text);
                    // TODO: 받은 알림을 상태나 Context에 저장하여 화면에 반영
                } catch (err) {
                    console.error("JSON 파싱 중 오류:", err);
                }
            }
        };

        es.onerror = (err) => {
            console.error("SSE 연결 오류:", err);
            if (es.readyState === EventSource.CLOSED) {
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

    // 인기 포스트 가져오기 (선호 팀 변경 또는 탭 변경 시)
    useEffect(() => {
        const fetchPopularPosts = async () => {
            try {
                const selectedTeamId = selectedFavorites[activeTeamIndex];
                const teamInfo = teamInfoMapCommunity.find(info => info.id === selectedTeamId);
                if (!teamInfo) return;

                const res = await axios.get(`${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/${teamInfo.teamId}`, {
                    withCredentials: true,
                });

                const posts = res.data;
                const sorted = posts.sort((a, b) => b.view - a.view);
                setPopularPosts(sorted.slice(0, 1)); // top 1
            } catch (err) {
                console.error("팀별 게시글 가져오기 실패:", err);
            }
        };

        if (selectedFavorites.length > 0) {
            fetchPopularPosts();
        }
    }, [selectedFavorites, activeTeamIndex]);

useEffect(() => {
    // matchId가 1152인 경우, 해당 matchId에서 로그인 사용자가 작성한 직관팟을 따로 가져오도록 함
    const fetchMyCreatedPartyForMatch1152 = async () => {
        if (!loginUserId) return;
        try {
            const twpBase = process.env.REACT_APP_LOCAL_BACKEND_TWP_URI;
            const res = await axios.get(`${twpBase}/party`, {
                withCredentials: true,
                params: { matchId: 1152 }
            });
            const parties = res.data;
            const myParty = parties.find(p => p.writerId === loginUserId);
            if (myParty) {
                const detailRes = await axios.get(`${twpBase}/party/${myParty.partyId}`, {
                    withCredentials: true
                });
                setMyApprovalPartyDetail(detailRes.data);
                return true;
            }
        } catch (err) {
            console.error("matchId 1152에서 작성자 직관팟 조회 실패:", err);
        }
        return false;
    };

    const fetchMyActiveParties = async () => {
        try {
            const twpBase = process.env.REACT_APP_LOCAL_BACKEND_TWP_URI;
            const res = await axios.get(`${twpBase}/party/applied-parties`, {
                withCredentials: true,
            });

            const activeParties = res.data.filter(
                p => !p.isEnded &&
                    (p.writerId === loginUserId ||
                     p.partyJoinRequestStatus === '채팅방 입장!' ||
                     p.partyJoinRequestStatus === '승인')
            );

            if (activeParties.length > 0) {
                const partyId = activeParties[0].partyId;
                const detailRes = await axios.get(`${twpBase}/party/${partyId}`, {
                    withCredentials: true
                });

                setMyApprovalPartyDetail(detailRes.data);
            } else {
                setMyApprovalPartyDetail(null);
            }
        } catch (err) {
            console.error("내 직관팟 정보 조회 실패:", err);
        }
    };

    if (loginUserId) {
        // matchId 1152 우선 조회, 없으면 기존 로직
        fetchMyCreatedPartyForMatch1152().then(found => {
            if (!found) {
                fetchMyActiveParties();
            }
        });
    }
}, [loginUserId]);

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

    // Fetch today's matches
    useEffect(() => {
        const fetchTodayMatches = async () => {
            try {
                const token = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith("Access="))
                    ?.split("=")[1];
                const res = await axios.get(
                    `${process.env.REACT_APP_AI_API_BASE}/matches`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true,
                        params: { date: today },
                    }
                );
                setAllMatches(res.data);
            } catch (err) {
                console.error("오늘 경기 조회 실패:", err);
            }
        };
        fetchTodayMatches();
    }, [today]);

    const todaySchedule = React.useMemo(() => {
        if (!selectedTeam || allMatches.length === 0) return null;
        return (
            allMatches.find(
                (m) =>
                    m.home_team_name === selectedTeam ||
                    m.away_team_name === selectedTeam
            ) || null
        );
    }, [allMatches, selectedTeam]);

    const scheduleForSection = todaySchedule
        ? {
            home: todaySchedule.home_team_name,
            away: todaySchedule.away_team_name,
            status:
                todaySchedule.status_code === "RESULT"
                    ? "종료"
                    : todaySchedule.status_code === "STARTED"
                        ? "경기중"
                        : "경기전",
            score: [
                todaySchedule.away_team_score ?? 0,
                todaySchedule.home_team_score ?? 0,
            ],
        }
        : null;

    const onEnterChat = (chatRoomId) => {
        navigate(`/chat/party/${chatRoomId}`);
    };

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
                {scheduleForSection ? (
                    <ScheduleSection schedule={scheduleForSection} />
                ) : (
                    <p className={styles.noContentText}>해당 팀의 경기가 없습니다.</p>
                )}
                <h2 className={styles.sectionTitleWithMargin}>인기 포스트</h2>
                {popularPosts.length > 0 ? (
                    popularPosts.map((post, i) => (
                        <div
                            key={i}
                            className={styles.partyCard}
                            onClick={() => {
                                console.log("🔥 게시글 이동:", post.teamTag, post.postId);
                                navigate(`/community/post/${post.teamTag}/${post.postId}`);
                            }}
                            style={{ cursor: "pointer" }}
                        >
                            {post.image && (
                                <img
                                    src={`${process.env.REACT_APP_PRESIGNED_URI}/${post.image}`}
                                    alt="게시글 썸네일"
                                    className={styles.playerImg}
                                />
                            )}
                            <div className={styles.partyContent}>
                                <div className={styles.partyTitle}>{post.title}</div>
                                <div className={styles.partyMeta}>
                                    <span>작성자: {post.writerNickname}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.noContentText}>게시글이 없습니다.</p>
                )}
            </div>
            <h2 className={styles.sectionTitleWithMargin}>나의 직관팟</h2>
            {myApprovalPartyDetail && (
                <div
                    className={styles.partyCard}
                    onClick={() => {
                        const chatRoomId = myApprovalPartyDetail.chatRoomId;
                        if (chatRoomId) {
                            navigate(`/chat/party/${chatRoomId}`);
                        } else {
                            alert("채팅방 정보를 불러올 수 없습니다.");
                        }
                    }}
                    style={{ cursor: "pointer" }}
                >
                    <img
                        src={
                            myApprovalPartyDetail.partyThumbnailUrls?.[0]
                                ? `${process.env.REACT_APP_PRESIGNED_URI}/${myApprovalPartyDetail.partyThumbnailUrls[0]}`
                                : `${process.env.PUBLIC_URL}/Logo/jikgwanprofile.png`
                        }
                        alt="직관팟 썸네일"
                        className={styles.playerImg}
                    />
                    <div className={styles.partyContent}>
                        <div className={styles.tags}>
                            <span className={styles.tag}>{myApprovalPartyDetail.partyJoinMethod}</span>
                            {myApprovalPartyDetail.partyAges?.map((tag, index) => (
                                <span
                                    key={index}
                                    className={`${styles.tag} ${index === 2 ? styles.tagHighlight : ''}`}
                                >
                        {tag}
                      </span>
                            ))}
                            <span className={`${styles.tag} ${styles.tagHighlight}`}>
                      {myApprovalPartyDetail.availableGender}
                    </span>
                        </div>
                        <div className={styles.partyTitle}>{myApprovalPartyDetail.title}</div>
                        <div className={styles.partyMeta}>
                            <span>{myApprovalPartyDetail.authorName || '작성자'}</span>
                            <span>{myApprovalPartyDetail.authorAge || '나이'}</span>
                            <span>
                      {myApprovalPartyDetail.authorGender === 'MALE'
                          ? '남성'
                          : myApprovalPartyDetail.authorGender === 'FEMALE'
                              ? '여성'
                              : '기타'}
                    </span>
                            <span>· {myApprovalPartyDetail.matchDate}</span>
                        </div>

                            <div className={styles.partyStatus}>
                                <div className={styles.avatars}>
                                    {myApprovalPartyDetail.userThumbnailUrls?.map((url, i) => (
                                        <img
                                            key={i}
                                            src={
                                                url
                                                    ? `${process.env.REACT_APP_PRESIGNED_URI}/${url}`
                                                    : `${process.env.PUBLIC_URL}/Logo/profile.png`
                                            }
                                            alt="프로필"
                                        />
                                    ))}
                                </div>
                                <div className={styles.slot}>
                                    {myApprovalPartyDetail.currentParticipantsCount}/{myApprovalPartyDetail.maximumParticipantsCount}
                                </div>
                            </div>
                    </div>
                </div>
            )}
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
