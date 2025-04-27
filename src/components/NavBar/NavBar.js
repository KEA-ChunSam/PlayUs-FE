import React, { useState } from "react";
import styles from "./NavBar.module.css";
import { Link } from "react-router-dom";
import "../FontAwesome";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const NavBar = () => {
  const [activeNav, setActiveNav] = useState(1);
  return (
    <nav className={styles.wrapper}>
      {/* 하단 네비게이션 최상위 태그 */}
      <Link to="/mainpage" className={styles.nav_link} onClick={() => setActiveNav(1)}>
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
      <Link to="/party" className={styles.nav_link} onClick={() => setActiveNav(3)}>
        <div>
          <FontAwesomeIcon
            icon="calendar-week"
            className={`${styles.nav_item} ${activeNav === 3 ? styles.active : ''}`}
          />
        </div>
      </Link>
      <Link to="/profile" className={styles.nav_link} onClick={() => setActiveNav(4)}>
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