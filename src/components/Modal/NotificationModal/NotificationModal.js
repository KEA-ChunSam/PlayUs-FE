import React, {useEffect, useState} from "react";
import axios from "axios";
import {formatNotificationDate} from "../../../utils/formatNotificationDate";
import styles from "./NotificationModal.module.css";

const tabs = ["전체", "직관팟", "커뮤니티"];


const TYPE_TO_TAB = {
    COMMENT: "커뮤니티",
    PARTY_REQUEST: "직관팟",
    PARTY_JOINED: "직관팟",
    PARTY_APPROVED: "직관팟",
    PARTY_REFUSED: "직관팟",
};

const NotificationModal = ({onClose}) => {
    const [groupedNotifications, setGroupedNotifications] = useState({
        전체: [],
        직관팟: [],
        커뮤니티: [],
    });
    const [activeTab, setActiveTab] = useState("전체");

    useEffect(() => {
        const fetchInitialNotifications = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/notifications`,
                    {withCredentials: true}
                );
                const raw = Array.isArray(response.data)
                    ? response.data
                    : response.data.notifications || response.data.data || [];
                const normalizedList = raw.map(n => ({
                    id: n.id,
                    title: n.title,
                    content: n.content,
                    commentId: n.commentId !== undefined ? n.commentId : n.comment_id,
                    partyId: n.partyId !== undefined ? n.partyId : n.party_id,
                    actorId: n.actorId !== undefined ? n.actorId : n.actor_id,
                    type: n.type,
                    createdAt: n.createdAt !== undefined ? n.createdAt : n.created_at,
                    isRead: n.isRead !== undefined ? n.isRead : n.is_read,
                    actorAvatarUrl: (n.actorAvatarUrl) ? n.actorAvatarUrl : ((n.actorId || n.actor_id) ? `/avatars/${n.actorId || n.actor_id}.png` : `${process.env.PUBLIC_URL}/profile/user2.jpg`)
                }));
                const topTen = normalizedList
                    .sort((a, b) => b.id - a.id)
                    .slice(0, 6);

                const newGrouped = {
                    전체: [],
                    직관팟: [],
                    커뮤니티: [],
                };

                topTen.forEach((notif) => {
                    newGrouped["전체"].push(notif);
                    const tabName = TYPE_TO_TAB[notif.type];
                    if (tabName) {
                        newGrouped[tabName].push(notif);
                    }
                });

                setGroupedNotifications(newGrouped);
            } catch (err) {
                console.error("초기 알림 조회 실패:", err);
            }
        };

        fetchInitialNotifications();
    }, []);

    const handleClearAll = async () => {
        try {
            const allNotifications = groupedNotifications["전체"];
            // Mark each notification as read via API
            const results = await Promise.allSettled(
                allNotifications.map((item) =>
                    axios.patch(
                        `${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/notifications/read/${item.id}`,
                        {},
                        {withCredentials: true}
                    )
                )
            );
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`알림 ${allNotifications[index].id} 읽기 처리 실패:`, result.reason);
                }
            });
            // After marking all as read, clear state so none remain
            setGroupedNotifications({
                전체: [],
                직관팟: [],
                커뮤니티: [],
            });
        } catch (err) {
            console.error("전체 알림 읽기 처리 실패:", err);
        }
    };

    const handleRespond = (id, decision) => {
        // This function is left in place but not used until SSE or other logic is added
    };

    const handleApprove = async (item) => {
        try {
            await axios.patch(
                `${process.env.REACT_APP_LOCAL_BACKEND_TWP_URI}/party/${item.partyId}/approve`,
                {applicantUserId: item.actorId, isApproved: true},
                {withCredentials: true}
            );
            await axios.patch(
                `${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/notifications/read/${item.id}`,
                {},
                {withCredentials: true}
            );
            setGroupedNotifications(prev => {
                const updated = {...prev};
                updated["전체"] = updated["전체"].filter(n => n.id !== item.id);
                updated["직관팟"] = updated["직관팟"].filter(n => n.id !== item.id);
                return updated;
            });
        } catch (err) {
            console.error("승인 요청 처리 실패:", err);
        }
    };

    const handleReject = async (item) => {
        try {
            await axios.patch(
                `${process.env.REACT_APP_LOCAL_BACKEND_TWP_URI}/party/${item.partyId}/approve`,
                {applicantUserId: item.actorId, isApproved: false},
                {withCredentials: true}
            );
            await axios.patch(
                `${process.env.REACT_APP_LOCAL_BACKEND_URI}/user/notifications/read/${item.id}`,
                {},
                {withCredentials: true}
            );
            setGroupedNotifications(prev => {
                const updated = {...prev};
                updated["전체"] = updated["전체"].filter(n => n.id !== item.id);
                updated["직관팟"] = updated["직관팟"].filter(n => n.id !== item.id);
                return updated;
            });
        } catch (err) {
            console.error("거부 요청 처리 실패:", err);
        }
    };

    return (
        <div className={styles.modalWrapper}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>전체 알림</h3>
                    <button onClick={handleClearAll}>전체 알림 삭제하기</button>
                    {/*<button onClick={onClose} className={styles.closeBtn}>닫기</button>*/}
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
                    {groupedNotifications[activeTab].filter((item) => !item.isRead).length === 0 ? (
                        <div className={styles.empty}>알림이 없습니다.</div>
                    ) : (
                        groupedNotifications[activeTab]
                            .filter((item) => !item.isRead)
                            .map((item) => (
                                <div key={item.id}
                                     className={`${styles.notificationItem} ${!item.isRead ? styles.newAlert : ""}`}>
                                    {!item.isRead && <span className={styles.newDot}/>}
                                    {item.type === "PARTY_REQUEST" ? (
                                        <div className={styles.partyRequestItem}>
                                            <img
                                                src={item.actorAvatarUrl || "/default-avatar.png"}
                                                alt="프로필"
                                                className={styles.avatar}
                                            />
                                            <div className={styles.requestText}>
                                                <strong>{item.title}</strong>
                                                <div className={styles.subText}>{item.content}</div>
                                                <div className={styles.timestamp}>
                                                    {formatNotificationDate(item.createdAt)}
                                                </div>
                                            </div>
                                            <div className={styles.actionButtons}>
                                                <button
                                                    className={styles.approve}
                                                    onClick={() => handleApprove(item)}
                                                >
                                                    승인하기
                                                </button>
                                                <button
                                                    className={styles.reject}
                                                    onClick={() => handleReject(item)}
                                                >
                                                    거부하기
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.notificationItemContent}>
                                            <strong>{item.title}</strong>
                                            <div className={styles.subText}>{item.content}</div>
                                            <div className={styles.timestamp}>
                                                {formatNotificationDate(item.createdAt)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;