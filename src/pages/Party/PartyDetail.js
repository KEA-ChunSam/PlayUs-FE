// 직관팟 상세 페이지
import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import styles from './PartyDetail.module.css';
import Modal from "../../components/Modal/Modal";
import TabNav from "../../components/TabNav/TabNav";
import CasterbotModal from "../Chatbot/CasterbotModal";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import axios from 'axios';

const PartyDetail = () => {
    const {partyId} = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const tabLabels = ["직관팟 구하기", "내 신청 현황", "승인 요청"];
    const [showCasterbot, setShowCasterbot] = useState(false);
    const [party, setParty] = useState(null);
    const [writer, setWriter] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchParty = async () => {
            try {
                const response = await axios.get(`http://localhost:8081/party/${partyId}`, {
                    withCredentials: true
                });
                const data = response.data;
                setParty(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchParty();
    }, [partyId]);

    useEffect(() => {
        if (party?.writerId) {
            const fetchWriter = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/user/profile`, {
                        withCredentials: true
                    });
                    setWriter(response.data);
                } catch (error) {
                    console.error('작성자 정보 로드 실패:', error);
                }
            };
            fetchWriter();
        }
    }, [party?.writerId]);

    function applyParty() {
        navigate("/Party/applyParty/partyid");
    }

    return (
        <>
            <div className={styles.wrapper}>
                <div className={styles.content}>
                    <TabNav tabs={tabLabels} onTabChange={setActiveTab} onBack={() => navigate("/party/matchid")}/>
                    {party && (
                        <div className={styles.partyCard}>
                            {writer?.id === party.writerId && (
                                <div className={styles.menuWrapper}>
                                    <button
                                        onClick={() => setShowMenu((prev) => !prev)}
                                        className={styles.menuButton}
                                    >
                                        ⋮
                                    </button>
                                    {showMenu && (
                                        <div className={styles.menuPopup}>
                                            <div
                                                className={styles.menuItem}
                                                onClick={() => {
                                                    navigate(`/party/edit/${partyId}`, { state: party });
                                                }}
                                            >
                                                수정하기
                                            </div>
                                            <div
                                                className={styles.menuItem}
                                                onClick={() => {
                                                    setShowMenu(false);
                                                    setShowModal(true);
                                                }}
                                            >
                                                삭제하기
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <img src={`${process.env.PUBLIC_URL}/Logo/jikgwanprofile.png`} alt="player"
                                 className={styles.partyImage}/>
                            <div className={styles.partySummary}>
                                <div className={styles.tags}>
                                    {/* 현재 신청방식, 신청나이, 신청성별은 null로 지정됨 -> 백엔드 수정 필요 */}
                                    <span className={styles.tag}>
                                        {party.partyJoinMethod === 'FIRST_COME'
                                            ? '선착순'
                                            : party.partyJoinMethod === 'RESERVATION'
                                                ? '승인제'
                                                : '기타'}
                                    </span>
                                    {/*{party.partyAges && party.partyAges.map(age => (*/}
                                    {/*    <span key={age} className={styles.tag}>{age}20대</span>*/}
                                    {/*))}*/}
                                    <span className={styles.tag}>20대</span>
                                    <span className={styles.tagHighlight}>
                                        {party.partyGender === 'MALE'
                                            ? '남성만'
                                            : party.partyGender === 'FEMALE'
                                                ? '여성만'
                                                : party.partyGender === 'NO_MATTER'
                                                    ? '상관없음'
                                                    : '기타'}
                                    </span>
                                </div>
                                <div className={styles.partyTitle}>{party.title}</div>
                                <div className={styles.meta}>
                                    <span>{writer?.nickname || '작성자'}</span>
                                    <span>{writer?.gender === 'MALE' ? '남성' : writer?.gender === 'FEMALE' ? '여성' : '기타'}</span>
                                    {/* match table 백엔드 연결 필요 */}
                                    <span>· {party.matchDate}3.22(토) 오후 2:00</span>
                                </div>
                                <div className={styles.status}>
                                    {/* user-service 백엔드 단에서 presigned image 로직 적용 필요 */}
                                    <div className={styles.avatars}>
                                        {party.userThumbnailUrls && party.userThumbnailUrls.map((url, i) => (
                                            <img key={i} src={url} alt="profile"/>
                                        ))}
                                    </div>
                                    <span className={styles.slot}>{party.currentParticipantsCount}/{party.maximumParticipantsCount}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={styles.description}>
                        <p>{party?.text}</p>
                    </div>
                    <button className={styles.applyButton} onClick={applyParty}>파티 신청하기</button>
                    {showModal && (
                        <Modal
                            title="알림"
                            message="정말 삭제하시겠습니까?"
                            buttons={[
                                { label: '취소', onClick: () => setShowModal(false) },
                                {
                                    label: '확인',
                                    onClick: async () => {
                                        try {
                                            await axios.patch(`http://localhost:8081/party/${partyId}`, {
                                                partyId: parseInt(partyId)
                                            }, {
                                                withCredentials: true
                                            });
                                            setShowModal(false);
                                            navigate('/');
                                        } catch (error) {
                                            console.error('삭제 실패:', error);
                                        }
                                    }
                                }
                            ]}
                        />
                    )}
                </div>
            </div>
            <CasterbotButton onClick={() => setShowCasterbot(true)} />
            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
        </>
    );
};

export default PartyDetail;
