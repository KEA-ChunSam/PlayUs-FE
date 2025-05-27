// 직관팟 신청 페이지
import React, {useState} from 'react';
import TabNav from '../../components/TabNav/TabNav';
import styles from './PartyApply.module.css';
import {useNavigate, useParams} from "react-router-dom";
import Modal from "../../components/Modal/Modal";
import axios from 'axios';

export default function PartyApply() {
    const [message, setMessage] = useState('');
    const [agreed, setAgreed] = useState(false);
    const navigate = useNavigate();
    const { partyId } = useParams();
    const [activeTab, setActiveTab] = useState(0);
    const tabLabels = ["직관팟 구하기", "내 신청 현황", "승인 요청"];
    const [showApplyModal, setShowApplyModal] = useState(false);
    const handleSubmit = async () => {
        try {
            await axios.post(`http://localhost:8081/party/${partyId}/apply`, {
                requireMessage: message
            }, {
                withCredentials: true
            });
            setShowApplyModal(true);
        } catch (error) {
            console.error("신청 실패:", error.response?.data || error);
            alert("신청에 실패했습니다. 다시 시도해 주세요.");
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <TabNav tabs={tabLabels} onTabChange={setActiveTab} onBack={() => navigate(-1)}/>
                <h2 className={styles.title}>직관팟 참여 신청하기</h2>
                <p className={styles.subtitle}>
                    3/22(토) 한화 vs KT 개막전 직관🦁💙
                </p>

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="파티장에게 전할 한마디를 입력해 주세요! (다짐 등)"
                    maxLength={100}
                    className={styles.textarea}
                />
                <div className={styles.charCount}>
                    ({message.length} / 100)
                </div>

                <div className={styles.checkboxWrapper}>
                    <input
                        type="checkbox"
                        checked={agreed}
                        id="rulesAgreement"
                        onChange={() => setAgreed(!agreed)}
                        className={styles.checkbox}
                    />
                    <label htmlFor="rulesAgreement" className={styles.label}>직관팟의 정보와 규칙을 완벽히 이해했어요!</label>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!agreed || message.trim() === ''}
                    className={styles.submitButton}
                >
                    신청하기
                </button>
            </div>
            {showApplyModal && (
                <Modal
                    title="신청 완료!"
                    message="직관팟 신청이 완료되었어요!"
                    // onClose={() => {
                    //     setShowApplyModal(false);
                    //     navigate('/party/matchid');
                    // }}
                    buttons={[
                        { label: '취소', onClick: () => setShowApplyModal(false) },
                        {
                            label: '확인',
                            onClick: () => {
                                // 삭제 로직 실행
                                setShowApplyModal(false);
                                navigate('/party/matchid')
                            }
                        }
                    ]}
                />
            )}
        </div>
    );
}