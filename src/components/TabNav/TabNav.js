import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TabNav.module.css";

const TabNav = ({ tabs = [], onTabChange, onBack }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const handleTabClick = (index) => {
    setActiveIndex(index);
    if (onTabChange) {
      onTabChange(index);
    }
  };

  const tabCount = tabs.length;
  const indicatorStyle = {
    width: `${100 / tabCount}%`,
    left: `${(100 / tabCount) * activeIndex}%`,
  };

  return (
    <div className={styles.tabNavContainer}>
      <img
        src={`${process.env.PUBLIC_URL}/Button/back.png`}
        alt="Back"
        className={styles.backIcon}
        onClick={() => onBack ? onBack() : navigate("/schedule")} // 나중에 컴포넌트화하여 적용
      />

      <div className={styles.tabWrapper}>
        {tabs.map((label, index) => (
          <div
            key={index}
            className={`${styles.tab} ${activeIndex === index ? styles.active : ""}`}
            onClick={() => handleTabClick(index)}
          >
            {label}
          </div>
        ))}
        <div className={styles.indicator} style={indicatorStyle} />
      </div>
    </div>
  );
};

export default TabNav;
