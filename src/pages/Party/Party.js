// 직관팟 메인(구하기) & 내 신청 현황 & 승인 요청을 한 코드에 적용.
import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import TabNav from "../../components/TabNav/TabNav";
import styles from './Party.module.css';

const Party = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const tabLabels = ["직관팟 구하기", "내 신청 현황", "승인 요청"];
    const navigate = useNavigate();
    function newPartyButtonClick() {
        navigate('/party/newparty');
    }

    return (
        <div className={styles.wrapper}>
            {/*<div className={styles.headerSpacer}/>*/}
            <div className={styles.content}>
                <TabNav tabs={tabLabels} onTabChange={setActiveTab}/>
                {/* 직관팟 입장시 접근하는 직관팟 구하기 서브메뉴*/}
                {activeTab === 0 && (
                    <div className={styles.approvalSection}>
                        <div className={styles.matchHeader}>
                            <div className={styles.teamBox}>
                                <img src="/Logo/TeamLogo_Big/HH.png" alt="한화" className={styles.teamLogo}/>
                                <span className={styles.teamName}>한화 이글스</span>
                            </div>
                            <div className={styles.vsBlock}>
                                <div className={styles.vsText}>VS</div>
                                <div className={styles.location}>수원</div>
                                <div className={styles.time}>18:30</div>
                            </div>
                            <div className={styles.teamBox}>
                                <img src="/Logo/TeamLogo_Big/KT.png" alt="KT" className={styles.teamLogo}/>
                                <span className={styles.teamName}>KT 위즈</span>
                            </div>
                        </div>
                        <div className={styles.titleRow}>
                            <h3 className={styles.title}>직관 팟 구해요!</h3>
                            <div className={styles.buttons}>
                                <button className={styles.filterBtn} onClick={() => setIsFilterOpen(true)}>필터</button>
                                <button className={styles.createBtn} onClick={newPartyButtonClick}>새 직관 팟 만들기</button>
                            </div>
                        </div>
                        <div className={styles.partyList}>
                            {[1, 2, 3, 4].map((_, idx) => (
                                <div
                                    key={idx}
                                    className={styles.partyCard}
                                    onClick={() => navigate(`/party/matchid/partyid`)}
                                >
                                    <img src="/Logo/jikgwanprofile.png" alt="player" className={styles.playerImg}/>
                                    <div className={styles.partyContent}>
                                        <div className={styles.tags}>
                                            <span className={styles.tag}>승인제</span>
                                            <span className={styles.tag}>20대</span>
                                            <span className={styles.tagHighlight}>여자만</span>
                                        </div>
                                        <div className={styles.partyTitle}>3/22(토) 한화 vs KT 개막전 직관🦁💙</div>
                                        <div className={styles.partyMeta}>
                                            <span>ZSJ</span>
                                            <span>남성</span>
                                            <span>· 3.22(토) 오후 2:00</span>
                                        </div>
                                        <div className={styles.partyStatus}>
                                            <div className={styles.avatars}>
                                                <img src="/Logo/profile.png" alt="profile"/>
                                            </div>
                                            <div className={styles.slot}>10/14</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* 내 신청 현황 서브메뉴 */}
                {activeTab === 1 && (
                    <div className={styles.approvalSection}>
                        <div className={styles.matchHeader}>
                            <div className={styles.teamBox}>
                                <img src="/Logo/TeamLogo/emblem_HH.png" alt="한화" className={styles.teamLogo}/>
                                <span className={styles.teamName}>한화 이글스</span>
                            </div>
                            <div className={styles.vsBlock}>
                                <div className={styles.vsText}>VS</div>
                                <div className={styles.location}>수원</div>
                                <div className={styles.time}>18:00</div>
                            </div>
                            <div className={styles.teamBox}>
                                <img src="/Logo/TeamLogo/emblem_KT.png" alt="KT" className={styles.teamLogo}/>
                                <span className={styles.teamName}>KT 위즈</span>
                            </div>
                        </div>
                        <div className={styles.titleRow}>
                            <h3 className={styles.title}>직관 팟 구해요!</h3>
                            <div className={styles.buttons}>
                                <button className={styles.filterBtn} onClick={() => setIsFilterOpen(true)}>필터</button>
                                <button className={styles.createBtn}>새 직관 팟 만들기</button>
                            </div>
                        </div>
                    </div>
                )}
                {/* 승인 요청 서브메뉴 */}
                {activeTab === 2 && (
                    <div className={styles.approvalSection}>
                        <div className={styles.matchHeader}>
                            <div className={styles.teamBox}>
                                <img src="/Logo/TeamLogo/emblem_HH.png" alt="한화" className={styles.teamLogo}/>
                                <span className={styles.teamName}>한화 이글스</span>
                            </div>
                            <div className={styles.vsBlock}>
                                <div className={styles.vsText}>VS</div>
                                <div className={styles.location}>수원</div>
                                <div className={styles.time}>18:00</div>
                            </div>
                            <div className={styles.teamBox}>
                                <img src="/Logo/TeamLogo/emblem_KT.png" alt="KT" className={styles.teamLogo}/>
                                <span className={styles.teamName}>KT 위즈</span>
                            </div>
                        </div>
                        <div className={styles.titleRow}>
                            <h3 className={styles.title}>직관 팟 구해요!</h3>
                            <div className={styles.buttons}>
                                <button className={styles.filterBtn} onClick={() => setIsFilterOpen(true)}>필터</button>
                                <button className={styles.createBtn}>새 직관 팟 만들기</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {isFilterOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <span className={styles.modalTitle}>조건 설정</span>
                            <button className={styles.modalReset}>초기화</button>
                        </div>

                        <div className={styles.filterGroup}>
                            <button className={styles.filterOption}>선착순</button>
                            <button className={styles.filterOption}>승인제</button>
                        </div>

                        <div className={styles.filterLabel}>참가 가능 성별</div>
                        <div className={styles.filterGroup}>
                            <button className={styles.filterOption}>남자만</button>
                            <button className={styles.filterOption}>여자만</button>
                            <button className={styles.filterOption}>상관 없음</button>
                        </div>

                        <div className={styles.filterLabel}>나이</div>
                        <div className={styles.filterGroup}>
                            <button className={styles.ageOption}>10대</button>
                            <button className={`${styles.ageOption} ${styles.ageSelected}`}>20대</button>
                            <button className={styles.ageOption}>30대</button>
                            <button className={styles.ageOption}>40대</button>
                            <button className={styles.ageOption}>50대</button>
                            <button className={styles.ageOption}>60대</button>
                        </div>

                        <div className={styles.filterActions}>
                            <button className={styles.cancelBtn} onClick={() => setIsFilterOpen(false)}>취소하기</button>
                            <button className={styles.applyBtn}>필터 적용하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Party;