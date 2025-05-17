import React, {useState} from "react";
import styles from "./NotificationModal.module.css";

const tabs = ["전체", "직관팟", "커뮤니티"];

const dummyData = {
    전체: [
        {
            id: 1,
            category: "직관팟",
            type: "참가요청",
            user: "Ashwin Bose",
            date: "3/22(토)",
            message: "한화 vs KT 개막전 직관 파티 참가를 요청했어요.",
            content: "“안녕하세요! 저도 이 경기 같이 직관하고 싶어요!”",
            new: true,
            status: null
        },
        {
            id: 2,
            category: "직관팟",
            type: "승인",
            user: "ZSJ",
            date: "3/27(토)",
            message: "한화 vs 삼성 직관 함께보기 가 승인되었어요!",
            content: "가입이 승인되었어요!",
            new: false
        },
    ],
    직관팟: [
        {
            id: 1,
            category: "직관팟",
            type: "참가요청",
            user: "Ashwin Bose",
            date: "3/22(토)",
            message: "한화 vs KT 개막전 직관 파티 참가 요청",
            content: "“안녕하세요! 저도 이 경기 같이 직관하고 싶어요!”",
            new: true,
            status: null
        },
        {
            id: 2,
            category: "직관팟",
            type: "승인",
            user: "ZSJ",
            date: "3/27(토)",
            message: "한화 vs 삼성 직관 함께보기 승인",
            content: "가입이 승인되었어요!",
            new: false
        },
    ],
    커뮤니티: [],
};

const NotificationModal = ({onClose}) => {
    const [activeTab, setActiveTab] = useState("전체");
    const [notifications, setNotifications] = useState(dummyData);

    const filtered = notifications[activeTab];

    const handleClearAll = () => {
        const cleared = {};
        for (const key in notifications) {
            cleared[key] = notifications[key].filter(
                (item) => item.type === "참가요청" && item.status === null
            );
        }
        setNotifications(cleared);
    };

    const handleRespond = (id, decision) => {
        const updated = {};
        for (const key in notifications) {
            updated[key] = notifications[key].map((n) =>
                n.id === id ? { ...n, status: decision } : n
            );
        }
        setNotifications(updated);
    };

    return (
        <div className={styles.modalWrapper}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>전체 알림</h3>
                    <button onClick={handleClearAll}>전체 알림 삭제하기</button>
                </div>
                <div className={styles.tabs}>
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={activeTab === tab ? styles.active : ""}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className={styles.notifications}>
                    {filtered.length === 0 ? (
                        <div className={styles.empty}>알림이 없습니다.</div>
                    ) : (
                        filtered.map((item) => (
                            <div key={item.id} className={`${styles.notificationItem} ${item.new ? styles.newAlert : ""}`}>
                                {item.new && <span className={styles.newDot}/>}
                                <div className={styles.notificationText}>
                                    <strong>{item.user}</strong>님이 {item.date} {item.message}
                                    <div className={styles.subText}>{item.content}</div>
                                    {item.type === "참가요청" && item.status == null && (
                                      <div className={styles.actionButtons}>
                                        <button className={styles.approve} onClick={() => handleRespond(item.id, "승인")}>승인하기</button>
                                        <button className={styles.reject} onClick={() => handleRespond(item.id, "거부")}>거부하기</button>
                                      </div>
                                    )}
                                    {item.type === "참가요청" && item.status !== null && (
                                      <div className={styles.resultText}>{item.status}되었어요!</div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;