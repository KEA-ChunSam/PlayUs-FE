// 직관팟 채팅 페이지
import React, {useEffect, useRef, useState} from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import styles from './Chatting.module.css';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "../../../components/Modal/Modal";
import CasterbotModal from "../../Chatbot/CasterbotModal";
import CasterbotButton from "../../../components/CasterbotButton/CasterbotButton";
import { useChatSocket } from '../../../utils/webSocket';
import axios from 'axios';

const Chatting = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();
    const { chatRoomId } = useParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLeaveRoomModal, setShowLeaveRoomModal] = useState(false);
    const [showCasterbot, setShowCasterbot] = useState(false);

    const [users, setUsers] = useState([]);
    const [roomMaster, setRoomMaster] = useState(null);
    const [myNickname, setMyNickname] = useState('');

    const fetchParticipants = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_LOCAL_BACKEND_TWP_URI}/chat/count/${roomId}`, {
                withCredentials: true
            });

            if (response.data && typeof response.data === 'object') {
                const rawParticipants = Array.isArray(response.data.participants) ? response.data.participants : [];

                // 중복 제거: userId 기준
                const uniqueMap = new Map();
                rawParticipants.forEach(user => {
                    if (!uniqueMap.has(user.userId)) {
                        uniqueMap.set(user.userId, user);
                    }
                });

                const uniqueParticipants = Array.from(uniqueMap.values());

                // 사용자 정보 매핑
                const formattedUsers = uniqueParticipants.map(user => ({
                    name: user.nickName || '이름없음',
                    avatar: user.profileImageUrl
                        ? `${process.env.PUBLIC_URL}/images/${user.profileImageUrl}`
                        : `${process.env.PUBLIC_URL}/Logo/default.png`
                }));

                setUsers(formattedUsers);
                setParticipantCount(formattedUsers.length);

                if (response.data.roomMaster) {
                    setRoomMaster({
                        name: response.data.roomMaster.nickName || '방장',
                        avatar: response.data.roomMaster.profileImageUrl
                            ? `${process.env.PUBLIC_URL}/images/${response.data.roomMaster.profileImageUrl}`
                            : `${process.env.PUBLIC_URL}/Logo/default.png`
                    });
                } else {
                    setRoomMaster(null);
                }
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.warn('채팅 참여자 정보 없음');
                setUsers([]);
                setRoomMaster(null);
                return;
            }
            console.error('참여자 목록 불러오기 실패:', error);
            setUsers([]);
            setRoomMaster(null);
        }
    };

    // messages will be provided by useChatSocket hook
    const [chatInput, setChatInput] = useState('');
    const [participantCount, setParticipantCount] = useState(0);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const partyId = location.state?.partyId;

    // API 경로 상수
    const API_BASE_URL = 'http://localhost:8081';
    const WS_URL = `${API_BASE_URL}/ws`;
    const roomId = chatRoomId; // 실제 채팅방 ID로 수정 필요
    const myUserId = location.state?.userId; // 로그인된 사용자 ID로 실제값 대체

    // API 엔드포인트
    const ENDPOINTS = {
        CHAT_MESSAGES: `${API_BASE_URL}/chat/${roomId}`,
        CHAT_COUNT: `${API_BASE_URL}/chat/count/${roomId}`,
        CHAT_EXIT: `${API_BASE_URL}/chat/${roomId}`,
        WS_SUBSCRIBE: `/sub/chat/room/${roomId}`,
        WS_PUBLISH: '/pub/chat/message'
    };

    // 페이지네이션 설정
    const DEFAULT_PAGE_SIZE = 20;

    /**
     * 객체를 안전한 문자열로 변환하는 함수
     */
    const safeStringify = (obj) => {
        if (obj === null || obj === undefined) return '';

        try {
            if (typeof obj !== 'object') return String(obj);

            // Room 정보 객체 특별 처리
            if ('roomId' in obj && 'participants' in obj) {
                return `[방 정보] ID: ${obj.roomId}, 참가자: ${obj.totalParticipantCount || 0}명`;
            }

            return JSON.stringify(obj);
        } catch (e) {
            console.error('객체 문자열화 실패:', e);
            return '[객체 변환 실패]';
        }
    };

    /**
     * 중첩된 객체를 포함한 모든 객체를 깊게 처리하는 함수
     */
    const deepSanitize = (data) => {
        // 기본 타입이나 null/undefined 처리
        if (data === null || data === undefined || typeof data !== 'object') {
            return data;
        }

        // 배열 처리
        if (Array.isArray(data)) {
            return data.map(item => deepSanitize(item));
        }

        // 객체 처리 (재귀적으로 모든 속성 처리)
        const result = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key];

                // 값이 객체이고 React 엘리먼트가 아닌 경우 특별 처리
                if (value !== null && typeof value === 'object' && !React.isValidElement(value)) {
                    // message 필드는 문자열화
                    if (key === 'message') {
                        result[key] = safeStringify(value);
                    } else {
                        // 다른 객체 필드는 재귀적으로 처리
                        result[key] = deepSanitize(value);
                    }
                } else {
                    result[key] = value;
                }
            }
        }

        return result;
    };

    /**
     * 채팅 메시지 데이터 깊게 처리
     */
    const processChatData = (data) => {
        if (!data) return {chattingMessage: []};

        try {
            // 전체 데이터 구조 복사
            const processedData = {...data};

            // 채팅 메시지 배열 처리
            if (Array.isArray(processedData.chattingMessage)) {
                processedData.chattingMessage = processedData.chattingMessage.map(msg => {
                    if (!msg) return {message: '', senderName: '알 수 없음'};

                    // 복사본 생성
                    const processedMsg = {...msg};

                    // 메시지가 객체인 경우 문자열화
                    if (processedMsg.message && typeof processedMsg.message === 'object') {
                        processedMsg.message = safeStringify(processedMsg.message);
                    }

                    return processedMsg;
                });
            } else {
                processedData.chattingMessage = [];
            }

            return processedData;
        } catch (error) {
            console.error('채팅 데이터 처리 오류:', error);
            return {chattingMessage: []};
        }
    };

    useEffect(() => {
        const fetchMyInfo = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/profile`, { withCredentials: true });
                console.log(res.data);
                console.log(document.cookie);
                setMyNickname(res.data.nickname);
            } catch (err) {
                console.error('닉네임 불러오기 실패:', err);
            }
        };

        fetchMyInfo();
    }, [myUserId]);

    // Infinite query for chat messages (refactored)
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status
    } = useInfiniteQuery({
        queryKey: ['chatMessages', roomId],
        queryFn: async ({ pageParam = 0 }) => {
            const params = {
                pageSize: DEFAULT_PAGE_SIZE,
                pageNumber: pageParam
            };

            console.log('Fetching chat with params:', params); // 실제 쿼리 파라미터 확인용

            const response = await axios.get(ENDPOINTS.CHAT_MESSAGES, {
                params,
                withCredentials: true
            });

            const sanitizedData = deepSanitize(response.data);
            return processChatData(sanitizedData);
        },
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage?.chattingMessage?.length < DEFAULT_PAGE_SIZE) return undefined;
            return allPages.length; // pageParam으로 넘길 다음 page 번호
        },
        initialPageParam: 0
    });

    // Intersection observer for infinite scroll
    const { ref: topRef, inView } = useInView();
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const fetchChatNumber = async () => {
        try {
            const response = await axios.get(ENDPOINTS.CHAT_COUNT, {
                withCredentials: true
            });
            // 응답이 객체인 경우 totalParticipantCount 필드 사용
            if (response.data && typeof response.data === 'object' && 'totalParticipantCount' in response.data) {
                setParticipantCount(response.data.totalParticipantCount);
            } else {
                // 응답이 단순한 숫자인 경우도 처리
                setParticipantCount(Number(response.data) || 0);
            }
        } catch (error) {
            console.error('채팅방 인원 수 가져오기 실패:', error);
            setParticipantCount(0); // 오류 발생 시 0으로 설정
        }
    };



    // ---- WebSocket hook integration ----
    const {
        isConnected,
        messages: liveMessages,
        sendMessage: sendLiveMessage,
        leaveChatRoom: leaveLiveChat,
        error: wsError
    } = useChatSocket(roomId, myUserId);

    const sendMessage = () => {
        if (chatInput.trim() === '') return;
        sendLiveMessage(chatInput.trim());
        setChatInput('');
    };

    const toggleSidebar = () => setSidebarOpen(prev => !prev);


    // 엔터키로 메시지 전송 (Chat.js와 동일)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Render messages from infiniteQuery and liveMessages (sorted by ascending timestamp)
    const allMessages = [
        ...(data?.pages
            ? data.pages
                .reduceRight((acc, page) => {
                    const msgs = Array.isArray(page.chattingMessage) ? page.chattingMessage : [];
                    return [...msgs, ...acc];
                }, [])
                .sort((a, b) => new Date(a.lastReadAt) - new Date(b.lastReadAt))
            : []
        ),
        ...liveMessages
    ].sort((a, b) => new Date(a.lastReadAt) - new Date(b.lastReadAt));

    // Only scroll to bottom on initial load or when new message is sent by self
    const [initialScrollDone, setInitialScrollDone] = useState(false);
    useEffect(() => {
        if (!initialScrollDone && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
            setInitialScrollDone(true);
        }
    }, [data]);

    // 채팅방 ID가 유효하지 않은 경우 안내 메시지 렌더링
    if (!chatRoomId) {
        return <div>유효하지 않은 채팅방입니다.</div>;
    }

    return (
        <>
            <div className={styles.chatWrapper}>
                <header className={styles.chatHeader}>
                    <button
                        className={styles.backBtn}
                        onClick={() => {
                            leaveLiveChat().then(() => navigate(-1));
                        }}
                        aria-label="뒤로 가기"
                    >
                        ←
                    </button>
                    <div className={styles.chatTitle}>3/22(토) 한화 vs KT 개막전 직관🦁💙</div>
                    <button className={styles.menuBtn} onClick={toggleSidebar}>☰</button>
                </header>

                <main
                    className={styles.chatBody}
                    ref={chatContainerRef}
                >
                    {/* Sentinel for infinite scroll at the top */}
                    <div ref={topRef}></div>
                    <div className={styles.dateLabel}>2025년 3월 30일</div>
                    {allMessages.map((msg, idx) => {
                      const isMine = msg.senderName === myNickname;
                      return (
                        <div
                          key={idx}
                          className={isMine ? styles.messageRowReverse : styles.messageRow}
                        >
                          {!isMine &&
                            <img src={`${process.env.PUBLIC_URL}/Logo/profile.png`} className={styles.avatar}
                                 alt="user"/>}
                          <div>
                            {!isMine && <div className={styles.sender}>{msg.senderName}</div>}
                            <div
                              className={isMine ? styles.messageBubbleMine : styles.messageBubble}>
                              {typeof msg.message === 'string' ? msg.message : ''}
                            </div>
                            <div className={styles.timestamp}>
                              {msg.lastReadAt ? new Date(msg.lastReadAt).toLocaleTimeString() : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef}/>
                </main>

                <div className={styles.chatInputWrapper}>
                    <button className={styles.plusBtn}>+</button>
                    <input
                        className={styles.chatInput}
                        placeholder="메세지를 입력하세요."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button className={styles.sendBtn} onClick={sendMessage}>➤</button>
                </div>

                {sidebarOpen && (
                    <div className={styles.sidebarOverlay} onClick={toggleSidebar}>
                        <aside className={styles.sidebar} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.sidebarHeader}>
                                <button
                                    className={styles.closeBtn}
                                    onClick={toggleSidebar}
                                    aria-label="사이드바 닫기"
                                >
                                    ✕
                                </button>
                                {/*<span>채팅 알림</span>*/}
                                {/*<input*/}
                                {/*    type="checkbox"*/}
                                {/*    checked={true}*/}
                                {/*    onChange={() => {*/}
                                {/*        // TODO: 알림 설정 변경 기능 구현*/}
                                {/*        console.log('알림 설정 변경');*/}
                                {/*    }}*/}
                                {/*    aria-label="채팅 알림 설정"*/}
                                {/*/>*/}
                            </div>
                            <div className={styles.memberList}>
                                <div className={styles.memberCount}>
                                    대화멤버 {typeof participantCount === 'number' ? participantCount : users.length}
                                </div>
                                {roomMaster && (
                                    <div className={styles.memberItem}>
                                        <img src={roomMaster.avatar} className={styles.avatar} alt={roomMaster.name} />
                                        <span>{roomMaster.name} <strong>(방장)</strong></span>
                                    </div>
                                )}
                                {users.map((u, i) => {
                                    if (typeof u !== 'object' || u === null || typeof u.name !== 'string' || typeof u.avatar !== 'string') {
                                        return (
                                            <div key={i} className={styles.memberItem}>
                                                <span>[유효하지 않은 사용자 데이터]</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={i} className={styles.memberItem}>
                                            <img src={u.avatar} className={styles.avatar} alt={u.name}/>
                                            <span>{u.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <button className={styles.leaveBtn} onClick={() => { leaveLiveChat().then(() => navigate('/home')); }}>나가기</button>
                        </aside>
                    </div>
                )}
                {showLeaveRoomModal && (
                    <Modal
                        title="직관팟을 나가시겠어요?"
                        message="직관팟을 나가면 더이상 채팅내역을 확인하실 수 없어요."
                        buttons={[
                            {label: '취소', onClick: () => setShowLeaveRoomModal(false)},
                            {
                                label: '확인',
                                onClick: () => {
                                    setShowLeaveRoomModal(false);
                                    setTimeout(() => leaveLiveChat().then(() => navigate('/schedule')), 0);
                                }
                            }
                        ]}
                    />
                )}
            </div>
            <CasterbotButton onClick={() => setShowCasterbot(true)}/>

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
            {wsError && <div className={styles.errorBanner}>{wsError}</div>}
        </>
    );
};

export default Chatting;