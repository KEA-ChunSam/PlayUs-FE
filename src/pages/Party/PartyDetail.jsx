// 직관팟 상세 페이지
import React, {useEffect, useState} from 'react';
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
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [user, setUser] = useState(null);


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_LOCAL_BACKEND_URI}/user/profile`, {withCredentials: true});
                setUser(res.data);
            } catch (err) {
                console.error("로그인 사용자 정보 불러오기 실패", err);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchParty = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_LOCAL_BACKEND_TWP_URI}/party/${partyId}`, {
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
                    const response = await axios.post(`${import.meta.env.VITE_LOCAL_BACKEND_URI}/user/api/writers`, [party.writerId], {
                        withCredentials: true
                    });
                    setWriter(response.data[0]);
                } catch (error) {
                    console.error('작성자 정보 로드 실패:', error);
                }
            };
            fetchWriter();
        }
    }, [party?.writerId]);

    async function applyParty() {
        // console.log("✅ applyParty 함수 호출됨");

        try {
            // console.log("✅ 현재 partyJoinMethod:", party?.partyJoinMethod);
            if (party?.partyJoinMethod === "선착순") {
                const res = await axios.post(`${import.meta.env.VITE_LOCAL_BACKEND_TWP_URI}/party/${partyId}/apply/fcfs`, {
                    partyId: partyId
                }, {
                    withCredentials: true
                });

                // console.log("✅ 신청 결과:", res.data);
                if (res.data && typeof res.data.partyJoinRequestStatus !== "undefined") {
                    // console.log("✅ party_join_request_status:", res.data.partyJoinRequestStatus);
                }

                setShowApplyModal(true);
                // console.log("✅ 모달 상태 변경됨 (showApplyModal=true)");
            } else {
                // console.log("✅ 승인제 파티입니다. 승인 요청 페이지로 이동");
                navigate(`/party/applyParty/${partyId}`);
            }
        } catch (error) {
            // console.error('❌ 신청 실패:', error.response?.data || error);
            setShowErrorModal(true);
        }
    }

    return (
        <>
            <div className={styles.wrapper}>
                <div className={styles.content}>
                    <TabNav tabs={tabLabels} onTabChange={setActiveTab} onBack={() => navigate("/party/matchid")}/>
                    {party && (
                        <div className={styles.partyCard}>
                            {user?.id === party.writerId && (
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
                                                    navigate(`/party/edit/${partyId}`, {state: party});
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
                            <img src="/Logo/jikgwanprofile.png" alt="player"
                                 className={styles.partyImage}/>
                            <div className={styles.partySummary}>
                                <div className={styles.tags}>
                                    {/* 현재 신청방식, 신청나이, 신청성별은 null로 지정됨 -> 백엔드 수정 필요 */}
                                    <span className={styles.tag}>
                                        {party.partyJoinMethod || '기타'}
                                    </span>
                                    {/*{party.partyAges && party.partyAges.map(age => (*/}
                                    {/*    <span key={age} className={styles.tag}>{age}20대</span>*/}
                                    {/*))}*/}
                                    {party.partyAges && party.partyAges.map((age, idx) => (
                                        <span key={idx} className={styles.tag}>{age}</span>
                                    ))}
                                    <span className={styles.tagHighlight}>
                                        {party.availableGender || '기타'}
                                    </span>
                                </div>
                                <div className={styles.partyTitle}>{party.title}</div>
                                <div className={styles.meta}>
                                    <span>{writer?.writerName || '작성자'}</span>
                                    {/*<span>{writer?.age || '연령'}</span>*/}
                                    <span>{writer?.writerGender === 'MALE' ? '남성' : writer?.writerGender === 'FEMALE' ? '여성' : '기타'}</span>
                                    {/* match table 백엔드 연결 필요 - match_date 표시 예정 */}
                                    <span>· 3.22(토) 오후 2:00</span>
                                </div>
                                <div className={styles.status}>
                                    {/* user-service 백엔드 단에서 presigned image 로직 적용 필요 */}
                                    <div className={styles.avatars}>
                                        {party.userThumbnailUrls && party.userThumbnailUrls.map((url, i) => (
                                            <img key={i} src={url} alt="profile"/>
                                        ))}
                                    </div>
                                    <span
                                        className={styles.slot}>{party.currentParticipantsCount}/{party.maximumParticipantsCount}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={styles.description}>
                        <p>{party?.text}</p>
                    </div>
                    {user?.id === party?.writerId ? (
                        <button
                            className={styles.applyButton}
                            onClick={() => navigate("/party/matchid", {state: {tabIndex: 2}})}
                        >
                            신청자 관리
                        </button>
                    ) : (
                        <button className={styles.applyButton} onClick={applyParty}>
                            파티 신청하기
                        </button>
                    )}
                    {showModal && (
                        <Modal
                            title="알림"
                            message="정말 삭제하시겠습니까?"
                            buttons={[
                                {label: '취소', onClick: () => setShowModal(false)},
                                {
                                    label: '확인',
                                    onClick: async () => {
                                        try {
                                            await axios.patch(`${import.meta.env.VITE_LOCAL_BACKEND_TWP_URI}/party/${partyId}`, {
                                                partyId: parseInt(partyId)
                                            }, {
                                                withCredentials: true
                                            });
                                            setShowModal(false);
                                            setShowDeleteModal(true);
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
            {showDeleteModal && (
                <Modal
                    title="알림"
                    message="삭제되었습니다."
                    buttons={[
                        {
                            label: '확인',
                            onClick: () => {
                                setShowDeleteModal(false);
                                navigate("/party/matchid");
                            }
                        }
                    ]}
                />
            )}
            {showApplyModal && (
                <Modal
                    title="알림"
                    message="직관팟에 가입되었습니다!"
                    buttons={[
                        {
                            label: '확인',
                            onClick: () => {
                                setShowApplyModal(false);
                                navigate("/party/matchid");
                            }
                        }
                    ]}
                />
            )}
            {showErrorModal && (
                <Modal
                    title="에러"
                    message="신청 중 오류가 발생했습니다."
                    buttons={[
                        {
                            label: '확인',
                            onClick: () => {
                                setShowErrorModal(false);
                            }
                        }
                    ]}
                />
            )}
            <CasterbotButton onClick={() => setShowCasterbot(true)}/>
            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
        </>
    );
};

export default PartyDetail;
