// 직관팟 메인(구하기) & 내 신청 현황 & 승인 요청을 한 코드에 적용.
import React, {useEffect, useState} from 'react';
import {useAuth} from '../../utils/AuthContext';
import axios from 'axios';
import CasterbotModal from '../../pages/Chatbot/CasterbotModal';
import {useLocation, useNavigate} from 'react-router-dom';
import TabNav from "../../components/TabNav/TabNav";
import styles from './Party.module.css';
import Modal from '../../components/Modal/Modal';
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";

const Party = () => {
    const {user} = useAuth();
    const loginUserId = user?.id;
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.tabIndex || 0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedApplyType, setSelectedApplyType] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [selectedAges, setSelectedAges] = useState([]);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showDenyModal, setShowDenyModal] = useState(false);
    const [showCasterbot, setShowCasterbot] = useState(false);
    const [approvalList, setApprovalList] = useState([]);
    const [myApprovalPartyDetail, setMyApprovalPartyDetail] = useState(null);
    const [myApplications, setMyApplications] = useState([]);
    const [partyList, setPartyList] = useState([]);
    const [originalPartyList, setOriginalPartyList] = useState([]);

    // Writer map state and effect
    const [writerMap, setWriterMap] = useState({});

    useEffect(() => {
        if (
            partyList.length > 0 &&
            partyList.every(p => p.writerId)
        ) {
            const writerIds = [...new Set(partyList.map(p => p.writerId))];
            axios.post(`${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/api/writers`, writerIds, {
                withCredentials: true
            })
                .then(response => {
                    // Expecting response.data to be an array of writer objects
                    console.log("👀 Writer API response:", response.data);
                    const map = {};
                    response.data.forEach(writer => {
                        // Fallback to writer.id if writer.writerId is not present
                        if (writer.writerId || writer.id) {
                            map[writer.writerId || writer.id] = writer;
                        }
                    });
                    setWriterMap(map);
                })
                .catch(error => console.error("작성자 정보 불러오기 실패:", error));
        }
    }, [partyList]);

    useEffect(() => {
        if (activeTab === 2 && partyList.length > 0) {
            // Insert debug logs before finding myApprovalParty
            // console.log("🔍 로그인한 유저 ID:", loginUserId);
            // console.log("🔍 writerMap:", writerMap);
            // console.log("🔍 partyList:", partyList);
            const myApprovalParty = partyList.find(
                p => {
                    // console.log("🔎 검사 중인 팟:", p);
                    // console.log("🔎 writerMap 매핑:", writerMap[p.writerId]?.id, "vs", loginUserId);
                    return writerMap[p.writerId]?.id === loginUserId && p.partyJoinMethod === '승인제';
                }
            );
            // console.log("✅ 찾은 승인제 팟:", myApprovalParty);

            if (myApprovalParty) {
                axios.get(
                    `${process.env.REACT_APP_LOCAL_BACKEND_TWP_URI}/party/${myApprovalParty.partyId}/approved-applicants`,
                    {withCredentials: true}
                )
                    .then(res => setApprovalList(res.data))
                    .catch(err => console.error("신청자 목록 불러오기 실패:", err));

                axios.get(`${process.env.REACT_APP_LOCAL_BACKEND_TWP_URI}/party/${myApprovalParty.partyId}`, {
                    withCredentials: true
                })
                    .then(res => setMyApprovalPartyDetail(res.data))
                    .catch(err => console.error("직관팟 상세정보 불러오기 실패:", err));
            } else {
                console.warn("❗️ 승인제 팟을 찾을 수 없습니다.");
                setMyApprovalPartyDetail(null);
            }
        }
        if (activeTab === 1) {
            axios.get(`${process.env.REACT_APP_LOCAL_BACKEND_TWP_URI}/party/applied-parties`, {withCredentials: true})
                .then(res => setMyApplications(res.data))
                .catch(err => console.error("내 신청 직관팟 불러오기 실패:", err));
        }
        if (activeTab === 0) {
            axios.get(`${process.env.REACT_APP_LOCAL_BACKEND_TWP_URI}/party?matchId=1`, {withCredentials: true})
                .then(res => {
                    setPartyList(res.data);
                    setOriginalPartyList(res.data);
                })
                .catch(err => console.error("직관팟 목록 불러오기 실패:", err));
        }
    }, [activeTab]);

    const mapStatusToKey = (status) => {
        switch (status) {
            case 'WAIT':
                return 'pending';
            case 'ACCEPT':
                return 'approved';
            case 'REFUSE':
                return 'rejected';
            default:
                return '';
        }
    };
    const tabLabels = ["직관팟 구하기", "내 신청 현황", "승인 요청"];
    const navigate = useNavigate();

    function newPartyButtonClick() {
        navigate('/party/newparty');
    }

    function onEnterChat() {
        navigate('/chat/party/partyId'); // 차후 직관팟별로 route 분리
    }


    return (
        <>
            <div className={styles.wrapper}>
                {/*<div className={styles.headerSpacer}/>*/}
                <div className={styles.content}>
                    <TabNav tabs={tabLabels} activeTab={activeTab} onTabChange={setActiveTab}/>
                    {/* 직관팟 입장시 접근하는 직관팟 구하기 서브메뉴*/}
                    {activeTab === 0 && (
                        <div className={styles.approvalSection}>
                            <div className={styles.matchHeader}>
                                <div className={styles.teamBox}>
                                    <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo_Big/HH.png`} alt="한화"
                                         className={styles.teamLogo}/>
                                    <span className={styles.teamName}>한화 이글스</span>
                                </div>
                                <div className={styles.vsBlock}>
                                    <div className={styles.vsText}>VS</div>
                                    <div className={styles.location}>수원</div>
                                    <div className={styles.time}>18:30</div>
                                </div>
                                <div className={styles.teamBox}>
                                    <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo_Big/KT.png`} alt="KT"
                                         className={styles.teamLogo}/>
                                    <span className={styles.teamName}>KT 위즈</span>
                                </div>
                            </div>
                            <div className={styles.titleRow}>
                                <h3 className={styles.title}>직관 팟 구해요!</h3>
                                <div className={styles.buttons}>
                                    <button className={styles.filterBtn} onClick={() => setIsFilterOpen(true)}>필터
                                    </button>
                                    <button className={styles.createBtn} onClick={newPartyButtonClick}>새 직관 팟 만들기
                                    </button>
                                </div>
                            </div>
                            <div className={styles.partyList}>
                                {partyList.length === 0 ? (
                                    <div className={styles.noPartyMessage}>조건에 맞는 직관팟이 없어요!</div>
                                ) : (
                                    partyList.map((party) => (
                                        <div
                                            key={party.partyId}
                                            className={styles.partyCard}
                                            onClick={() => navigate(`/party/matchid/${party.partyId}`)}
                                        >
                                            <img
                                                src={party.partyThumbnailUrls?.[0] || `${process.env.PUBLIC_URL}/Logo/jikgwanprofile.png`}
                                                alt="직관팟 썸네일" className={styles.playerImg}/>
                                            <div className={styles.partyContent}>
                                                <div className={styles.tags}>
                                                    <span className={styles.tag}>{party.partyJoinMethod}</span>
                                                    {party.partyAges?.map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className={`${styles.tag} ${index === 2 ? styles.tagHighlight : ''}`}
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    <span
                                                        className={`${styles.tag} ${styles.tagHighlight}`}
                                                        data-gender={party.availableGender}
                                                    >{party.availableGender}
                                                    </span>
                                                </div>
                                                <div className={styles.partyTitle}>{party.title}</div>
                                                <div className={styles.partyMeta}>
                                                    <span>{writerMap[party.writerId]?.writerName || '작성자'}</span>
                                                    <span>{writerMap[party.writerId]?.writerAge || '나이'}</span>
                                                    <span>
                                                        {writerMap[party.writerId]?.writerGender === 'MALE'
                                                            ? '남성'
                                                            : writerMap[party.writerId]?.writerGender === 'FEMALE'
                                                                ? '여성'
                                                                : '기타'}
                                                    </span>
                                                    <span>· {party.matchDate}2022.03.04 14:00</span>
                                                </div>
                                                <div className={styles.partyStatus}>
                                                    <div className={styles.avatars}>
                                                        {party.userThumbnailUrls?.slice(0, 1).map((url, i) => (
                                                            <img key={i}
                                                                 src={url || `${process.env.PUBLIC_URL}/Logo/profile.png`}
                                                                 alt="프로필"/>
                                                        ))}
                                                    </div>
                                                    <div
                                                        className={styles.slot}>{party.currentParticipantsCount}/{party.maximumParticipantsCount}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                    {/* 내 신청 현황 서브메뉴 */}
                    {activeTab === 1 && (
                        <div className={styles.approvalSection}>
                            <div className={styles.myStatusList}>
                                {myApplications.map((party, idx) => {
                                    const statusKey = mapStatusToKey(party.partyJoinRequestStatus);
                                    return (
                                        <div key={idx} className={styles.myStatusCard}>
                                            <div className={styles.myStatusCardContent}>
                                                <div className={styles.myStatusTagRow}>
                                                    {party.partyAgeGroup?.map((tag, index) => (
                                                        <span key={index}
                                                              className={`${styles.tag} ${index === 2 ? styles.tagHighlight : ''}`}>{tag}</span>
                                                    ))}
                                                    <span className={styles.tagHighlight}>{party.partyGender}</span>
                                                </div>
                                                <div className={styles.myStatusTitle}>
                                                    <strong>{party.title}</strong>
                                                </div>
                                                <div className={styles.myStatusMeta}>
                                                    <span>{party.authorName}</span>
                                                    <span>{party.authorAge}</span>
                                                    <span>{party.authorGender === 'MALE' ? '남성' : party.authorGender === 'FEMALE' ? '여성' : '기타'}</span>
                                                </div>
                                                <div className={styles.myStatusButtons}>
                                                    {statusKey === 'pending' && (
                                                        <>
                                                            <button className={styles.statusPending}>신청중</button>
                                                            <button
                                                                className={styles.statusCancel}
                                                                onClick={() => setShowCancelModal(true)}
                                                            >
                                                                취소하기
                                                            </button>
                                                        </>
                                                    )}
                                                    {statusKey === 'rejected' && (
                                                        <>
                                                            <button className={styles.statusRejected}>승인 거부됨</button>
                                                            <button className={styles.DeleteParty}
                                                                    onClick={() => setShowDeleteModal(true)}
                                                            >
                                                                삭제하기
                                                            </button>
                                                        </>
                                                    )}
                                                    {statusKey === 'approved' && (
                                                        <div className={styles.chatButtonWrapper}>
                                                            <button className={styles.statusApproved}
                                                                    onClick={onEnterChat}>채팅방 입장!
                                                            </button>
                                                            <span className={styles.newChatCount}>1</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <img
                                                src={party.writerThumbnailUrl || `${process.env.PUBLIC_URL}/Logo/jikgwanprofile.png`}
                                                alt="썸네일"
                                                className={styles.thumbnailImg}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {/* 승인 요청 서브메뉴 */}
                    {activeTab === 2 && (
                        <div className={styles.approvalSection}>
                            {/* 상세 정보 카드 */}
                            {myApprovalPartyDetail && (
                                <div className={styles.partyCard}>
                                    <img
                                        src={myApprovalPartyDetail.partyThumbnailUrls?.[0] || `${process.env.PUBLIC_URL}/Logo/jikgwanprofile.png`}
                                        alt="직관팟 썸네일"
                                        className={styles.playerImg}
                                    />
                                    <div className={styles.partyContent}>
                                        <div className={styles.tags}>
                                            <span className={styles.tag}>{myApprovalPartyDetail.partyJoinMethod}</span>
                                            {myApprovalPartyDetail.partyAges?.map((tag, index) => (
                                                <span key={index}
                                                      className={`${styles.tag} ${index === 2 ? styles.tagHighlight : ''}`}>{tag}</span>
                                            ))}
                                            <span
                                                className={`${styles.tag} ${styles.tagHighlight}`}>{myApprovalPartyDetail.availableGender}</span>
                                        </div>
                                        <div className={styles.partyTitle}>{myApprovalPartyDetail.title}</div>
                                        <div className={styles.partyMeta}>
                                            <span>{myApprovalPartyDetail.matchDate}</span>
                                        </div>
                                        <div className={styles.partyStatus}>
                                            <div className={styles.avatars}>
                                                {myApprovalPartyDetail.userThumbnailUrls?.slice(0, 1).map((url, i) => (
                                                    <img key={i}
                                                         src={url || `${process.env.PUBLIC_URL}/Logo/profile.png`}
                                                         alt="프로필"/>
                                                ))}
                                            </div>
                                            <div className={styles.slot}>
                                                {myApprovalPartyDetail.currentParticipantsCount}/{myApprovalPartyDetail.maximumParticipantsCount}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className={styles.approvalList}>
                                {approvalList.length === 0 ? (
                                    <div className={styles.noPartyMessage}>신청자가 없어요</div>
                                ) : (
                                    approvalList.map((user, idx) => (
                                        <div key={idx} className={styles.approvalCard}>
                                            <img
                                                src={user.thumbnailUrl || `${process.env.PUBLIC_URL}/Logo/profile.png`}
                                                alt="신청자"
                                                className={styles.userAvatar}
                                            />
                                            <div className={styles.userInfo}>
                                                <div className={styles.nameRow}>
                                                    <span className={styles.userName}>{user.name}</span>
                                                    <span className={styles.ageBadge}>{user.ageGroup}</span>
                                                </div>
                                                <p className={styles.userMessage}>{user.requireMessage}</p>
                                            </div>
                                            <div className={styles.actionButtons}>
                                                <button className={styles.approveButton}
                                                        onClick={() => setShowApproveModal(true)}>승인하기
                                                </button>
                                                <button className={styles.rejectButton}
                                                        onClick={() => setShowDenyModal(true)}>거부하기
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isFilterOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <span className={styles.modalTitle}>조건 설정</span>
                            <button
                                className={styles.modalReset}
                                onClick={() => {
                                    setSelectedApplyType('');
                                    setSelectedGender('');
                                    setSelectedAges([]);
                                }}
                            >
                                초기화
                            </button>
                        </div>

                        <div className={styles.filterGroup}>
                            {['선착순', '승인제'].map(type => (
                                <button
                                    key={type}
                                    className={`${styles.filterOption} ${selectedApplyType === type ? styles.selected : ''}`}
                                    onClick={() => setSelectedApplyType(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className={styles.filterLabel}>참가 가능 성별</div>
                        <div className={styles.filterGroup}>
                            {['남자만', '여자만', '상관 없음'].map(gender => (
                                <button
                                    key={gender}
                                    className={`${styles.filterOption} ${selectedGender === gender ? styles.selected : ''}`}
                                    onClick={() => setSelectedGender(gender)}
                                >
                                    {gender}
                                </button>
                            ))}
                        </div>

                        <div className={styles.filterLabel}>나이</div>
                        <div className={styles.filterGroup}>
                            {['10대', '20대', '30대', '40대', '50대', '60대'].map(age => (
                                <button
                                    key={age}
                                    className={`${styles.ageOption} ${selectedAges.includes(age) ? styles.ageSelected : ''}`}
                                    onClick={() => {
                                        setSelectedAges(prev =>
                                            prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]
                                        );
                                    }}
                                >
                                    {age}
                                </button>
                            ))}
                        </div>

                        <div className={styles.filterActions}>
                            <button className={styles.cancelBtn} onClick={() => setIsFilterOpen(false)}>취소하기</button>
                            <button
                                className={styles.applyBtn}
                                onClick={() => {
                                    const filtered = selectedApplyType || selectedGender || selectedAges.length > 0
                                        ? originalPartyList.filter(party => {
                                            const matchApplyType = selectedApplyType ? party.partyJoinMethod === selectedApplyType : true;
                                            const matchGender = selectedGender ? party.availableGender === selectedGender : true;
                                            const matchAge = selectedAges.length > 0 ? party.partyAges?.some(age => selectedAges.includes(age)) : true;
                                            return matchApplyType && matchGender && matchAge;
                                        })
                                        : originalPartyList;
                                    setPartyList(filtered);
                                    setIsFilterOpen(false);
                                }}
                            >
                                필터 적용하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {[
                {
                    show: showCancelModal,
                    title: '신청 취소',
                    message: '정말 취소하시겠습니까?',
                    buttons:
                        [
                            {label: '취소', onClick: () => setShowCancelModal(false)},
                            {
                                label: '확인',
                                onClick: () => {
                                    // 삭제 로직 실행
                                    setShowCancelModal(false);
                                }
                            }
                        ]
                },
                {
                    show: showDeleteModal, title: '삭제하기', message: '삭제되었습니다.', buttons:
                        [
                            // {label: '취소', onClick: () => setShowCancelModal(false)},
                            {
                                label: '확인',
                                onClick: () => {
                                    // 삭제 로직 실행
                                    setShowDeleteModal(false);
                                }
                            }
                        ]
                },
                {
                    show: showApproveModal,
                    title: '승인하기',
                    message: '참가 요청을 승인하시겠습니까?',
                    buttons:
                        [
                            {label: '취소', onClick: () => setShowApproveModal(false)},
                            {
                                label: '확인',
                                onClick: () => {
                                    // 삭제 로직 실행
                                    setShowApproveModal(false);
                                }
                            }
                        ]
                },
                {
                    show: showDenyModal,
                    title: '삭제하기',
                    message: '참가 요청을 거부하시겠습니까?',
                    buttons:
                        [
                            {label: '취소', onClick: () => setShowDenyModal(false)},
                            {
                                label: '확인',
                                onClick: () => {
                                    // 삭제 로직 실행
                                    setShowDenyModal(false);
                                }
                            }
                        ]
                }
            ].map((modal, idx) => modal.show && (
                    <Modal key={idx} title={modal.title} message={modal.message} buttons={modal.buttons}/>
                )
            )}
            <CasterbotButton onClick={() => setShowCasterbot(true)}/>

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
        </>
    );
};

export default Party;