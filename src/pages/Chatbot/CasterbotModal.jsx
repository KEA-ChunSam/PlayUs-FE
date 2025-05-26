import React, {useState} from 'react';
import styles from './CasterbotModal.module.css';

const CasterbotModal = ({onClose}) => {
    const [messages, setMessages] = useState([
        {
            sender: '캐스터봇',
            content: '안녕하세요! 오늘은 KBO에 대해 무엇이 궁금하신가요?',
            // time: '11:30 AM',
            mine: false,
        },
        {
            sender: '',
            content: '현재 타율 1위가 누군지 알려줘',
            // time: '11:30 AM',
            mine: true,
        },
        {
            sender: '캐스터봇',
            content: '2025시즌 타율 1위는 NC 다이노스의 손아섭 선수입니다.',
            // time: '11:30 AM',
            mine: false,
        }
    ]);

    const [chatInput, setChatInput] = useState('');

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        // const now = new Date();
        setMessages(prev => [...prev, {
            sender: '',
            content: chatInput.trim().slice(0, 500),
            // time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mine: true,
        }]);
        setChatInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <header className={styles.header}>
                    <button onClick={onClose} className={styles.backBtn}>←</button>
                    <div className={styles.title}><img src="/Button/casterbot.png" alt="bot"
                                                       className={styles.headerImg}/> 캐스터봇
                    </div>
                </header>
                <div className={styles.chatBody}>
                    {messages.map((msg, i) => (
                        <div key={i} className={msg.mine ? styles.myMessage : styles.botMessage}>
                            {!msg.mine && (
                                <div className={styles.avatarWrapper}>
                                    <img src="/Button/casterbot.png" alt="bot"
                                         className={styles.avatar}/>
                                </div>
                            )}
                            <div className={styles.messageContent}>
                                {!msg.mine && <div className={styles.sender}>{msg.sender}</div>}
                                <div className={styles.messageBubble}>{msg.content}</div>
                                {/*<div className={styles.timestamp}>{msg.time}</div>*/}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.inputArea}>
                    {/*<button className={styles.plusBtn}>+</button>*/}
                    <input
                        className={styles.chatInput}
                        placeholder="메세지를 입력하세요."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button className={styles.sendBtn} onClick={handleSendMessage}>➤</button>
                </div>
            </div>
        </div>
    );
};

export default CasterbotModal;