import styles from "./ScheduleSection.module.css";

export default function ScheduleSection({ schedule }) {
  const { home, away, status, score } = schedule;

  return (
    <section className={styles.section}>
    <div className={styles.card}>
      <div className={styles.dateRow}>
        <button>{'<'}</button>
        <span className={styles.dateText}>05.02 (목)</span>
        <button>{'>'}</button>
      </div>
      <div className={styles.matchCard}>
        {/* Away 팀 */}
        <div className={styles.teamColumn}>
          <div className={styles.name}>{away}</div>
          <div className={styles.player}>오승환</div>
        </div>
        <img src="/Logo/TeamLogo/emblem_SS.png" alt="삼성" className={styles.logo} />
        <div className={styles.score}>{score[1]}</div>

        <div className={styles.status}>{status}</div>

        <div className={styles.score}>{score[0]}</div>
        <img src="/Logo/TeamLogo/emblem_LG.png" alt="LG" className={styles.logo} />
        <div className={styles.teamColumn}>
          <div className={styles.name}>{home}</div>
          <div className={styles.player}>우강훈</div>
        </div>
      </div>
      </div>
    </section>
  );
}