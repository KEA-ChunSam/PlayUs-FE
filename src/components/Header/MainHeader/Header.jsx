import React, { useState } from "react";
import NotificationModal from "../../Modal/NotificationModal/NotificationModal";
import {useNavigate} from "react-router-dom";
import styles from "./Header.module.css";
import {useSearch} from "../../SearchContext";

const Header = () => {
    const {inputValue, setInputValue, setKeyword} = useSearch();
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && inputValue.trim() !== "") {
            setKeyword(inputValue); // 엔터키를 눌렀을 때만 실제 검색어 설정
            navigate("/search");
        }
    };

    function alwaysHome() {
        navigate("/home")
    }

    return (
        <header className={styles.mobile_header}>
            <div className={styles.header_left}>
                <img
                    className={styles.main_logo}
                    src="/Logo/NewLogo_small.png"
                    alt="Logo"
                    onClick={alwaysHome}
                />
            </div>
            <div className={styles.header_center}>
                <input
                    type="text"
                    className={styles.header_search_input}
                    placeholder="검색어 입력..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <div className={`${styles.header_right} ${styles.header_right_absolute}`}>
                <button>
                    {/* 관리자 기능은 현재 Non-MVP이므로 미구현 */}
                    <img
                        src="/Button/admin.png"
                        alt="관리자"
                        className={styles.noti_alert}
                    />
                </button>
                <button onClick={() => setShowModal(!showModal)}>
                    <img
                        src="/Button/alert.png"
                        alt="알림"
                        className={styles.noti_alert}
                    />
                </button>
                {showModal && <NotificationModal onClose={() => setShowModal(false)} />}
            </div>
        </header>
    );
};

export default Header;