// 직관팟 만들기 1단계 Flow 컴포넌트. 모든 란이 작성되어야 다음 단계 진행
import React, {useState} from 'react';
import styles from './PartyFormStep1.module.css';
import TabNav from "../TabNav/TabNav";
import {useNavigate} from "react-router-dom";
import Modal from '../Modal/Modal';

const PartyFormStep1 = ({form, setForm, onNext}) => {
    const handleChange = (field, value) => {
        setForm(prev => ({...prev, [field]: value}));
    };
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();
    const tabLabels = ["직관팟 만들기"];
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const isFormValid = () => {
        return (
            form.partyName &&
            form.applyType &&
            form.gender &&
            form.age &&
            form.min &&
            form.max &&
            form.min < form.max
        );
    };

    return (
        <div className={styles.container}>
            {modalOpen && (
                <Modal
                    title="입력 오류"
                    message={modalMessage}
                    onClose={() => setModalOpen(false)}
                />
            )}
            <TabNav tabs={tabLabels} onTabChange={setActiveTab} onBack={() => navigate(-1)}/>
            <div className={styles.inputForm}>
                <h2 className={styles.title}>파티 이름을 설정해 주세요.</h2>
                <input
                    type="text"
                    value={form.partyName || ''}
                    onChange={e => handleChange('partyName', e.target.value)}
                    placeholder="부적절한 명칭 설정은 제재를 받을 수 있습니다."
                    className={styles.input}
                />

                <h2 className={styles.title}>신청 방식을 선택해 주세요.</h2>
                <div className={styles.section}>
                    {['선착순', '승인제'].map(type => (
                        <button
                            key={type}
                            className={`${styles.button} ${form.applyType === type ? styles.buttonActive : ''}`}
                            onClick={() => handleChange('applyType', type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <h2 className={styles.title}>참여를 원하는 성별을 선택해 주세요.</h2>
                <div className={styles.section}>
                    {['남자만', '여자만', '상관없음'].map(gender => (
                        <button
                            key={gender}
                            className={`${styles.button} ${form.gender === gender ? styles.buttonActive : ''}`}
                            onClick={() => handleChange('gender', gender)}
                        >
                            {gender}
                        </button>
                    ))}
                </div>

                <h2 className={styles.title}>참여자의 나이를 설정해 주세요.</h2>
                <div className={`${styles.section} ${styles.flexWrap}`}>
                    {['10대', '20대', '30대', '40대', '50대', '60대 이상'].map(age => (
                        <button
                            key={age}
                            className={`${styles.button} ${form.age === age ? styles.buttonActive : ''}`}
                            onClick={() => handleChange('age', age)}
                        >
                            {age}
                        </button>
                    ))}
                </div>

                <h2 className={styles.title}>신청 최대 인원을 설정해 주세요.</h2>
                <div className={styles.numberSection}>
                    <label className={styles.numberLabel}>
                        최소
                        <input
                            type="number"
                            min={1}
                            max={20}
                            step={1}
                            value={form.min || ''}
                            onChange={e => {
                                const value = Math.floor(Number(e.target.value));
                                if (value > 0) {
                                    handleChange('min', value);
                                }
                            }}
                            className={styles.numberInput}
                        />
                        명
                    </label>
                    <label className={styles.numberLabel}>
                        최대
                        <input
                            type="number"
                            min={form.min || 1}
                            max={20}
                            step={1}
                            value={form.max || ''}
                            onChange={e => {
                                const value = Math.floor(Number(e.target.value));
                                if (value > 0 && value >= (form.min || 1)) {
                                    handleChange('max', value);
                                }
                            }}
                            className={styles.numberInput}
                        />
                        명
                    </label>
                </div>
            </div>

            <button
                onClick={() => {
                    if (!isFormValid()) {
                        if (!form.partyName) {
                            setModalMessage('파티 이름을 입력해 주세요.');
                        } else if (!form.applyType) {
                            setModalMessage('신청 방식을 선택해 주세요.');
                        } else if (!form.gender) {
                            setModalMessage('참여 성별을 선택해 주세요.');
                        } else if (!form.age) {
                            setModalMessage('참여자의 나이를 설정해 주세요.');
                        } else if (!form.min || !form.max) {
                            setModalMessage('최소 및 최대 인원을 입력해 주세요.');
                        } else if (form.min >= form.max) {
                            setModalMessage('최소 인원은 최대 인원보다 클 수 없습니다.');
                        }
                        setModalOpen(true);
                    } else {
                        onNext();
                    }
                }}
                className={styles.nextButton}
            >
                다음
            </button>
        </div>
    );
};

export default PartyFormStep1;
