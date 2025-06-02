// 하단에 고정적으로 존재하는 주요 메뉴 이동 컴포넌트
import React, {useState, useEffect} from "react";
import PropTypes from 'prop-types';
import styles from "./NavBar.module.css";
import {Link, useNavigate} from "react-router-dom";
import "../FontAwesome";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faHome, faUsersLine, faCalendarWeek, faBook } from '@fortawesome/free-solid-svg-icons';
import { useAuth} from "../../utils/AuthContext";
import { teamInfoMapCommunity } from "../../utils/teamInfoMap";

const NavBar = () => {
    const [activeNav, setActiveNav] = useState(1);
    const { user } = useAuth() || {};
    const userId = user?.id;
    const navigate = useNavigate();

    const handleCommunityClick = (e) => {
        e.preventDefault();
        const preferredTeam = user?.preferredTeam;
        const team = preferredTeam || 'KIA_TIGERS';
        navigate(`/community/post/${team}`);
        setActiveNav(2);
    };

    return (
        <nav className={styles.wrapper} role="navigation" aria-label="메인 네비게이션">
            {/* 하단 네비게이션 최상위 태그 */}
            <Link to="/home" className={styles.nav_link} onClick={() => setActiveNav(1)} aria-label="홈으로 이동">
                <div>
                    <FontAwesomeIcon
                        icon={faHome}
                        className={`${styles.nav_item} ${activeNav === 1 ? styles.active : ''}`}
                    />
                </div>
            </Link>
            <button 
                type="button" 
                className={styles.nav_link} 
                onClick={handleCommunityClick}
                aria-label="커뮤니티로 이동"
            >
                <div>
                    <FontAwesomeIcon
                        icon={faUsersLine}
                        className={`${styles.nav_item} ${activeNav === 2 ? styles.active : ''}`}
                    />
                </div>
            </button>
            <Link to="/schedule" className={styles.nav_link} onClick={() => setActiveNav(3)} aria-label="일정으로 이동">
                <div>
                    <FontAwesomeIcon
                        icon={faCalendarWeek}
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
                aria-label="프로필로 이동"
            >
                <div>
                    <FontAwesomeIcon
                        icon={faBook}
                        className={`${styles.nav_item} ${activeNav === 4 ? styles.active : ''}`}
                    />
                </div>
            </Link>
        </nav>
    );
};

NavBar.propTypes = {
    // 현재 NavBar 컴포넌트는 props를 받지 않으므로 비워둡니다.
    // 향후 props가 추가되면 여기에 타입 정의를 추가할 수 있습니다.
};

export default NavBar;