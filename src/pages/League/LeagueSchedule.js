import React from 'react';
import styles from "../Main/MainPage.module.css";
import ScheduleSlider from "../../components/ScheduleSlider/ScheduleSlider";

const LeagueSchedule = () => {
  return (
    <div className={styles.schedule_page}>
      <ScheduleSlider/>
        <section className={styles.section}>
            <h2>NC 다이노스</h2>
            <div className={styles.today_game}>
                <span>03.13(화)</span>
                <span>LG vs 두산 10 : 5</span>
            </div>
        </section>
        <section className={styles.section}>
          <div className={styles.game_row}>
            <div className={styles.time_and_status}>
              <span className={styles.time}>13:00</span>
              <span className={styles.badge}>예정</span>
            </div>
            <div className={styles.teams}>
              <div className={styles.team}>
                <img src="/Logo/TeamLogo/emblem_LT.png" alt="롯데" className={styles.logo} />
                <span>롯데</span>
              </div>
              <div className={styles.team}>
                <img src="/Logo/TeamLogo/emblem_WO.png" alt="키움" className={styles.logo} />
                <span>키움</span>
                <span className={styles.home_badge}>홈</span>
              </div>
            </div>
            <div className={styles.info}>
              <span className={styles.time_detail}>18:30</span>
              <span className={styles.stadium}>고척</span>
            </div>
            <div className={styles.actions}>
              <button className={styles.action_btn}>직관팟</button>
              <button className={styles.action_btn}>정보</button>
            </div>
          </div>
        </section>
        <section className={styles.section}>
            <div className={styles.today_game}>
                <h2>NC 다이노스</h2>
            </div>
            <div className={styles.today_game}>
                <span>03.13(화)</span>
                <span>LG vs 두산 10 : 5</span>
            </div>
        </section>

    </div>
  );
};

export default LeagueSchedule;
