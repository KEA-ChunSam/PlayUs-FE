import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./TabNav.module.css";

const TabNav = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const handleTabClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className={styles.tabNavContainer}>
    <img
      src={`${process.env.PUBLIC_URL}/Button/back.png`}
      alt="Back"
      className={styles.backIcon}
      onClick={() => navigate("/party")}
    />
  
    <div className={styles.tabWrapper}>
      {["직관팟 구하기", "내 신청 현황", "승인 요청"].map((label, index) => (
        <div
          key={index}
          className={`${styles.tab} ${activeIndex === index ? styles.active : ""}`}
          onClick={() => handleTabClick(index)}
        >
          {label}
        </div>
      ))}
      <div
        className={styles.indicator}
        style={{ left: `${activeIndex * 33.3333}%` }}
      />
    </div>
  </div>
  );
};

export default TabNav;
