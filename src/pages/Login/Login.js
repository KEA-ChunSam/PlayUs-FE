// Splash 직후의 로그인 페이지
import React, {useState, useEffect} from 'react';
import styles from './Login.module.css';
import LoginHeader from "../../components/Header/LoginHeader/LoginHeader";
import {useNavigate, useLocation} from "react-router-dom";
import Modal from "../../components/Modal/Modal";

function Login() {
    const [showModal, setShowModal] = useState(false);
    const [withdrawnNickname, setWithdrawnNickname] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const isWithdrawn = params.get('error') === 'withdrawn';
        const nickname = params.get('nickname');
        if (isWithdrawn && nickname) {
            setWithdrawnNickname(nickname);
            setShowModal(true);
        }
    }, [location.search]);

    const handleKakaoLogin = () => {
        console.log('카카오로 시작하기 클릭됨');
    };

    const handleNaverLogin = () => {
        console.log('네이버로 시작하기 클릭됨');
    };

    return (
        <div className={styles.login_container}>
            <LoginHeader/>
            <div className={styles.login_container_contents}>
                <div className={styles.login_text} style={{textAlign: 'center'}}>
                    <h2 className={styles.login_title}>플레이어스에 오신 걸 환영해요!</h2>
                    <p className={styles.login_subtitle}>춘삼이와 함께 새로운 여정을 시작해 볼까요?</p>
                </div>

                <a
                    href={`${process.env.REACT_APP_LOCAL_BACKEND_URI}/oauth2/authorization/kakao`}
                    className={`${styles.login_button} ${styles.kakao_button}`}
                >
                    <img
                        src={`${process.env.PUBLIC_URL}/Logo/KaKao_logo.png`}
                        alt="Kakao Icon"
                        style={{marginRight: '8px', width: '23px', height: '21px'}}
                    />
                    <span>카카오로 시작하기</span>
                </a>

                <a 
                    href={`${process.env.REACT_APP_LOCAL_BACKEND_URI}/oauth2/authorization/naver`}
                    className={`${styles.login_button} ${styles.naver_button}`}
                >
                    <img
                        src={`${process.env.PUBLIC_URL}/Logo/Naver_logo.png`}
                        alt="Naver Icon"
                        style={{marginRight: '8px', width: '17px', height: '17px'}}
                    />
                    <span>네이버로 시작하기</span>
                </a>
            </div>
            {showModal && (
                <Modal
                    title="계정 상태"
                    message={`${withdrawnNickname}님은 현재 회원 탈퇴 상태입니다.\n계정을 복구하시겠어요?`}
                    buttons={[
                        { label: "취소", onClick: () => navigate("/") },
                        { label: "확인", onClick: () => setShowModal(false) }
                    ]}
                />
            )}
        </div>
    );
}

export default Login;
