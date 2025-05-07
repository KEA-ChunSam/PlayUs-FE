import TabNav from '../../components/TabNav/TabNav';
import styles from './MatchInfo.module.css';
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import SubTabNav from "../../components/TabNav/SubTabNav";

function MatchInfo() {
    const [activeTab, setActiveTab] = useState(0);
    const tabLabels = ["경기 정보", "AI 시뮬레이터"];
    const subTabLabels = ["라인업 설정", "경기 로그", "기록"];
    const navigate = useNavigate();
    function startSimulate () {

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

                    <SubTabNav tabs={subTabLabels}/>

                    <div className={styles.simLineups}>
                        <div className={styles.lineupColumn}>
                            {/* TODO: 차후 KBO API 연동시 실제 데이터 받아옴*/}
                            <div className={styles.pitcher}>와이스 <span>우투</span></div>
                            <div className={styles.lineup}>
                                <div>1 김태연 <span>좌익수, 우타</span></div>
                                <div>2 문현빈 <span>지명타자, 좌타</span></div>
                                <div>3 플로리엘 <span>중견수, 좌타</span></div>
                                <div>4 노시환 <span>3루수, 우타</span></div>
                                <div>5 채은성 <span>1루수, 우타</span></div>
                                <div>6 황영묵 <span>2루수, 좌타</span></div>
                                <div>7 황영묵 <span>2루수, 좌타</span></div>
                                <div>8 황영묵 <span>2루수, 좌타</span></div>
                                <div>9 황영묵 <span>2루수, 좌타</span></div>
                                <div>후보 황영묵 <span>2루수, 좌타</span></div>
                            </div>
                        </div>
                        <div className={styles.lineupColumn}>
                            <div className={styles.pitcher}>쿠에바스 <span>우투</span></div>
                            <div className={styles.lineup}>
                                <div>1 강백호 <span>지명타자, 좌타</span></div>
                                <div>2 로하스 <span>우익수, 양타</span></div>
                                <div>3 허경민 <span>3루수, 우타</span></div>
                                <div>4 김민혁 <span>좌익수, 좌타</span></div>
                                <div>5 장성우 <span>포수, 우타</span></div>
                                <div>6 문상철 <span>1루수, 우타</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MatchInfo;