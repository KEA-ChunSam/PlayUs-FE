// 직관팟 상세 페이지
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from './PartyDetail.module.css';
import TabNav from "../../components/TabNav/TabNav";

const PartyDetail = () => {
    // const {partyId} = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const tabLabels = ["직관팟 구하기", "내 신청 현황", "승인 요청"];
    function applyParty() {
        navigate("/Party/applyParty/partyid");
    }

    return (
        <div className={styles.wrapper}>
            {/*<div className={styles.headerSpacer}/>*/}
            <div className={styles.content}>
                <TabNav tabs={tabLabels} onTabChange={setActiveTab} onBack={() => navigate(-1)}/>
                <div className={styles.partyCard}>
                    <img src={`${process.env.PUBLIC_URL}/Logo/jikgwanprofile.png`} alt="player" className={styles.partyImage}/>
                    <div className={styles.partySummary}>
                        <div className={styles.tags}>
                            <span className={styles.tag}>승인제</span>
                            <span className={styles.tag}>20대</span>
                            <span className={styles.tagHighlight}>여자만</span>
                        </div>
                        <div className={styles.partyTitle}>3/22(토) 한화 vs KT 개막전 직관🦁💙</div>
                        <div className={styles.meta}>
                            <span>ZSJ</span>
                            <span>남성</span>
                            <span>· 3.22(토) 오후 2:00</span>
                        </div>
                        <div className={styles.status}>
                            <div className={styles.avatars}>
                                <img src={`${process.env.PUBLIC_URL}/Logo/profile.png`} alt="profile"/>
                                <img src={`${process.env.PUBLIC_URL}/Logo/profile.png`} alt="profile"/>
                                {/* ...추가 프로필 */}
                            </div>
                            <span className={styles.slot}>10/14</span>
                        </div>
                    </div>
                </div>
                <div className={styles.description}>
                    <p>2025년 같이 활동할 3기 신입 부원들을 모집합니다!...</p>
                    <p>⚾ 활동 내용<br/>- 프로야구 경기 직관 ...</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                    <br/>
                    <p>⚾ 모집 관련<br/>- 모집 기간: 2025.03.04~2025.03.31 ...</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                    <p>수도권 위주로 직관 활동</p>
                </div>
                <button className={styles.applyButton} onClick={applyParty}>파티 신청하기</button>
            </div>


        </div>
    );
};

export default PartyDetail;
