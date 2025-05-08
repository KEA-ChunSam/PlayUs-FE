import TabNav from '../../components/TabNav/TabNav';
import styles from './MatchInfo.module.css';
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import SubTabNav from "../../components/TabNav/SubTabNav";
import LineupDraggableList from '../../components/DragNDrop/LineupDraggableList';
import GameLogData from "../../components/GameLogData/GameLogData";
import RecordsSection from "../../components/GameLogData/RecordsSection";

function MatchInfo() {
    const [activeTab, setActiveTab] = useState(0);
    const [activeSubTab, setActiveSubTab] = useState(0);
    const tabLabels = ["경기 정보", "AI 시뮬레이터"];
    const subTabLabels = ["라인업 설정", "경기 로그", "기록"];
    const navigate = useNavigate();

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

    function startSimulate() {

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

                    {/*<section className={styles.vsRecordSection}>*/}
                    {/*    <h2 className={styles.sectionTitle}>상대전적</h2>*/}
                    {/*    <div className={styles.vsRecordBar}>*/}
                    {/*        <span className={styles.vsRecordLeft}>1승 1무 4패</span>*/}
                    {/*        <div className={styles.progressBar}>*/}
                    {/*            <div className={styles.progressLeft} style={{width: '20%'}}></div>*/}
                    {/*            <div className={styles.progressDraw} style={{width: '15%'}}></div>*/}
                    {/*            <div className={styles.progressRight} style={{width: '65%'}}></div>*/}
                    {/*        </div>*/}
                    {/*        <span className={styles.vsRecordRight}>4승 1무 1패</span>*/}
                    {/*    </div>*/}
                    {/*</section>*/}
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
                                {GameLogData.map((inningData, i) =>
                                    inningData.logs.map((log, j) => (
                                        <tr key={`${i}-${j}`}>
                                            <td>{j === 0 ? <strong>{inningData.inning}</strong> : ""}</td>
                                            <td>{log.pitcher}</td>
                                            <td>{log.batter}</td>
                                            <td>{log.p}</td>
                                            <td>{log.result}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* 기록 서브메뉴 */}
                    {activeSubTab === 2 && (
                        <RecordsSection homeBatters={homeBatters} awayBatters={awayBatters} />
                    )}
                </div>
            )}
        </div>
    );
}
export default MatchInfo;