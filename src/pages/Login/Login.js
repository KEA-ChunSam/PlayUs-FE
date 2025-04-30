import React, {useState} from 'react';
import styles from './Login.module.css';
import LoginHeader from "../../components/Header/LoginHeader/LoginHeader";
import Modal from "../../components/Modal/Modal";
import {useNavigate} from "react-router-dom";

function Login() {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    // 차후 회원 DB 적용시 모달 구현 예정
    // const onButtonClick = () => {
    //     if (!selectedTeam) {
    //         setShowModal(true);
    //         return;
    //     }
    //     navigate("/choice-team");
    // }

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
                <div className={styles.login_text} style={{ textAlign: 'center' }}>
                    <h2 className={styles.login_title}>플레이어스에 오신 걸 환영해요!</h2>
                    <p className={styles.login_subtitle}>춘삼이와 함께 새로운 여정을 시작해 볼까요?</p>
                </div>

                <a
                    href="https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=e293c26c0c0476eb1377b380a3b0230d&redirect_uri=http://localhost:3000/auth/kakao/callback"
                    className={`${styles.login_button} ${styles.kakao_button}`}
                >
                    <img
                        src={`${process.env.PUBLIC_URL}/Logo/KaKao_logo.png`}
                        alt="Kakao Icon"
                        style={{ marginRight: '8px', width: '23px', height: '21px' }}
                    />
                    <span>카카오로 시작하기</span>
                </a>

                <a href="/naver-login" className={`${styles.login_button} ${styles.naver_button}`}>
                    <img
                        src={`${process.env.PUBLIC_URL}/Logo/Naver_logo.png`}
                        alt="Naver Icon"
                        style={{ marginRight: '8px', width: '17px', height: '17px' }}
                    />
                    <span>네이버로 시작하기</span>
                </a>
            </div>
            {/*{showModal && (*/}
            {/*    <Modal*/}
            {/*        title="제재 안내"*/}
            {/*        message={`${userName} 회원님께서는 타 사용자에게 '불쾌감을 주는 언행'으로 ${endDate}까지 해당 서비스를 이용하실 수 없습니다.`}*/}
            {/*        onClose={() => setShowModal(false)}*/}
            {/*    />*/}
            {/*)}*/}

        </div>
    );
}

export default Login;
