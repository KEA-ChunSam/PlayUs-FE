import React from "react";
import {useNavigate} from 'react-router-dom';
import styles from './GameCard.module.css';

const GameCard = ({
  time,
  homeTeam,
  awayTeam,
  stadium,
  mainTime,
  homeLogo,
  awayLogo,
}) => {
  const navigate = useNavigate();
  const handlePartyClick = () => {
    navigate('/party/matchid');
  };
  const handleInfoClick = () => {
    navigate('/schedule/matchid');
  };

  return (
    <div className={styles.card}>
      <div className={styles.timeBlock}>
        <span className={styles.time}>{time}</span>
        <div className={styles.teamRow}>
          <img src={awayLogo} alt={awayTeam} className={styles.logo} />
          <span className={styles.teamName}>{awayTeam}</span>
        </div>
        <div className={styles.teamRow}>
          <img src={homeLogo} alt={homeTeam} className={styles.logo} />
          <span className={styles.teamName}>{homeTeam}</span>
        </div>
      </div>

      <div className={styles.infoBlock}>
        <span className={styles.mainTime}>{mainTime}</span>
        <span className={styles.stadium}>{stadium}</span>
      </div>

      <div className={styles.buttonBlock}>
        <button onClick={handlePartyClick} className={styles.button}>
          직관팟
        </button>
        <button onClick={handleInfoClick} className={styles.button}>
          정보
        </button>
      </div>
    </div>
  );
};

export default GameCard;