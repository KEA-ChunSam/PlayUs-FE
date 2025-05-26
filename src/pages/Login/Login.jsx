import React, { useState, useEffect } from 'react';
import styles from './Login.module.css';
import LoginHeader from '../../components/Header/LoginHeader/LoginHeader.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from '../../components/Modal/Modal';

function Login() {
  const [showModal, setShowModal] = useState(false);
  const [withdrawnNickname, setWithdrawnNickname] = useState('');
  const [showDevTools, setShowDevTools] = useState(false);
  const [devToken, setDevToken] = useState('');
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

  // 개발용 토큰 주입 기능
  const handleDevTokenSubmit = () => {
    if (!devToken.trim()) return;
    
    // 쿠키에 토큰 설정
    document.cookie = `accessToken=${devToken}; path=/; domain=localhost`;
    
    // 로컬스토리지에도 저장 (필요시)
    localStorage.setItem('accessToken', devToken);
    
    console.log('✅ 개발용 토큰이 설정되었습니다.');
    alert('토큰이 설정되었습니다. 페이지를 새로고침합니다.');
    
    // 메인 페이지로 이동
    navigate('/home');
  };

  return (
    <div className={styles.login_container}>
      <LoginHeader />
      <div className={styles.login_container_contents}>
        <div className={styles.login_text} style={{ textAlign: 'center' }}>
          <h2 className={styles.login_title}>플레이어스에 오신 걸 환영해요!</h2>
          <p className={styles.login_subtitle}>춘삼이와 함께 새로운 여정을 시작해 볼까요?</p>
        </div>

        <a
          href={`${import.meta.env.VITE_LOCAL_BACKEND_URI}/oauth2/authorization/kakao`}
          className={`${styles.login_button} ${styles.kakao_button}`}
        >
          <img
            src="/Logo/KaKao_logo.png"
            alt="Kakao Icon"
            style={{ marginRight: '8px', width: '23px', height: '21px' }}
          />
          <span>카카오로 시작하기</span>
        </a>

        <a
          href={`${import.meta.env.VITE_LOCAL_BACKEND_URI}/oauth2/authorization/naver`}
          className={`${styles.login_button} ${styles.naver_button}`}
        >
          <img
            src="/Logo/Naver_logo.png"
            alt="Naver Icon"
            style={{ marginRight: '8px', width: '17px', height: '17px' }}
          />
          <span>네이버로 시작하기</span>
        </a>

        {/* 개발 환경에서만 표시되는 토큰 주입 기능 */}
        {import.meta.env.DEV && (
          <div style={{ marginTop: '20px', padding: '10px', border: '1px dashed #ccc', borderRadius: '5px' }}>
            <button 
              onClick={() => setShowDevTools(!showDevTools)}
              style={{ 
                background: '#f0f0f0', 
                border: '1px solid #ccc', 
                padding: '5px 10px', 
                borderRadius: '3px',
                fontSize: '12px'
              }}
            >
              🔧 개발자 도구 {showDevTools ? '숨기기' : '보기'}
            </button>
            
            {showDevTools && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
                  개발용 JWT 토큰 주입:
                </p>
                <textarea
                  value={devToken}
                  onChange={(e) => setDevToken(e.target.value)}
                  placeholder="JWT 토큰을 여기에 붙여넣으세요..."
                  style={{
                    width: '100%',
                    height: '60px',
                    fontSize: '10px',
                    padding: '5px',
                    border: '1px solid #ccc',
                    borderRadius: '3px',
                    resize: 'vertical'
                  }}
                />
                <button
                  onClick={handleDevTokenSubmit}
                  style={{
                    marginTop: '5px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '3px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  토큰 설정하기
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title="계정 상태"
          message={`${withdrawnNickname}님은 현재 회원 탈퇴 상태입니다.\n계정을 복구하시겠어요?`}
          buttons={[
            { label: '취소', onClick: () => navigate('/') },
            { label: '확인', onClick: () => setShowModal(false) },
          ]}
        />
      )}
    </div>
  );
}

export default Login;
