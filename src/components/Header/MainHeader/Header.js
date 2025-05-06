// 공통 헤더 컴포넌트
import React from "react";
import styles from "./Header.module.css";
import {useNavigate} from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();

    function alwaysHome() {
        navigate("/home")
    }

    return (
        <header className={styles.mobile_header}>
            <div className={styles.header_left}>
                <img
                    className={styles.main_logo}
                    src={`${process.env.PUBLIC_URL}/Logo/NewLogo_small.png`}
                    alt="Logo"
                    onClick={alwaysHome}
                />
            </div>
            <div className={styles.header_center}>
                <input
                    type="text"
                    className={styles.header_search_input}
                    placeholder="검색어 입력..."
                />
            </div>
            <div className={styles.header_right}>
                <button>
                    <img
                        src={`${process.env.PUBLIC_URL}/Button/admin.png`}
                        alt="알림"
                        className={styles.noti_alert}
                    />
                </button>
                <button>
                    <img
                        src={`${process.env.PUBLIC_URL}/Button/alert.png`}
                        alt="알림"
                        className={styles.noti_alert}
                    />
                </button>
            </div>
        </header>
    );
};

export default Header;