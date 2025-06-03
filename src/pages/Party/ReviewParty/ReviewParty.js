// 직관팟 기간 만료 시 직관팟 참가자들의 후기를 작성하는 페이지
import React, { useState, useEffect } from 'react';
import styles from './ReviewParty.module.css';
import Modal from '../../../components/Modal/Modal';
import ReviewSelectModal from '../../../components/Modal/ReviewSelectModal/ReviewSelectModal';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';

const ReviewParty = () => {
    const navigate = useNavigate();
    const { partyId } = useParams();
    const [reviewData, setReviewData] = useState([]);

    useEffect(() => {
        if (partyId) {
            const fetchParticipants = async () => {
                try {
                    const res = await axios.get(
                        `${process.env.REACT_APP_LOCAL_BACKEND_TWP_URI}/party/${partyId}/participants`,
                        { withCredentials: true }
                    );
                    // res.data is an array of PartyParticipantsInfoResponse
                    const users = res.data.map(user => ({
                        userId: user.userId,
                        name: user.name,
                        liked: null,
                        message: ''
                    }));
                    setReviewData(users);
                } catch (err) {
                    console.error('Failed to fetch participants:', err);
                    setReviewData([]);
                }
            };
            fetchParticipants();
        }
    }, [partyId]);
    const [modalOpen, setModalOpen] = useState(false);
    const [showReviewRegisterModal, setShowReviewRegisterModal] = useState(false);
    const handleSubmitReview = async () => {
        const messageToTagId = {
            '시간 약속을 잘 지켜요.': 3,
            '경기 직관이 열정적이에요.': 4,
            '상대방에 대한 배려심이 깊어요.': 5,
            '어색한 분위기를 잘 풀어요.': 6,
            '야구 경기에 박식해요.': 7
        };
        const payload = reviewData
            .filter(member => member.liked === true || member.liked === false)
            .map(member => {
                if (member.liked === true) {
                    const tagId = member.message ? (messageToTagId[member.message] || 2) : 2;
                    return { userId: member.userId, tagId, positive: true };
                } else if (member.liked === false) {
                    return { userId: member.userId, tagId: 2, positive: false };
                }
                // If neither liked nor disliked, skip (should not occur due to filter)
            });
        try {
            await axios.post(
                `${process.env.REACT_APP_LOCAL_BACKEND_URI}/users/reviews`,
                payload,
                { withCredentials: true }
            );
            setShowReviewRegisterModal(true);
        } catch (err) {
            console.error('Failed to send reviews:', err);
        }
    };
    const [selectedMemberIdx, setSelectedMemberIdx] = useState(null);

    const handleLike = (index) => {
        setSelectedMemberIdx(index);
        setModalOpen(true);
    };

    const handleDislike = (index) => {
        const newData = [...reviewData];
        newData[index].liked = false;
        newData[index].message = '';
        setReviewData(newData);
    };

    const handleModalSelect = (message) => {
        const newData = [...reviewData];
        newData[selectedMemberIdx].liked = true;
        newData[selectedMemberIdx].message = message;
        setReviewData(newData);
        setModalOpen(false);
    };

    return (
        <div className={styles.reviewWrapper}>
            <h2 className={styles.title}>직관은 재밌으셨나요? 파티원들을 평가해 주세요!</h2>
            <p className={styles.subtitle}>평가는 다른 파티원들의 타율에 영향을 줍니다.</p>
            <div className={styles.reviewContents}>
                {reviewData.map((member, index) => (
                    <div key={index} className={styles.reviewRow}>
                        <div className={styles.rowContent}>
                            <div className={styles.nameLabel}>{member.name} 님은 어떠셨나요?</div>
                            <div className={styles.buttonRow}>
                                <button
                                    className={`${styles.likeBtn} ${member.liked ? styles.selected : ''}`}
                                    onClick={() => handleLike(index)}
                                >
                                    👍
                                </button>
                                <button
                                    className={`${styles.dislikeBtn} ${member.liked === false ? styles.selected : ''}`}
                                    onClick={() => handleDislike(index)}
                                >
                                    👎
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button className={styles.nextBtn} onClick={handleSubmitReview}>후기 전송!</button>

            {modalOpen && (
                <ReviewSelectModal
                    onClose={() => setModalOpen(false)}
                    title={`${reviewData[selectedMemberIdx].name}님에게 후기를 전달해 주세요!`}
                    selectedMessage={reviewData[selectedMemberIdx].message}
                    onSelect={handleModalSelect}
                />
            )}
            {showReviewRegisterModal && (
                <Modal
                    title="후기 작성 완료!"
                    message="소중한 후기가 전달되었어요!"
                    buttons={[{
                        label: '확인', onClick: () => {
                            setShowReviewRegisterModal(false);
                            navigate('/schedule');
                        }
                    }]}
                />
            )}
        </div>
    );
};

export default ReviewParty;