// 직관팟 채팅 페이지
import React, {useEffect, useRef, useState} from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import styles from './Chatting.module.css';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "../../../components/Modal/Modal";
import CasterbotModal from "../../Chatbot/CasterbotModal";
import CasterbotButton from "../../../components/CasterbotButton/CasterbotButton";
import SockJS from 'sockjs-client';
import {Stomp} from '@stomp/stompjs';
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

    const [messages, setMessages] = useState({chattingMessage: []});
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [chatInput, setChatInput] = useState('');
    const [participantCount, setParticipantCount] = useState(0);
    // const [currentPage, setCurrentPage] = useState(0);
    // const [hasMore, setHasMore] = useState(true);
    // const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const stompClientRef = useRef(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const subscriptionRef = useRef(null);
    const chatContainerRef = useRef(null);
    const hasEnteredRef = useRef(false);
    const stompInitializedRef = useRef(false);
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

    // ---- WebSocket logic from Chat.js ----
    // Subscribe to chat room messages
    const subscribeToChat = (client) => {
        if (!client || !client.connected) return;
        if (isSubscribed || subscriptionRef.current) return;
        try {
            const subscription = client.subscribe(ENDPOINTS.WS_SUBSCRIBE, (message) => {
                try {
                    // Parse and sanitize
                    const rawParsedMessage = JSON.parse(message.body);
                    const parsedMessage = deepSanitize(rawParsedMessage);
                    if (parsedMessage.message && typeof parsedMessage.message === 'object') {
                        parsedMessage.message = safeStringify(parsedMessage.message);
                    }
                    // ENTER/EXIT messages update participant count
                    const messageType = parsedMessage.messageType;
                    // New logic: on ENTER, fetch participants and chat number
                    if (messageType === 'ENTER') {
                        fetchParticipants();
                        fetchChatNumber();
                    } else if (messageType === 'EXIT') {
                        fetchChatNumber();
                    }
                    queryClient.setQueryData(['chatMessages', roomId], oldData => {
                        if (!oldData) return oldData;
                        const pages = [...oldData.pages];
                        const lastPageIndex = pages.length - 1;

                        // Ensure the last page is valid
                        if (!Array.isArray(pages[lastPageIndex]?.chattingMessage)) {
                            pages[lastPageIndex] = {
                                ...(pages[lastPageIndex] || {}),
                                chattingMessage: []
                            };
                        }

                        pages[lastPageIndex] = {
                            ...pages[lastPageIndex],
                            chattingMessage: [...pages[lastPageIndex].chattingMessage, parsedMessage]
                        };

                        return {
                            ...oldData,
                            pages
                        };
                    });
                } catch (err) {
                    console.error('메시지 처리 오류:', err);
                }
            });
            subscriptionRef.current = subscription;
            setIsSubscribed(true);
            // Prevent duplicate ENTER messages
            if (!hasEnteredRef.current) {
                client.send('/pub/chat/message', {}, JSON.stringify({
                    roomId,
                    senderId: myUserId,
                    message: '',
                    messageType: 'ENTER'
                }));
                hasEnteredRef.current = true;
            }
            // The following setTimeout block is no longer needed, as participant fetching is now handled on ENTER message
            // setTimeout(() => {
            //     fetchParticipants();
            //     fetchChatNumber();
            // }, 300);
        } catch (err) {
            console.error('채팅방 구독 오류:', err);
            setError('채팅방 구독에 실패했습니다.');
            setTimeout(() => {
                if (client && client.connected && !isSubscribed) {
                    subscribeToChat(client);
                } else if (!client || !client.connected) {
                    initializeWebSocketConnection();
                }
            }, 5000);
        }
    };

    // Unsubscribe from chat room
    const unsubscribeFromChat = () => {
        if (!isSubscribed || !subscriptionRef.current) return;
        try {
            subscriptionRef.current.unsubscribe();
            subscriptionRef.current = null;
            setIsSubscribed(false);
        } catch (err) {
            console.error('채팅방 구독 취소 오류:', err);
        }
    };

    // Initialize WebSocket connection
    const initializeWebSocketConnection = () => {
        if (
            stompInitializedRef.current ||
            (stompClientRef.current && stompClientRef.current.connected && subscriptionRef.current)
        ) {
            return;
        }

        stompInitializedRef.current = true;

        if (stompClientRef.current && stompClientRef.current.connected) {
            if (!isSubscribed) {
                subscribeToChat(stompClientRef.current);
            }
            return;
        }
        const socket = new SockJS(WS_URL);
        const client = Stomp.over(socket);
        stompClientRef.current = client;
        client.debug = () => {
        };
        client.configure({reconnectDelay: 5000});
        client.connect(
            {Cookie: document.cookie},
            () => {
                setIsConnected(true);
                subscribeToChat(client);
            },
            (error) => {
                setError('서버와의 연결에 실패했습니다.');
                setIsConnected(false);
                setIsSubscribed(false);
                stompInitializedRef.current = false; // Reset on failure
            }
        );
        client.onStompError = (frame) => {
            setError('메시지 전송 중 오류가 발생했습니다.');
        };
        client.onWebSocketError = (event) => {
            setError('서버와의 연결이 끊어졌습니다.');
            setIsConnected(false);
            setIsSubscribed(false);
        };
        client.onDisconnect = () => {
            setIsConnected(false);
            setIsSubscribed(false);
            setError('서버와의 연결이 끊어졌습니다.');
        };
        setStompClient(client);
    };

    // Leave chat room: always clean up subscription first, then disconnect and mark exit
    const handleExitChat = async (navigateTo = null) => {
        try {
            // Unsubscribe first to guarantee clean state
            unsubscribeFromChat();

            // Send EXIT if connected
            if (stompClientRef.current && stompClientRef.current.connected) {
                stompClientRef.current.send('/pub/chat/message', {}, JSON.stringify({
                    roomId,
                    senderId: myUserId,
                    message: '',
                    messageType: 'EXIT'
                }));
                stompClientRef.current.disconnect(() => {
                    stompClientRef.current = null;
                    setIsConnected(false);
                    setIsSubscribed(false);
                    hasEnteredRef.current = false;
                });
            } else {
                stompClientRef.current = null;
                setIsConnected(false);
                setIsSubscribed(false);
                hasEnteredRef.current = false;
            }

            stompInitializedRef.current = false; // Reset on clean exit

            // API call to mark participant exit
            await axios.delete(ENDPOINTS.CHAT_EXIT, {
                withCredentials: true
            });

            if (navigateTo) {
                typeof navigateTo === 'function' ? navigateTo() : navigate(navigateTo);
            }
        } catch (error) {
            console.error('채팅방 나가기 오류:', error);
            setError('채팅방을 나가는데 실패했습니다.');
            if (navigateTo) {
                typeof navigateTo === 'function' ? navigateTo() : navigate(navigateTo);
            }
        }
    };

    // ---- On mount: connect ----
    useEffect(() => {
        // Guard: skip re-initialization if already connected and subscribed
        if (
            stompClientRef.current &&
            stompClientRef.current.connected &&
            subscriptionRef.current
        ) {
            return;
        }
        initializeWebSocketConnection();
        return () => {
            handleExitChat();
        };
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (stompClientRef.current && stompClientRef.current.connected) {
                try {
                    stompClientRef.current.send('/pub/chat/message', {}, JSON.stringify({
                        roomId,
                        senderId: myUserId,
                        message: '',
                        messageType: 'EXIT'
                    }));
                } catch (e) {
                    console.error("beforeunload 종료 메시지 실패:", e);
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Reconnect/disconnect WebSocket on navigation to/from chat room
    useEffect(() => {
        const isChatRoom = location.pathname.includes('/chat/party/');

        if (isChatRoom) {
            if (!stompClientRef.current || !stompClientRef.current.connected) {
                initializeWebSocketConnection();
            } else if (!isSubscribed) {
                subscribeToChat(stompClientRef.current);
            }
        } else {
            handleExitChat(); // ensures socket clean-up on navigation out
        }
    }, [location.pathname]);

    // Page focus: reconnect if needed
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (!isConnected || !isSubscribed) {
                    initializeWebSocketConnection();
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isConnected, isSubscribed]);

    // Periodic connection check
    useEffect(() => {
        const checkConnection = () => {
            if (!isConnected || !stompClientRef.current || !stompClientRef.current.connected) {
                initializeWebSocketConnection();
            } else if (isConnected && !isSubscribed) {
                subscribeToChat(stompClientRef.current);
            }
        };
        const intervalId = setInterval(checkConnection, 30000);
        return () => {
            clearInterval(intervalId);
        };
    }, [isConnected, isSubscribed]);

    // Scroll to bottom logic (only on initial load or after sending a new message by self)
    const [initialScrollDone, setInitialScrollDone] = useState(false);

    // 메시지 전송 함수
    // 메시지 전송 함수 (Chat.js의 stompClientRef.current.publish() 사용, ENDPOINTS.WS_PUBLISH 사용)
    const sendMessage = () => {
        if (chatInput.trim() === '' || !isConnected || !stompClientRef.current) {
            return;
        }

        const messageData = {
            roomId,
            senderId: myUserId,
            senderName: myNickname,
            message: chatInput.trim(),
            messageType: 'TALK'
        };

        try {
            stompClientRef.current.publish({
                destination: ENDPOINTS.WS_PUBLISH,
                body: JSON.stringify(messageData)
            });

            setChatInput('');
        } catch (error) {
            console.error('메시지 전송 오류:', error);
            setError('메시지를 전송하지 못했습니다.');
        }
    };

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    // 사용자가 명시적으로 나가기 버튼을 클릭한 경우
    const leaveChatRoom = async () => {
        try {
            // 1) location.state에서 partyId 꺼내기
            const partyId = location.state?.partyId;
            if (!partyId) {
                console.error("partyId가 존재하지 않습니다. location.state에서 확인해주세요.");
                return;
            }

            // 2) 백엔드 API 호출: 직관팟 탈퇴
            await axios.post(
                `${process.env.REACT_APP_LOCAL_BACKEND_TWP_URI}/party/${partyId}/leave`,
                null,
                { withCredentials: true }
            );

            // 3) 웹소켓 구독 해제 및 연결 끊기
            await handleExitChat();

            // 4) 성공 시 홈으로 이동
            navigate('/home');
        } catch (error) {
            console.error('Failed to leave party:', error);
        }
    };

    // 엔터키로 메시지 전송 (Chat.js와 동일)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Render messages from infiniteQuery (flatten pages, sorted by ascending timestamp, prepended for upward scroll)
    const allMessages = data?.pages
        ? data.pages
            .reduceRight((acc, page) => {
                // Prepend each page's messages (older at top)
                const msgs = Array.isArray(page.chattingMessage) ? page.chattingMessage : [];
                return [...msgs, ...acc];
            }, [])
            .sort((a, b) => new Date(a.lastReadAt) - new Date(b.lastReadAt))
        : [];

    // Only scroll to bottom on initial load or when new message is sent by self
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
                            handleExitChat(() => navigate(-1));
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
                            <button className={styles.leaveBtn} onClick={leaveChatRoom}>나가기</button>
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
                                    setTimeout(() => handleExitChat('/schedule'), 0);
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
        </>
    );
};

export default Chatting;