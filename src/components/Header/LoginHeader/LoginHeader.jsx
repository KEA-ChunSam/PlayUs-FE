// 최초 서비스 진입 시 나타나는 로그인 + 회원가입 로고 부분 헤더.
import React from "react";
import styles from './LoginHeader.module.css';

const LoginHeader = () => {
    return (
        <div className={styles.login_header}>
            <img
                src="/Logo/NewLogo_small.png"
                alt="PlayUs 로고"
                className={styles.login_logo}
                style={{ marginRight: '16px' }}
            />
        </div>
    );
};

export default LoginHeader;
