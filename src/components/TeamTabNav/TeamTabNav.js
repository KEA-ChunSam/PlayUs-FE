import styles from "./TeamTabNav.module.css";

const TeamTabNav = ({ tabs, activeIndex, onTabClick, onPlusClick }) => {
  return (
    <div className={styles.tabNavContainer}>
      <div className={styles.tabBarRow}>
        <div className={styles.tabWrapper} role="tablist" aria-orientation="horizontal">
          {tabs.map((label, index) => (
            <div
              key={index}
              className={`${styles.tab} ${activeIndex === index ? styles.active : ""}`}
              onClick={() => onTabClick(index)}
              role="tab"
              id={`team-tab-${index}`}
              aria-selected={activeIndex === index}
              aria-controls={`team-tabpanel-${index}`}
              tabIndex={activeIndex === index ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onTabClick(index);
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault();
                  const prevIndex = (index - 1 + tabs.length) % tabs.length;
                  onTabClick(prevIndex);
                } else if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  const nextIndex = (index + 1) % tabs.length;
                  onTabClick(nextIndex);
                }
              }}
            >
              {label}
            </div>
          ))}
          <div
            className={styles.indicator}
            style={{
              width: `${100 / tabs.length}%`,
              left: `${activeIndex * (100 / tabs.length)}%`,
            }}
          />
        </div>

        <img
          src={`${process.env.PUBLIC_URL}/Button/plus.png`}
          alt="추가"
          className={styles.plusIcon}
          onClick={onPlusClick}
          tabIndex="0"
          role="button"
          aria-label="새 항목 추가"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onPlusClick();
            }
          }}
        />
      </div>
    </div>
  );
};

export default TeamTabNav;