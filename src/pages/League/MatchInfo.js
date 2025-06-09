// 경기 정보 및 AI 시뮬레이션 페이지
import TabNav from '../../components/TabNav/TabNav';
import styles from './MatchInfo.module.css';
import React, {useEffect, useState} from "react";
import {useLocation, useParams} from 'react-router-dom';
import {teamInfoMapBig} from "../../utils/teamInfoMap";
import SubTabNav from "../../components/TabNav/SubTabNav";
import LineupDraggableList from '../../components/DragNDrop/LineupDraggableList';
import RecordsSection from "../../components/GameLogData/RecordsSection";
import CasterbotModal from "../Chatbot/CasterbotModal";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import axios from 'axios';
import Modal from "../../components/Modal/Modal";

const getTeamLogoByName = (teamName) => {
    const team = teamInfoMapBig.find(item => item.name === teamName);
    return team ? team.logo : `${process.env.PUBLIC_URL}/Logo/TeamLogo/default.png`;
};

function MatchInfo() {
    const {gameId} = useParams();
    const location = useLocation();
    const {homeTeam, awayTeam, stadium, mainTime} = location.state || {};
    const [matchDetail, setMatchDetail] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [activeSubTab, setActiveSubTab] = useState(0);
    const tabLabels = ["경기 정보", "AI 시뮬레이터"];
    const subTabLabels = ["라인업 설정", "경기 로그", "기록"];
    const [showCasterbot, setShowCasterbot] = useState(false);
    const [showModal, setShowModal] = useState(false);
    // const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchMatchDetail = async () => {
            try {
                // Extract access token from document.cookie
                const token = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('Access='))
                    ?.split('=')[1];
                // Directly fetch match detail by naver game ID
                const response = await axios.get(
                    `${process.env.REACT_APP_AI_API_BASE}/match/${gameId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        withCredentials: true
                    }
                );
                setMatchDetail(response.data);
            } catch (error) {
                console.error('경기 상세 조회 실패:', error);
            }
        };
        fetchMatchDetail();
    }, [gameId]);

    const [homeBatters, setHomeBatters] = useState([
        {id: '1', name: '김태연', position: '좌익수', hand: '우타'},
        {id: '2', name: '문현빈', position: '지명타자', hand: '좌타'},
        {id: '3', name: '플로리엘', position: '중견수', hand: '좌타'},
        {id: '4', name: '노시환', position: '3루수', hand: '우타'},
        {id: '5', name: '채은성', position: '1루수', hand: '우타'},
        {id: '6', name: '황영묵', position: '2루수', hand: '좌타'},
        {id: '7', name: '이진영', position: '우익수', hand: '우타'},
        {id: '8', name: '최재훈', position: '포수', hand: '우타'},
        {id: '9', name: '심우준', position: '유격수', hand: '우타'},
        {id: '10', name: '안치홍', position: '2루수', hand: '우타'},
        {id: '11', name: '김상복', position: '유격수', hand: '우타'},
        {id: '12', name: '피경준', position: '3루수', hand: '좌타'}
    ]);
    const [awayBatters, setAwayBatters] = useState([
        {id: '1', name: '강백호', position: '지명타자', hand: '좌타'},
        {id: '2', name: '로하스', position: '우익수', hand: '양타'},
        {id: '3', name: '허경민', position: '3루수', hand: '우타'},
        {id: '4', name: '김민혁', position: '좌익수', hand: '좌타'},
        {id: '5', name: '장성우', position: '포수', hand: '우타'},
        {id: '6', name: '문상철', position: '1루수', hand: '우타'},
        {id: '7', name: '천성호', position: '2루수', hand: '우타'},
        {id: '8', name: '안현민', position: '우익수', hand: '우타'},
        {id: '9', name: '심우준', position: '유격수', hand: '우타'},
        {id: '10', name: '권동진', position: '유격수', hand: '좌타'},
        {id: '11', name: '배정대', position: '중견수', hand: '우타'},
        {id: '12', name: '김병준', position: '좌익수', hand: '좌타'}
    ]);
    const [simulationResult, setSimulationResult] = useState([]);

    const calculatePercentage = (value1, value2, defaultValue = 50) => {
        const num1 = parseFloat(value1) || 0;
        const num2 = parseFloat(value2) || 0;
        const sum = num1 + num2;
        return sum > 0 ? (num1 / sum) * 100 : defaultValue;
    };

    async function startSimulate() {
        const requestData = {
            home_team_name: "KT",
            home_players: [
                {id: 50030, position: "투수"},
                {id: 68050, position: "타자"},
                {id: 67025, position: "타자"},
                {id: 64004, position: "타자"},
                {id: 78548, position: "타자"},
                {id: 76313, position: "타자"},
                {id: 64166, position: "타자"},
                {id: 64007, position: "타자"},
                {id: 51003, position: "타자"},
                {id: 79402, position: "타자"},
            ],
            away_team_name: "한화",
            away_players: [
                {id: 52701, position: "투수"},
                {id: 50704, position: "타자"},
                {id: 50707, position: "타자"},
                {id: 55734, position: "타자"},
                {id: 62700, position: "타자"},
                {id: 64006, position: "타자"},
                {id: 66657, position: "타자"},
                {id: 66704, position: "타자"},
                {id: 69737, position: "타자"},
                {id: 78288, position: "타자"},
            ]
        };

        try {
            setActiveTab(1);
            setIsLoading(true); // 시작 시 로딩 ON
            // Extract access token from document.cookie
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('Access='))
                ?.split('=')[1];
            const response = await axios.post(
                `${process.env.REACT_APP_AI_API_BASE}/simulate`,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    withCredentials: true
                }
            );

            try {
                const parsed = JSON.parse(response.data.result);
                setSimulationResult(parsed);
            } catch (parseError) {
                console.error('시뮬레이션 결과 파싱 실패:', parseError);
                setSimulationResult([]);
                return;
            }
            setActiveSubTab(1); // 시뮬레이션 끝나면 경기 로그로 이동
        } catch (error) {
            console.error("시뮬레이션 요청 실패:", error);
            setShowModal(true);
        } finally {
            setIsLoading(false); // 종료 시 로딩 OFF
        }
    }

    return (
        <div className={styles.container}>
            <TabNav tabs={tabLabels} onTabChange={setActiveTab}/>
            {/* 경기 정보 서브메뉴 */}
            {activeTab === 0 && (
                <div>
                    {matchDetail && (
                        <section className={styles.teamsSection}>
                            {/* Away Team on Left */}
                            <div className={styles.team}>
                                <img
                                    src={getTeamLogoByName(awayTeam || matchDetail.away.team_name)}
                                    alt={`${awayTeam || matchDetail.away.team_name} 로고`}
                                    className={styles.teamLogo}
                                />
                                <span className={styles.teamName}>{awayTeam || matchDetail.away.team_name}</span>
                                <div className={styles.pitcherCount}>
                                    {matchDetail.away.starter && `선발투수 - ${matchDetail.away.starter}`}
                                </div>
                            </div>

                            {/* Center Box: Park, Time, Status */}
                            <div className={styles.matchBox}>
                                <div className={styles.matchPark}>{stadium || matchDetail.stadium}</div>
                                <div className={styles.matchTime}>
                                    {mainTime ||
                                        new Date(matchDetail.game_date_time).toLocaleTimeString('ko-KR', {
                                            timeZone: 'Asia/Seoul',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                </div>
                                <div className={styles.matchBadgeArea}>
                          <span className={styles.matchBadge}>
                            {matchDetail.status_code === 'RESULT'
                                ? '경기종료'
                                : matchDetail.status_code === 'STARTED'
                                    ? '경기중'
                                    : '경기전'}
                          </span>
                                </div>
                            </div>

                            {/* Home Team on Right */}
                            <div className={styles.team}>
                                <img
                                    src={getTeamLogoByName(homeTeam || matchDetail.home.team_name)}
                                    alt={`${homeTeam || matchDetail.home.team_name} 로고`}
                                    className={styles.teamLogo}
                                />
                                <span className={styles.teamName}>{homeTeam || matchDetail.home.team_name}</span>
                                <div className={styles.pitcherCount}>
                                    {matchDetail.home.starter && `선발투수 - ${matchDetail.home.starter}`}
                                </div>
                            </div>
                        </section>
                    )}
                    {matchDetail && (
                        <>
                            <section className={styles.vsRecordSection}>
                                <h2 className={styles.sectionTitle}>상대전적</h2>
                                <div className={styles.metricValues}>
                          <span className={styles.metricValueLeft}>
                            {matchDetail.season_vs_result.home_win}승 {matchDetail.season_vs_result.home_draw}무 {matchDetail.season_vs_result.home_lose}패
                          </span>
                                    <div className={styles.metricBar}>
                                        <div
                                            className={styles.progressLeft}
                                            style={{
                                                width: `${
                                                    (matchDetail.season_vs_result.home_win + matchDetail.season_vs_result.away_win) > 0
                                                        ? (matchDetail.season_vs_result.home_win /
                                                            (matchDetail.season_vs_result.home_win + matchDetail.season_vs_result.away_win) *
                                                            100)
                                                        : 50
                                                }%`
                                            }}
                                        ></div>
                                        <div
                                            className={styles.progressRight}
                                            style={{
                                                width: `${
                                                    matchDetail.season_vs_result.away_win /
                                                    (matchDetail.season_vs_result.home_win + matchDetail.season_vs_result.away_win) *
                                                    100
                                                }%`
                                            }}
                                        ></div>
                                    </div>
                                    <span className={styles.metricValueRight}>
                            {matchDetail.season_vs_result.away_win}승 {matchDetail.season_vs_result.away_draw}무 {matchDetail.season_vs_result.away_lose}패
                          </span>
                                </div>
                            </section>

                            <section className={styles.recentSection}>
                                <h2 className={styles.sectionTitle}>최근 5경기</h2>
                                <div className={styles.metricsRow}>
                                    {/* Batting Average */}
                                    <div className={styles.metric}>
                                        <span className={styles.metricLabel}>타율</span>
                                        <div className={styles.metricValues}>
                                            <span
                                                className={styles.metricValueLeft}>{matchDetail.home.recent_batting_average}</span>
                                            <div className={styles.metricBar}>
                                                <div
                                                    className={styles.metricBarLeft}
                                                    style={{
                                                        width: `${calculatePercentage(matchDetail.home.recent_batting_average, matchDetail.away.recent_batting_average)}%`
                                                    }}
                                                ></div>
                                                <div
                                                    className={styles.metricBarRight}
                                                    style={{
                                                        width: `${calculatePercentage(matchDetail.away.recent_batting_average, matchDetail.home.recent_batting_average)}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span
                                                className={styles.metricValueRight}>{matchDetail.away.recent_batting_average}</span>
                                        </div>
                                    </div>
                                    {/* ERA */}
                                    <div className={styles.metric}>
                                        <span className={styles.metricLabel}>평균자책점</span>
                                        <div className={styles.metricValues}>
                                            <span
                                                className={styles.metricValueLeft}>{matchDetail.home.recent_era}</span>
                                            <div className={styles.metricBar}>
                                                <div
                                                    className={styles.metricBarLeft}
                                                    style={{
                                                        width: `${
                                                            (parseFloat(matchDetail.away.recent_era) /
                                                                (parseFloat(matchDetail.home.recent_era) +
                                                                    parseFloat(matchDetail.away.recent_era))) *
                                                            100
                                                        }%`
                                                    }}
                                                ></div>
                                                <div
                                                    className={styles.metricBarRight}
                                                    style={{
                                                        width: `${
                                                            (parseFloat(matchDetail.home.recent_era) /
                                                                (parseFloat(matchDetail.home.recent_era) +
                                                                    parseFloat(matchDetail.away.recent_era))) *
                                                            100
                                                        }%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span
                                                className={styles.metricValueRight}>{matchDetail.away.recent_era}</span>
                                        </div>
                                    </div>
                                    {/* Win-Draw-Lose */}
                                    <div className={styles.metric}>
                                        <span className={styles.metricLabel}>승무패</span>
                                        <div className={styles.metricValues}>
                              <span className={styles.metricValueLeft}>
                                {matchDetail.home.recent_record.win}승 {matchDetail.home.recent_record.draw}무 {matchDetail.home.recent_record.lose}패
                              </span>
                                            <div className={styles.metricBar}>
                                                <div
                                                    className={styles.metricBarLeft}
                                                    style={{
                                                        width: `${
                                                            (matchDetail.home.recent_record.win /
                                                                (matchDetail.home.recent_record.win + matchDetail.away.recent_record.win)) * 100
                                                        }%`
                                                    }}
                                                ></div>
                                                <div
                                                    className={styles.metricBarRight}
                                                    style={{
                                                        width: `${
                                                            (matchDetail.away.recent_record.win /
                                                                (matchDetail.home.recent_record.win + matchDetail.away.recent_record.win)) * 100
                                                        }%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className={styles.metricValueRight}>
                                {matchDetail.away.recent_record.win}승 {matchDetail.away.recent_record.draw}무 {matchDetail.away.recent_record.lose}패
                              </span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            )}
            {/* AI 시뮬레이터 서브메뉴 */}
            {activeTab === 1 && (
                <div className={styles.contents}>
                    {/*<p className={styles.simTitle}>시뮬레이팅할 팀을 선택해 주세요.</p>*/}
                    {matchDetail && (
                        <section className={styles.teamsSection}>
                            {/* Away Team on Left */}
                            <div className={styles.team}>
                                <img
                                    src={getTeamLogoByName(awayTeam || matchDetail.away.team_name)}
                                    alt={`${awayTeam || matchDetail.away.team_name} 로고`}
                                    className={styles.teamLogo}
                                />
                                <span className={styles.teamName}>{awayTeam || matchDetail.away.team_name}</span>
                                <div className={styles.pitcherCount}>
                                    {matchDetail.away.starter && `선발투수 - ${matchDetail.away.starter}`}
                                </div>
                            </div>

                            {/* Center Box: Park, Time, Status */}
                            <div className={styles.matchBox}>
                                <div className={styles.matchPark}>{stadium || matchDetail.stadium}</div>
                                <div className={styles.matchTime}>
                                    {mainTime ||
                                        new Date(matchDetail.game_date_time).toLocaleTimeString('ko-KR', {
                                            timeZone: 'Asia/Seoul',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                </div>
                                <div className={styles.matchBadgeArea}>
                          <span className={styles.matchBadge}>
                            {matchDetail.status_code === 'RESULT'
                                ? '경기종료'
                                : matchDetail.status_code === 'STARTED'
                                    ? '경기중'
                                    : '경기전'}
                          </span>
                                </div>
                            </div>

                            {/* Home Team on Right */}
                            <div className={styles.team}>
                                <img
                                    src={getTeamLogoByName(homeTeam || matchDetail.home.team_name)}
                                    alt={`${homeTeam || matchDetail.home.team_name} 로고`}
                                    className={styles.teamLogo}
                                />
                                <span className={styles.teamName}>{homeTeam || matchDetail.home.team_name}</span>
                                <div className={styles.pitcherCount}>
                                    {matchDetail.home.starter && `선발투수 - ${matchDetail.home.starter}`}
                                </div>
                            </div>
                        </section>
                    )}
                    <button className={styles.simStart} onClick={startSimulate}>시뮬레이션 시작!</button>

                    <SubTabNav
                        tabs={subTabLabels}
                        onTabChange={setActiveSubTab}
                        activeIndex={activeSubTab}
                    />
                    {/* AI 시뮬레이션 라인업 설정 서브메뉴*/}
                    {activeSubTab === 0 && (
                        <div className={styles.simLineups}>
                            <div className={styles.lineupColumn}>
                                <div className={styles.pitcher}>와이스 <span>우투</span></div>
                                <LineupDraggableList
                                    batters={homeBatters}
                                    setBatters={setHomeBatters}
                                />
                            </div>
                            <div className={styles.lineupColumn}>
                                <div className={styles.pitcher}>쿠에바스 <span>우투</span></div>
                                <LineupDraggableList
                                    batters={awayBatters}
                                    setBatters={setAwayBatters}
                                />
                            </div>
                        </div>
                    )}
                    {/* 경기 로그 서브메뉴 */}
                    {activeSubTab === 1 && (
                        <div className={styles.contents}>
                            {isLoading ? (
                                <div className={styles.skeletonWrapper}>
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className={styles.skeletonRow}></div>
                                    ))}
                                </div>
                            ) : (
                                <table className={styles.gamelogbox}>
                                  <thead className={styles.gamelogHeader}>
                                    <tr>
                                      <th>이닝</th>
                                      <th>투수</th>
                                      <th>타자</th>
                                      <th>결과</th>
                                      <th>점수</th>
                                    </tr>
                                  </thead>
                                  <tbody className={styles.gamelog}>
                                    {simulationResult.map((inning, index) => {
                                      const plays = inning.plays;
                                      const score = inning.score;
                                      const isTop = inning.title.includes("초");
                                      const pitcher = isTop ? "문동주" : "소형준";

                                      return plays.map((play, playIndex) => {
                                        const [batter, resultRaw] = play.split(":");
                                        const result = resultRaw?.trim();

                                        return (
                                          <tr key={`${inning.title}-${playIndex}`}>
                                            {playIndex === 0 && (
                                              <td rowSpan={plays.length}>{inning.title}</td>
                                            )}
                                            <td>{pitcher}</td>
                                            <td>{batter}</td>
                                            <td>{result}</td>
                                            {playIndex === plays.length - 1 ? (
                                              <td rowSpan={1}>{score}</td>
                                            ) : (
                                              <td></td>
                                            )}
                                          </tr>
                                        );
                                      });
                                    })}
                                  </tbody>
                                </table>
                            )}
                        </div>
                    )}
                    {/* 기록 서브메뉴 */}
                    {activeSubTab === 2 && (
                        <RecordsSection homeBatters={homeBatters} awayBatters={awayBatters}/>
                    )}
                </div>
            )}
            <CasterbotButton onClick={() => setShowCasterbot(true)}/>

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
            {showModal && (
                <Modal
                    title="알림"
                    message="시뮬레이션 요청에 실패했습니다. 나중에 다시 시도해 주세요."
                    buttons={[
                        {
                            label: '확인', onClick: () => {
                                setShowModal(false)
                            }
                        }
                    ]}
                />
            )}
        </div>
    );
}

export default MatchInfo;