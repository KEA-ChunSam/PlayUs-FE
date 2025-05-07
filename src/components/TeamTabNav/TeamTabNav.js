import styles from "./TeamTabNav.module.css";

const TeamTabNav = ({ tabs, activeIndex, onTabClick, onPlusClick }) => {
  return (
    <div className={styles.tabNavContainer}>
      <div className={styles.tabBarRow}>
  <div className={styles.tabWrapper}>
    {tabs.map((label, index) => (
      <div
        key={index}
        className={`${styles.tab} ${activeIndex === index ? styles.active : ""}`}
        onClick={() => onTabClick(index)}
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
  />
</div>
      <div
        className={styles.indicator}
        style={{
          width: `${100 / tabs.length}%`,
          left: `${activeIndex * (100 / tabs.length)}%`,
        }}
      />
    </div>
  );
};

export default TeamTabNav;