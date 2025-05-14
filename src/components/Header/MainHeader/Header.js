import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { useSearch } from "../../../pages/Community/SearchContext";

const Header = () => {
    const { inputValue, setInputValue, setKeyword } = useSearch();
    const navigate = useNavigate();

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && inputValue.trim() !== "") {
            setKeyword(inputValue); // 엔터키를 눌렀을 때만 실제 검색어 설정
            navigate("/search");
        }
    };

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
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
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