// 직관팟 채팅 페이지
import React, {useEffect, useMemo, useRef, useState} from 'react';
import styles from './Chatting.module.css';
import {useLocation, useNavigate} from "react-router-dom";
import Modal from "../../../components/Modal/Modal";
import CasterbotModal from "../../Chatbot/CasterbotModal";
import CasterbotButton from "../../../components/CasterbotButton/CasterbotButton";
import SockJS from 'sockjs-client';
import {Stomp} from '@stomp/stompjs';
import axios from 'axios';

const Chatting = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLeaveRoomModal, setShowLeaveRoomModal] = useState(false);
    const [showCasterbot, setShowCasterbot] = useState(false);

    const users = [
        {name: 'ZSJ', avatar: `${process.env.PUBLIC_URL}/Logo/profile.png`},
        {name: '네모', avatar: `${process.env.PUBLIC_URL}/Logo/default.png`},
        {name: '세모', avatar: `${process.env.PUBLIC_URL}/Logo/profile.png`},
    ];

    const [messages, setMessages] = useState({chattingMessage: []});
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [chatInput, setChatInput] = useState('');
    const [participantCount, setParticipantCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const stompClientRef = useRef(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const subscriptionRef = useRef(null);

    // API 경로 상수
    const API_BASE_URL = 'http://localhost:8081';
    const WS_URL = `${API_BASE_URL}/ws`;
    const roomId = 9; // 실제 채팅방 ID로 수정 필요
    const myUserId = 123; // 실제 로그인된 사용자 ID로 대체

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

    const getChatMessages = async (pageNumber = 0, lastMessageTimeStamp = null) => {
        const params = {
            pageNumber,
            pageSize: DEFAULT_PAGE_SIZE
        };
        if (lastMessageTimeStamp) {
            params.lastMessageTimeStamp = lastMessageTimeStamp.toISOString();
        }

        try {
            const response = await axios.get(ENDPOINTS.CHAT_MESSAGES, {
                params,
                withCredentials: true
            });

            // 원시 응답 데이터를 로깅
            console.log('서버 원본 응답:', JSON.stringify(response.data));

            // 응답 데이터의 깊은 복사본 생성하고 안전하게 처리
            const sanitizedData = deepSanitize(response.data);
            const processedData = processChatData(sanitizedData);

            return processedData;
        } catch (error) {
            console.error('채팅 메시지 가져오기 실패:', error);
            return {chattingMessage: []};
        }
    };

    const fetchChatNumber = async () => {
        try {
            const response = await axios.get(ENDPOINTS.CHAT_COUNT, {
                withCredentials: true
            });
            setParticipantCount(response.data);
        } catch (error) {
            console.error('채팅방 인원 수 가져오기 실패:', error);
        }
    };

    // ---- WebSocket logic from Chat.js ----
    // Subscribe to chat room messages
    const subscribeToChat = (client) => {
        if (!client || !client.connected) {
            console.error('구독 실패: 클라이언트가 없거나 연결되지 않음');
            return;
        }
        if (isSubscribed && subscriptionRef.current) {
            return;
        }
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
                    if (messageType === 'ENTER' || messageType === 'EXIT') {
                        fetchChatNumber();
                    }
                    setMessages(prev => {
                        const prevMessages = Array.isArray(prev.chattingMessage) ? prev.chattingMessage : [];
                        return {
                            ...prev,
                            chattingMessage: [...prevMessages, parsedMessage]
                        };
                    });
                } catch (err) {
                    console.error('메시지 처리 오류:', err);
                }
            });
            subscriptionRef.current = subscription;
            setIsSubscribed(true);
            // Send enter message
            client.send('/pub/chat/message', {}, JSON.stringify({
                roomId,
                senderId: myUserId,
                message: '',
                messageType: 'ENTER'
            }));
            fetchChatNumber();
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
            stompClientRef.current &&
            stompClientRef.current.connected &&
            subscriptionRef.current
        ) {
            return; // Prevent duplicate connection and subscription
        }
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
                });
            } else {
                stompClientRef.current = null;
                setIsConnected(false);
                setIsSubscribed(false);
            }

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

    // ---- On mount: fetch chat history and connect ----
    const initializeChat = async () => {
        try {
            setIsLoading(true);
            const data = await getChatMessages(0);
            setMessages(data);
            setHasMore(data.chattingMessage && data.chattingMessage.length === DEFAULT_PAGE_SIZE);
            setCurrentPage(0);
        } catch (error) {
            setError('채팅 기록을 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
            // Guard: skip re-initialization if already connected and subscribed
            if (
                stompClientRef.current &&
                stompClientRef.current.connected &&
                subscriptionRef.current
            ) {
                return;
            }
            initializeWebSocketConnection();
        }
    };

    useEffect(() => {
        initializeChat();
        return () => {
            handleExitChat(); // now used for both button and navigation exit
        };
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

    // 안전하게 처리된 메시지 목록을 계산
    const safeMessages = useMemo(() => {
        if (!messages || !Array.isArray(messages.chattingMessage)) {
            return {chattingMessage: []};
        }

        try {
            return {
                ...messages,
                chattingMessage: messages.chattingMessage.map(msg => {
                    if (!msg) return {message: '', senderName: '알 수 없음'};

                    // 완전한 안전 검사
                    const safeMsg = {...msg};

                    // 메시지가 객체인 경우 강제 문자열화
                    if (safeMsg.message && typeof safeMsg.message === 'object') {
                        safeMsg.message = safeStringify(safeMsg.message);
                    }

                    // undefined인 경우 빈 문자열로 대체
                    if (safeMsg.message === undefined || safeMsg.message === null) {
                        safeMsg.message = '';
                    }

                    return safeMsg;
                })
            };
        } catch (error) {
            console.error('메시지 안전 처리 중 오류:', error);
            return {chattingMessage: []};
        }
    }, [messages]);

    // 스크롤 자동 이동
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [safeMessages]); // 안전하게 처리된 메시지를 기준으로 스크롤

    // 메시지 전송 함수
    // 메시지 전송 함수 (Chat.js의 stompClientRef.current.publish() 사용, ENDPOINTS.WS_PUBLISH 사용)
    const sendMessage = () => {
        if (chatInput.trim() === '' || !isConnected || !stompClientRef.current) {
            return;
        }

        try {
            const messageData = {
                roomId,
                message: chatInput.trim(),
                messageType: 'TALK'
            };

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
    function leaveChatRoom() {
        setShowLeaveRoomModal(true);
    }

    // 엔터키로 메시지 전송 (Chat.js와 동일)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            <div className={styles.chatWrapper}>
                <header className={styles.chatHeader}>
                    <button
                        className={styles.backBtn}
                        onClick={() => {
                            // 뒤로가기 시 채팅방 나가기 처리 후 이동
                            handleExitChat(() => navigate(-1));
                        }}
                        aria-label="뒤로 가기"
                    >
                        ←
                    </button>
                    <div className={styles.chatTitle}>3/22(토) 한화 vs KT 개막전 직관🦁💙</div>
                    <button className={styles.menuBtn} onClick={toggleSidebar}>☰</button>
                </header>

                <main className={styles.chatBody}>
                    <div className={styles.dateLabel}>2025년 3월 30일</div>
                    {safeMessages.chattingMessage.map((msg, idx) => (
                        <div
                            key={idx}
                            className={msg.senderId === myUserId ? styles.messageRowReverse : styles.messageRow}
                        >
                            {msg.senderId !== myUserId &&
                                <img src={`${process.env.PUBLIC_URL}/Logo/profile.png`} className={styles.avatar}
                                     alt="user"/>}
                            <div>
                                {msg.senderId !== myUserId && <div className={styles.sender}>{msg.senderName}</div>}
                                <div
                                    className={msg.senderId === myUserId ? styles.messageBubbleMine : styles.messageBubble}>
                                    {typeof msg.message === 'string' ? msg.message : ''}
                                </div>
                                <div className={styles.timestamp}>
                                    {msg.lastReadAt ? new Date(msg.lastReadAt).toLocaleTimeString() : ''}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef}/>
                    {/*<button onClick={handleExitChat} disabled={!isConnected} className="exit-button">*/}
                    {/*    소켓 나가기*/}
                    {/*</button>*/}
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
                                <span>채팅 알림</span>
                                <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={() => {
                                        // TODO: 알림 설정 변경 기능 구현
                                        console.log('알림 설정 변경');
                                    }}
                                    aria-label="채팅 알림 설정"
                                />
                            </div>
                            <div className={styles.memberList}>
                                <div className={styles.memberCount}>대화멤버 {participantCount || users.length}</div>
                                {users.map((u, i) => (
                                    <div key={i} className={styles.memberItem}>
                                        <img src={u.avatar} className={styles.avatar} alt={u.name}/>
                                        <span>{u.name}</span>
                                    </div>
                                ))}
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
