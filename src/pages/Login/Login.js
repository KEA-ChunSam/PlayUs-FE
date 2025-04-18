import React from 'react';
import './Login.css'; // 스타일 분리 시, 사용 (선택사항)

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
        <div className="login-container">
            {/* Header container with image and text side by side */}
            <div className="login-header">
                <img
                    src={`${process.env.PUBLIC_URL}/Logo/NewLogo_small.png`}
                    alt="PlayUs 로고"
                    className="login-logo"
                    style={{ marginRight: '16px' }}
                />
                <div className="login-text" style={{ textAlign: 'center' }}>
                    <h2 className="login-title">플레이어스에 오신 걸 환영해요!</h2>
                    <p className="login-subtitle">춘삼이와 함께 새로운 여정을 시작해 볼까요?</p>
                </div>
            </div>

            {/* Login links/buttons */}
            <a href="/kakao-login" className="login-button kakao-button">
                <img
                    src={`${process.env.PUBLIC_URL}/Logo/KaKao_logo.png`}
                    alt="Kakao Icon"
                    style={{ marginRight: '8px', width: '23px', height: '21px' }}
                />
                <span>카카오로 시작하기</span>
            </a>

            <a href="/naver-login" className="login-button naver-button">
                <img
                    src={`${process.env.PUBLIC_URL}/Logo/Naver_logo.png`}
                    alt="Naver Icon"
                    style={{ marginRight: '8px', width: '17px', height: '17px' }}
                />
                <span>네이버로 시작하기</span>
            </a>
        </div>
    );
}

export default Login;
