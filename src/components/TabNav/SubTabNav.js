// 디자인 통일을 위한 TabNav. 시뮬레이션 부분에서 사용
import React from "react";
import styles from "./SubTabNav.module.css";

const SubTabNav = ({ tabs = [], onTabChange, activeIndex = 0 }) => {
    const tabCount = tabs.length;
    const indicatorStyle = {
        width: `${100 / tabCount}%`,
        left: `${(100 / tabCount) * activeIndex}%`,
    };

    const handleTabClick = (index) => {
        if (onTabChange) {
            onTabChange(index);
        }
    };

    return (
        <div className={styles.tabNavContainer}>
            <div className={styles.tabWrapper} role="tablist" aria-orientation="horizontal">
                {tabs.map((label, index) => (
                    <div
                        key={index}
                        className={`${styles.tab} ${activeIndex === index ? styles.active : ""}`}
                        onClick={() => handleTabClick(index)}
                        role="tab"
                        id={`tab-${index}`}
                        aria-selected={activeIndex === index}
                        aria-controls={`tabpanel-${index}`}
                        tabIndex={activeIndex === index ? 0 : -1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleTabClick(index);
                            }
                        }}
                    >
                        {label}
                    </div>
                ))}
                <div className={styles.indicator} style={indicatorStyle}/>
            </div>
        </div>
    );
};

export default SubTabNav;
