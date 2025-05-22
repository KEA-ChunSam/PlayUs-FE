// 하단에 고정적으로 존재하는 주요 메뉴 이동 컴포넌트
import React, {useState} from "react";
import styles from "./NavBar.module.css";
import {Link} from "react-router-dom";
import "../FontAwesome";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { useAuth} from "../../utils/AuthContext";

const NavBar = () => {
    const [activeNav, setActiveNav] = useState(1);
    const { user } = useAuth() || {};
    const userId = user?.id;
    return (
        <nav className={styles.wrapper}>
            {/* 하단 네비게이션 최상위 태그 */}
            <Link to="/home" className={styles.nav_link} onClick={() => setActiveNav(1)}>
                <div>
                    <FontAwesomeIcon
                        icon="home"
                        className={`${styles.nav_item} ${activeNav === 1 ? styles.active : ''}`}
                    />
                </div>
            </Link>
            <Link to="/community" className={styles.nav_link} onClick={() => setActiveNav(2)}>
                <div>
                    <FontAwesomeIcon
                        icon="users-line"
                        className={`${styles.nav_item} ${activeNav === 2 ? styles.active : ''}`}
                    />
                </div>
            </Link>
            <Link to="/schedule" className={styles.nav_link} onClick={() => setActiveNav(3)}>
                <div>
                    <FontAwesomeIcon
                        icon="calendar-week"
                        className={`${styles.nav_item} ${activeNav === 3 ? styles.active : ''}`}
                    />
                </div>
            </Link>
            <Link
                to={userId ? `/profile/${userId}` : "#"}
                className={styles.nav_link}
                onClick={(e) => {
                    if (!userId) {
                        e.preventDefault();
                        console.warn("로그인 정보가 아직 로딩되지 않았습니다.");
                    } else {
                        setActiveNav(4);
                    }
                }}
            >
                <div>
                    <FontAwesomeIcon
                        icon="book"
                        className={`${styles.nav_item} ${activeNav === 4 ? styles.active : ''}`}
                    />
                </div>
            </Link>

        </nav>
    );
};

export default NavBar;