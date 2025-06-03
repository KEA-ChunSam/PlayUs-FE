import styles from "./ScheduleSection.module.css";

const teamLogoMap = {
  "NC": "emblem_NC.png",
  "삼성": "emblem_SS.png",
  "두산": "emblem_OB.png",
  "한화": "emblem_HH.png",
  "KIA": "emblem_HT.png",
  "KT": "emblem_KT.png",
  "롯데": "emblem_LT.png",
  "LG": "emblem_LG.png",
  "SSG": "emblem_SK.png",
  "키움": "emblem_WO.png"
};

export default function ScheduleSection({ schedule }) {
  const { home, away, status, score } = schedule;

  return (
    <section className={styles.section}>
    <div className={styles.card}>
      <div className={styles.dateRow}>
        <button>{'<'}</button>
        <span className={styles.dateText}>05.02 (목)</span>{/* TODO: 이후 match api 연결시 적용예정 */}
        <button>{'>'}</button>
      </div>
      <div className={styles.matchCard}>
        {/* Away 팀 */}
        <div className={styles.teamColumn}>
          <div className={styles.name}>{away}</div>
          {/*<div className={styles.player}>오승환</div>*/}
        </div>
        <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo/${teamLogoMap[away] || 'emblem_default.png'}`} alt={away} className={styles.logo} />
        <div className={styles.score}>{score[0]}</div>

        <div className={styles.status}>{status}</div>

        <div className={styles.score}>{score[1]}</div>
        <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo/${teamLogoMap[home] || 'emblem_default.png'}`} alt={home} className={styles.logo} />
        <div className={styles.teamColumn}>
          <div className={styles.name}>{home}</div>
          {/*<div className={styles.player}>우강훈</div>*/}
        </div>
      </div>
      </div>
    </section>
  );
}