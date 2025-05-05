// 직관팟 메인(구하기) & 내 신청 현황 & 승인 요청을 한 코드에 적용.
import React, {useState} from 'react';
import Modal from '../../components/Modal/Modal';
import {useNavigate} from 'react-router-dom';
import TabNav from "../../components/TabNav/TabNav";
import styles from './Party.module.css';

const Party = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedApplyType, setSelectedApplyType] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [selectedAges, setSelectedAges] = useState([]);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showDenyModal, setShowDenyModal] = useState(false);
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
                                    <button className={styles.filterBtn} onClick={() => setIsFilterOpen(true)}>필터
                                    </button>
                                    <button className={styles.createBtn} onClick={newPartyButtonClick}>새 직관 팟 만들기
                                    </button>
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
                            <div className={styles.myStatusList}>
                                {[{
                                    title: '3/22(토) 한화 vs KT 개막전 직관🦁💙',
                                    age: '20대',
                                    gender: '여자만',
                                    writer: 'ZSJ',
                                    datetime: '3.22(토) 오후 2:00',
                                    status: 'pending'
                                }, {
                                    title: '3/23(일) 한화 vs LG 개막전 직관',
                                    age: '20대',
                                    gender: '남자만',
                                    writer: '김도영너무조아',
                                    datetime: '3.23(일) 오후 2:00',
                                    status: 'rejected'
                                }, {
                                    title: '3/22(토) 한화 vs KT 개막전 직관🦁💙',
                                    age: '40대',
                                    gender: '',
                                    writer: '한화30년골수팬',
                                    datetime: '3.22(토) 오후 2:00',
                                    status: 'approved',
                                    newMessages: 3
                                }].map((party, idx) => (
                                    <div key={idx} className={styles.myStatusCard}>
                                        <div className={styles.myStatusCardContent}>
                                            <div className={styles.myStatusTagRow}>
                                                {party.age && <span className={styles.tag}>{party.age}</span>}
                                                {party.gender && (
                                                    <span
                                                        className={`${styles.tag} ${styles.tagHighlight}`}>{party.gender}</span>
                                                )}
                                            </div>
                                            <div className={styles.myStatusTitle}>
                                                <strong>{party.title}</strong>
                                            </div>
                                            <div className={styles.myStatusMeta}>
                                                <span>{party.writer}</span>
                                                <span>{party.datetime}</span>
                                            </div>
                                            <div className={styles.myStatusButtons}>
                                                {party.status === 'pending' && (
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
                                                {party.status === 'rejected' && (
                                                    <>
                                                        <button className={styles.statusRejected}>승인 거부됨</button>
                                                        <button className={styles.DeleteParty}
                                                                onClick={() => setShowDeleteModal(true)}
                                                        >
                                                            삭제하기
                                                        </button>
                                                    </>
                                                )}
                                                {party.status === 'approved' && (
                                                    <div className={styles.chatButtonWrapper}>
                                                        <button className={styles.statusApproved}
                                                                onClick={onEnterChat}>채팅방 입장!
                                                        </button>
                                                        <span className={styles.newChatCount}>{party.newMessages}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <img
                                            src="/Logo/jikgwanprofile.png"
                                            alt="썸네일"
                                            className={styles.thumbnailImg}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* 승인 요청 서브메뉴 */}
                    {activeTab === 2 && (
                        <div className={styles.approvalSection}>
                            <div className={styles.myStatusList}>
                                <div
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
                            </div>
                            <div className={styles.approvalList}>
                                {[
                                    {
                                        name: 'ZSJ',
                                        age: '20대',
                                        message: '저도 한화 엄청 좋아해요! 같이 직관하고 싶어요!',
                                        avatar: '/Logo/profile.png'
                                    },
                                    {
                                        name: '한화짱팬',
                                        age: '30대',
                                        message: '맨날 혼자 집에서 야구 봤는데, 이번에 처음 직관 가...',
                                        avatar: '/Logo/profile2.png'
                                    },
                                    {
                                        name: 'master',
                                        age: '40대',
                                        message: '야구 좋아하는 분들과 함께 재밌게 직관하고 싶어요!',
                                        avatar: '/Logo/profile.png'
                                    },
                                    {
                                        name: '한화짱팬',
                                        age: '30대',
                                        message: '맨날 혼자 집에서 야구 봤는데, 이번에 처음 직관 가...',
                                        avatar: '/Logo/profile2.png'
                                    },
                                    {
                                        name: '한화짱팬',
                                        age: '30대',
                                        message: '맨날 혼자 집에서 야구 봤는데, 이번에 처음 직관 가...',
                                        avatar: '/Logo/profile2.png'
                                    },
                                ].map((user, idx) => (
                                    <div key={idx} className={styles.approvalCard}>
                                        <img src={user.avatar} alt="신청자" className={styles.userAvatar}/>
                                        <div className={styles.userInfo}>
                                            <div className={styles.nameRow}>
                                                <span className={styles.userName}>{user.name}</span>
                                                <span className={styles.ageBadge}>{user.age}</span>
                                            </div>
                                            <p className={styles.userMessage}>{user.message}</p>
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
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            )
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
                            <button className={styles.applyBtn}>필터 적용하기</button>
                        </div>
                    </div>
                </div>
            )}
            {[
              { show: showCancelModal, title: '신청 취소', message: '정말 취소하시겠습니까?', onClose: () => setShowCancelModal(false) },
              { show: showDeleteModal, title: '삭제하기', message: '삭제되었습니다.', onClose: () => setShowDeleteModal(false) },
              { show: showApproveModal, title: '승인하기', message: '참가 요청을 승인하시겠습니까?', onClose: () => setShowApproveModal(false) },
              { show: showDenyModal, title: '삭제하기', message: '참가 요청을 거부하시겠습니까?', onClose: () => setShowDenyModal(false) }
            ].map((modal, idx) => modal.show && (
              <Modal key={idx} title={modal.title} message={modal.message} onClose={modal.onClose} />
            ))}
        </>
    );
};

export default Party;