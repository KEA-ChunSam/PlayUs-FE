import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import './Chat.css';
const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    // useEffect(() => {
    //     // 토큰 가져오기
    //     const token = document.cookie
    //         .split('; ')
    //         .find(row => row.startsWith('Access='))
    //         ?.split('=')[1];
    //     if (!token) {
    //         setError('인증 토큰이 없습니다.');
    //         return;
    //     }
    //     // STOMP 클라이언트 설정
    //     const client = new Client({
    //         webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
    //         connectHeaders: {
    //             Authorization: `Bearer ${token}`
    //         },
    //         debug: function (str) {
    //             console.log(str);
    //         },
    //         reconnectDelay: 5000,
    //         heartbeatIncoming: 4000,
    //         heartbeatOutgoing: 4000,
    //     });
    useEffect(() => {
        axios.get('http://localhost:8081/chat/3', {
            withCredentials: true
        })
        .then(response => {
            const loadedMessages = response.data.chattingMessage.map(msg => ({
                sender: msg.senderName || '익명',
                content: msg.message || '',
                timestamp: msg.lastReadAt || new Date().toISOString()
            }));
            setMessages(loadedMessages);
        })
        .catch(error => {
            console.error('채팅 기록 불러오기 실패:', error);
            setError('채팅 기록을 불러오지 못했습니다.');
        });
    }, []);
    useEffect(() => {
        const cookies = document.cookie;
        console.log('쿠키 값:', cookies);
    }, []);
    useEffect(() => {
        // STOMP 클라이언트 설정
        console.log('Access-Token: ', document.cookie);
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
            connectHeaders: {
                Cookie: document.cookie
            },
            debug: function (str) {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });
        // 연결 성공 콜백
        client.onConnect = () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
            setError(null);
            // 채팅방 구독
            client.subscribe('/sub/chat/room/3', (message) => {
                console.log('[SUBSCRIBED MESSAGE]', message.body);
                const newMessage = JSON.parse(message.body);
                console.log('[PARSED MESSAGE]', newMessage);
                setMessages(prev => [...prev, {
                    sender: newMessage.senderName || '익명',
                    content: newMessage.message || '',
                    timestamp: newMessage.lastReadAt || new Date().toISOString()
                }]);
            });
        };
        // 연결 실패 콜백
        client.onStompError = (frame) => {
            console.error('STOMP error:', frame);
            setError('메시지 전송 중 오류가 발생했습니다.');
        };
        // WebSocket 에러 콜백
        client.onWebSocketError = (event) => {
            console.error('WebSocket error:', event);
            setError('서버와의 연결이 끊어졌습니다.');
            setIsConnected(false);
        };
        // 연결 해제 콜백
        client.onDisconnect = () => {
            setIsConnected(false);
            setError('서버와의 연결이 끊어졌습니다.');
        };
        client.activate();
        setStompClient(client);
        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, []);
    // 스크롤을 항상 최신 메시지로 이동
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && stompClient && isConnected) {
            const chatMessage = {
                message: message
            };
            console.log(chatMessage);
            try {
                stompClient.publish({
                    destination: '/pub/chat/message',
                    body: JSON.stringify(chatMessage),
                    headers: {
                        'content-type': 'application/json'
                    }
                });
                setMessages(prev => [...prev, {
                    sender: '나',
                    content: message,
                    timestamp: new Date().toISOString()
                }]);
                setMessage('');
            } catch (error) {
                console.error('메시지 전송 실패:', error);
                setError('메시지 전송에 실패했습니다.');
            }
        }
    };
    const handleExitChat = async () => {
        try {
            const response = await axios.delete('http://localhost:8081/chat/3', {
                withCredentials: true
            });
            console.log('채팅방 나가기 성공');
            if (stompClient) {
                stompClient.deactivate();
            }
            // optional: navigate or reset state
        } catch (error) {
            console.error('채팅방 나가기 실패:', error);
            setError('채팅방을 나가지 못했습니다.');
        }
    };
    return (
        <div className="chat-container">
            {error && <div className="error-message">{error}</div>}
            {!isConnected && <div className="connection-message">연결 중...</div>}
            <button onClick={handleExitChat} disabled={!isConnected}>나가기</button>
            <div className="messages-container">
                {messages.map((msg, index) => (
                    <div key={index} className="message">
                        <strong>{msg.sender}: </strong>
                        {msg.content}
                        <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="message-form">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    disabled={!isConnected}
                />
                <button type="submit" disabled={!isConnected}>
                    전송
                </button>
            </form>
        </div>
    );
};
export default Chat;
