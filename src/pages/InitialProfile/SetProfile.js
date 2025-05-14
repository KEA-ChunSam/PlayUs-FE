// 프로필 설정 페이지
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import styles from './SetProfile.module.css';
import LoginHeader from "../../components/Header/LoginHeader/LoginHeader";
import Modal from "../../components/Modal/Modal";

const SetProfile = ({birthDate}) => {
    const [nickname, setNickname] = useState('');
    const [isValid, setIsValid] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const [birthYear, setBirthYear] = useState(birthDate?.slice(0, 4) || '');
    const [birthMonth, setBirthMonth] = useState(birthDate?.slice(5, 7) || '');
    const [birthDay, setBirthDay] = useState(birthDate?.slice(8, 10) || '');
    const [selectedTeam, setSelectedTeam] = useState(localStorage.getItem('selectedTeam') || '');

    const handleNicknameChange = (e) => {
        const value = e.target.value;
        setNickname(value);
        setIsValid(value.length <= 8 && /^[a-zA-Z0-9가-힣]*$/.test(value));
    };

    const handleSubmit = () => { // 임시 데이터 타입을 맞추기 위한 전송 코드
        if (!isValid || nickname === '') {
            setShowModal(true);
            return;
        }
        const payload = {
            nickname,
            // birthDate: `${birthYear}-${birthMonth}-${birthDay}`, 해당 데이터는 백엔드에서 자체 작성됨 -> 프로필 설정 시 필요한지에 대해 의견 수렴 필요
            favoriteTeam: selectedTeam,
        };
        console.log("회원가입 정보:", payload);
        navigate('/login-complete');
    };

    // const handleSubmit = async () => {
    //     if (!isValid || nickname === '') {
    //         setShowModal(true);
    //         return;
    //     }
    //
    //     const payload = {
    //         nickname,
    //         favoriteTeam: selectedTeam,
    //     };
    //
    //     try {
    //         const token = localStorage.getItem('Authorization');
    //         const response = await axios.post(
    //             `${process.env.REACT_APP_LOCAL_BACKEND_URI}/api/users`,
    //             payload,
    //             {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${token}`,
    //                 },
    //             }
    //         );
    //
    //         console.log("가입 성공:", response.data);
    //         navigate('/login-complete');
    //     } catch (error) {
    //         console.error("가입 실패:", error);
    //         setShowModal(true); // 에러 발생 시 모달로 안내
    //     }
    // };

    return (
        <div className={styles.container}>
            <LoginHeader style={{marginBottom: '-50px'}}/>
            <h1 className={styles.title}>사용하실 닉네임을 설정해 주세요.</h1>
            <p className={styles.subtitle}>
                (닉네임은 한글/영어/숫자 포함 최대 8글자까지 가능합니다.)
            </p>
            <input
                type="text"
                placeholder="닉네임은 8자 이내로 입력해 주세요."
                value={nickname}
                onChange={handleNicknameChange}
                className={`${styles.input} ${!isValid ? styles.invalid : ''}`}
            />
            {!isValid && <div className={styles.error}>닉네임이 유효하지 않습니다.</div>}

            <h2 className={styles.birthLabel}>생년월일을 입력해 주세요.</h2>
            <div className={styles.birthInputGroup}>
                <input
                    type="text"
                    placeholder="YYYY"
                    maxLength={4}
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, ''))}
                    className={styles.birthInput}
                    disabled
                />
                <span>/</span>
                <input
                    type="text"
                    placeholder="MM"
                    maxLength={2}
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value.replace(/\D/g, ''))}
                    className={styles.birthInput}
                    disabled
                />
                <span>/</span>
                <input
                    type="text"
                    placeholder="DD"
                    maxLength={2}
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value.replace(/\D/g, ''))}
                    className={styles.birthInput}
                    disabled
                />
            </div>

            <div className={styles.buttonGroup}>
                <button className={styles.backButton} onClick={() => navigate('/choice-team')}>이전으로</button>
                <button className={styles.submitButton} onClick={handleSubmit}>가입 완료하기!</button>
            </div>
            {showModal && (
                <Modal
                    title="알림"
                    message="유효한 닉네임을 입력해주세요."
                    buttons={[
                        {label: '취소', onClick: () => setShowModal(false)},
                        {label: '확인', onClick: () => {setShowModal(false)}
                        }
                    ]}
                />
            )}
        </div>
    );
};

export default SetProfile;