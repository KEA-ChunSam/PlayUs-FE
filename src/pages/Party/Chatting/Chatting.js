// 직관팟 채팅 페이지
import React, {useState, useEffect, useRef} from 'react';
import styles from './Chatting.module.css';
import {useNavigate} from "react-router-dom";
import Modal from "../../../components/Modal/Modal";
import CasterbotModal from "../../Chatbot/CasterbotModal";
import CasterbotButton from "../../../components/CasterbotButton/CasterbotButton";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const Chatting = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLeaveRoomModal, setShowLeaveRoomModal] = useState(false);
    const [showCasterbot, setShowCasterbot] = useState(false);

    const users = [
        {name: 'ZSJ', avatar: `${process.env.PUBLIC_URL}/Logo/profile.png`},
        {name: '네모', avatar: `${process.env.PUBLIC_URL}/Logo/default.png`},
        {name: '세모', avatar: `${process.env.PUBLIC_URL}/Logo/profile.png`},
    ];

    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState([
        {
            sender: 'ZSJ',
            content: '내일이 직관날입니다! 다들 늦지 않고 참석해 주세요!',
            time: '11:30 AM',
            mine: false,
        },
        {
            sender: '',
            content: '네 알겠습니다!',
            time: '11:38 AM',
            mine: true,
        },
    ]);

    const [roomId] = useState(3); // 임시 고정값, 실제 값으로 대체 필요
    const [myUserId] = useState(123); // 실제 로그인된 사용자 ID로 대체
    const stompClientRef = useRef(null);

    const onMessageReceived = (payload) => {
        const message = JSON.parse(payload.body);
        setMessages(prev => [...prev, {
            sender: message.senderName,
            content: message.message,
            time: new Date(message.lastReadAt).toLocaleTimeString(),
            mine: message.senderId === myUserId,
        }]);
    };

    useEffect(() => {
        const socketUrl = 'http://localhost:8081/ws'; // 실제 서버 URL로 변경

        // Access 쿠키에서 토큰을 읽어와 재설정
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('Access='))
          ?.split('=')[1];

        if (token) {
          document.cookie = `Access=${token}; path=/; secure; samesite=None`;
        }

        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/sub/chat/room/${roomId}`, onMessageReceived);
                client.publish({
                    destination: '/pub/chat/enter',
                    body: JSON.stringify({ roomId })
                });
            },
        });
        client.activate();
        stompClientRef.current = client;

        return () => {
            if (client.connected) {
                client.publish({
                    destination: '/pub/chat/exit',
                    body: JSON.stringify({ roomId })
                });
            }
            client.deactivate();
        };
    }, [roomId]);

    const toggleSidebar = () => setSidebarOpen(prev => !prev);

    function leaveChatRoom() {
        setShowLeaveRoomModal(true);
    }

    const handleSendMessage = () => {
        if (chatInput.trim() === '') return;
        const messageContent = chatInput.trim().slice(0, 500);
        stompClientRef.current?.publish({
            destination: '/pub/chat/message',
            body: JSON.stringify({
                roomId,
                message: messageContent
            })
        });
        setChatInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            <div className={styles.chatWrapper}>
                <header className={styles.chatHeader}>
                    <button
                        className={styles.backBtn}
                        onClick={() => navigate(-1)}
                        aria-label="뒤로 가기"
                    >
                        ←
                    </button>
                    <div className={styles.chatTitle}>3/22(토) 한화 vs KT 개막전 직관🦁💙</div>
                    <button className={styles.menuBtn} onClick={toggleSidebar}>☰</button>
                </header>

                <main className={styles.chatBody}>
                    <div className={styles.dateLabel}>2025년 3월 30일</div>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={msg.mine ? styles.messageRowReverse : styles.messageRow}
                        >
                            {!msg.mine &&
                                <img src={`${process.env.PUBLIC_URL}/Logo/profile.png`} className={styles.avatar}
                                     alt="user"/>}
                            <div>
                                {!msg.mine && <div className={styles.sender}>{msg.sender}</div>}
                                <div className={msg.mine ? styles.messageBubbleMine : styles.messageBubble}>
                                    {msg.content}
                                </div>
                                <div className={styles.timestamp}>{msg.time}</div>
                            </div>
                        </div>
                    ))}
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
                    <button className={styles.sendBtn} onClick={handleSendMessage}>➤</button>
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
                                <div className={styles.memberCount}>대화멤버 {users.length}</div>
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
                            { label: '취소', onClick: () => setShowLeaveRoomModal(false) },
                            {
                                label: '확인',
                                onClick: () => {
                                    setShowLeaveRoomModal(false);
                                    navigate('/schedule');
                                }
                            }
                        ]}
                    />
                )}
            </div>
            <CasterbotButton onClick={() => setShowCasterbot(true)} />

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
        </>
    );
};

export default Chatting;