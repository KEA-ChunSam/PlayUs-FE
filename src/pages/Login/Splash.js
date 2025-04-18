import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Splash.css';

function Splash() {
    const navigate = useNavigate();
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // 1.5초 후에 fade-out 클래스 적용
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, 1500);

        // 2초 후에 로그인 페이지로 이동
        const navigateTimer = setTimeout(() => {
            navigate('/login');
        }, 2000);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(navigateTimer);
        };
    }, [navigate]);

    return (
        <div className="mobile-view">
            <div className="splash">
                <img
                    src={`${process.env.PUBLIC_URL}/Logo/newLogo_small.png`}
                    alt="PlayUs 로고"
                    style={{ width: 200, height: 'auto' }}
                    className={fadeOut ? 'fade-out' : ''}
                />
            </div>
        </div>
    );
}

export default Splash;