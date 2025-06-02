// 경기 정보 및 AI 시뮬레이션 페이지
import TabNav from '../../components/TabNav/TabNav';
import styles from './MatchInfo.module.css';
import React, {useState, useEffect} from "react";
// import {useNavigate} from "react-router-dom";
import SubTabNav from "../../components/TabNav/SubTabNav";
import LineupDraggableList from '../../components/DragNDrop/LineupDraggableList';
import RecordsSection from "../../components/GameLogData/RecordsSection";
import CasterbotModal from "../Chatbot/CasterbotModal";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import axios from 'axios';
import Modal from "../../components/Modal/Modal";

function MatchInfo() {
    const [activeTab, setActiveTab] = useState(0);
    const [activeSubTab, setActiveSubTab] = useState(0);
    const tabLabels = ["경기 정보", "AI 시뮬레이터"];
    const subTabLabels = ["라인업 설정", "경기 로그", "기록"];
    const [showCasterbot, setShowCasterbot] = useState(false);
    const [showModal, setShowModal] = useState(false);
    // const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

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
                .find(row => row.startsWith('access='))
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
                    <section className={styles.teamsSection}>
                        <div className={styles.team}>
                            <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo_Big/HH.png`} alt="한화 이글스 로고"
                                 className={styles.teamLogo}/>
                            <span className={styles.teamName}>한화 이글스</span>
                            <div className={styles.pitcherCount}>선발투수-와이스</div>
                        </div>
                        <div className={styles.matchBox}>
                            <div className={styles.matchPark}>수원</div>
                            <div className={styles.matchTime}>18:30</div>
                            <div className={styles.matchBadgeArea}>
                                <span className={styles.matchBadge}>경기전</span>
                            </div>
                        </div>

                        <div className={styles.team}>
                            <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo_Big/KT.png`} alt="KT 위즈 로고"
                                 className={styles.teamLogo}/>
                            <span className={styles.teamName}>KT 위즈</span>
                            <div className={styles.pitcherCount}>선발투수-쿠에바스</div>
                        </div>
                    </section>
                    <section className={styles.vsRecordSection}>
                        <h2 className={styles.sectionTitle}>상대전적</h2>
                        <div className={styles.metricValues}>
                            <span className={styles.metricValueLeft}>1승 1무 3패</span>
                            <div className={styles.metricBar}>
                                <div className={styles.progressLeft} style={{width: '20%'}}></div>
                                <div className={styles.progressDraw} style={{width: '15%'}}></div>
                                <div className={styles.progressRight} style={{width: '65%'}}></div>
                            </div>
                            <span className={styles.metricValueRight}>3승 1무 1패</span>
                        </div>
                    </section>

                    <section className={styles.recentSection}>
                        <h2 className={styles.sectionTitle}>최근 5경기</h2>
                        <div className={styles.metricsRow}>
                            <div className={styles.metric}>
                                <span className={styles.metricLabel}>타율</span>
                                <div className={styles.metricValues}>
                                    <span className={styles.metricValueLeft}>0.233</span>
                                    <div className={styles.metricBar}>
                                        <div className={styles.metricBarLeft} style={{width: '40%'}}></div>
                                        <div className={styles.metricBarRight} style={{width: '60%'}}></div>
                                    </div>
                                    <span className={styles.metricValueRight}>0.345</span>
                                </div>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.metricLabel}>평균자책점</span>
                                <div className={styles.metricValues}>
                                    <span className={styles.metricValueLeft}>3.21</span>
                                    <div className={styles.metricBar}>
                                        <div className={styles.metricBarLeft} style={{width: '55%'}}></div>
                                        <div className={styles.metricBarRight} style={{width: '45%'}}></div>
                                    </div>
                                    <span className={styles.metricValueRight}>2.01</span>
                                </div>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.metricLabel}>승무패</span>
                                <div className={styles.metricValues}>
                                    <span className={styles.metricValueLeft}>1승 1무 3패</span>
                                    <div className={styles.metricBar}>
                                        <div className={styles.metricBarLeft} style={{width: '30%'}}></div>
                                        <div className={styles.metricBarRight} style={{width: '70%'}}></div>
                                    </div>
                                    <span className={styles.metricValueRight}>4승 0무 1패</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}
            {/* AI 시뮬레이터 서브메뉴 */}
            {activeTab === 1 && (
                <div className={styles.contents}>
                    {/*<p className={styles.simTitle}>시뮬레이팅할 팀을 선택해 주세요.</p>*/}
                    <section className={styles.teamsSection}>
                        <div className={styles.team}>
                            <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo_Big/HH.png`} alt="한화 이글스 로고"
                                 className={styles.teamLogo}/>
                            <span className={styles.teamName}>한화 이글스</span>
                            <div className={styles.pitcherCount}>선발투수-와이스</div>
                        </div>
                        <div className={styles.matchBox}>
                            <div className={styles.matchPark}>수원</div>
                            <div className={styles.matchTime}>18:30</div>
                            <div className={styles.matchBadgeArea}>
                                <span className={styles.matchBadge}>경기전</span>
                            </div>
                        </div>

                        <div className={styles.team}>
                            <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo_Big/KT.png`} alt="KT 위즈 로고"
                                 className={styles.teamLogo}/>
                            <span className={styles.teamName}>KT 위즈</span>
                            <div className={styles.pitcherCount}>선발투수-쿠에바스</div>
                        </div>
                    </section>
                    <button className={styles.simStart} onClick={startSimulate}>시뮬레이션 시작!</button>

                    <SubTabNav tabs={subTabLabels} onTabChange={setActiveSubTab}/>
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
                                        <th>P</th>
                                        <th>결과</th>
                                    </tr>
                                    </thead>
                                    <tbody className={styles.gamelog}>
                                    {simulationResult.flatMap((inningData, i) =>
                                        inningData.plays.map((play, j) => {
                                            const [batter, result] = play.split(":").map(s => s.trim());
                                            return {
                                                id: `${i}-${j}`,
                                                isFirstInInning: j === 0,
                                                inning: inningData.title,
                                                pitcher: '-', // 투수 정보 없음
                                                batter,
                                                result
                                            };
                                        })
                                    ).map((log) => (
                                        <tr key={log.id}>
                                            <td>{log.isFirstInInning ? <strong>{log.inning}</strong> : ""}</td>
                                            <td>{log.pitcher}</td>
                                            <td>{log.batter}</td>
                                            <td>-</td>
                                            <td>{log.result}</td>
                                        </tr>
                                    ))}
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