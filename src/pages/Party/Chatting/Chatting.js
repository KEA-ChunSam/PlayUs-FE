import React, { useState } from 'react';
import styles from './Chatting.module.css';
import {useNavigate} from "react-router-dom";
import Modal from "../../../components/Modal/Modal";

const Chatting = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLeaveRoomModal, setShowLeaveRoomModal] = useState(false);

  const users = [
    { name: 'ZSJ', avatar: '/Logo/profile.png' },
    { name: '네모', avatar: '/Logo/profile2.png' },
    { name: '세모', avatar: '/Logo/profile.png' },
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

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  function leaveChatRoom() {
    setShowLeaveRoomModal(true);
  }

  const handleSendMessage = () => { // 임시 채팅 로직임
    if (chatInput.trim() === '') return;
    const newMessage = {
      sender: '',
      content: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mine: true,
    };
    setMessages(prev => [...prev, newMessage]);
    setChatInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className={styles.chatWrapper}>
      <header className={styles.chatHeader}>
        <button className={styles.backBtn}>←</button>
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
            {!msg.mine && <img src="/Logo/profile.png" className={styles.avatar} alt="user" />}
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
              <span>채팅 알림</span>
              <input type="checkbox" checked readOnly />
            </div>
            <div className={styles.memberList}>
              <div className={styles.memberCount}>대화멤버 {users.length}</div>
              {users.map((u, i) => (
                <div key={i} className={styles.memberItem}>
                  <img src={u.avatar} className={styles.avatar} alt={u.name} />
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
              onClose={() => {
                setShowLeaveRoomModal(false);
                navigate('/schedule');
              }}
          />
      )}
    </div>
  );
};

export default Chatting;