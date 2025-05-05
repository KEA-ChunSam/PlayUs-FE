// 직관팟 신청 페이지
import React, {useState} from 'react';
import TabNav from '../../components/TabNav/TabNav';
import styles from './PartyApply.module.css';
import {useNavigate} from "react-router-dom";

export default function PartyApply() {
    const [message, setMessage] = useState('');
    const [agreed, setAgreed] = useState(false);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const tabLabels = ["직관팟 구하기", "내 신청 현황", "승인 요청"];
    const handleSubmit = () => {
        if (!agreed || message.trim() === '') return;
        // TODO: 신청 처리
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                {/* TabNav만 따로 위에 삽입 */}
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
                        onChange={() => setAgreed(!agreed)}
                        className={styles.checkbox}
                    />
                    <label className={styles.label}>직관팟의 정보와 규칙을 완벽히 이해했어요!</label>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!agreed || message.trim() === ''}
                    className={styles.submitButton}
                >
                    신청하기
                </button>
            </div>
        </div>
    );
}