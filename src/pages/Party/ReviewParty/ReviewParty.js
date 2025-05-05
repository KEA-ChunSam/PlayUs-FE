import React, {useState} from 'react';
import styles from './ReviewParty.module.css';
import Modal from '../../../components/Modal/Modal';
import ReviewSelectModal from '../../../components/Modal/ReviewSelectModal/ReviewSelectModal';
import {useNavigate} from "react-router-dom";

const ReviewParty = () => {
    const navigate = useNavigate();
    const [reviewData, setReviewData] = useState([
        {name: 'ZSJ', liked: null, message: ''},
        {name: '네모', liked: null, message: ''},
        {name: '인기스타김도영', liked: null, message: ''},
        {name: '20년째보살팬', liked: null, message: ''},
        {name: '언제나한화생각', liked: null, message: ''}
    ]);
    const [modalOpen, setModalOpen] = useState(false);
    const [showReviewRegisterModal, setShowReviewRegisterModal] = useState(false);
    const handleSubmitReview = () => {
        setShowReviewRegisterModal(true);
    };
    const [selectedMemberIdx, setSelectedMemberIdx] = useState(null);

    const presetMessages = [
        '답장이 빨라요.',
        '시간 약속을 잘 지켜요.',
        '경기 직관이 열정적이에요.',
        '상대방에 대한 배려심이 깊어요.',
        '어색한 분위기를 잘 풀어요.',
        '야구 경기에 박식해요.'
    ];

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
            <button className={styles.nextBtn} onClick={handleSubmitReview}>다음</button>

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
                    onClose={() => {
                        setShowReviewRegisterModal(false);
                        navigate('/schedule');
                    }}
                />
            )}
        </div>
    );
};

export default ReviewParty;