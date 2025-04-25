import React from 'react';
import styles from './Login.module.css';
import LoginHeader from "../../components/Header/LoginHeader/LoginHeader"; // 스타일 분리 시, 사용 (선택사항)

function Login() {
    const handleKakaoLogin = () => {
        // 카카오 로그인 로직 (예: OAuth, API 연동)
        console.log('카카오로 시작하기 클릭됨');
    };

    const handleNaverLogin = () => {
        // 네이버 로그인 로직 (예: OAuth, API 연동)
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

                {/* 링크 나중에 수정 */}
                <a href="/choice-team" className={`${styles.login_button} ${styles.kakao_button}`}>
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

        </div>
    );
}

export default Login;
