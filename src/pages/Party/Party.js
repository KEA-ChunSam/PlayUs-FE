import React from 'react';
import GameCard from "./GameCard";
import ScheduleSlider from "../../components/ScheduleSlider/ScheduleSlider";
import styles from './Party.module.css';

const Party = () => {
  return (
    <div className={styles.wrapper}>
      <ScheduleSlider/>
      {/*<div className={styles.headerSpacer} />*/}
      <div className={styles.content}>
        <GameCard
          homeTeam="키움"
          awayTeam="KT"
          stadium="고척"
          mainTime="18:30"
          homeLogo="/Logo/TeamLogo/emblem_WO.png"
          awayLogo="/Logo/TeamLogo/emblem_KT.png"
        />
        <GameCard
          homeTeam="키움"
          awayTeam="KT"
          stadium="고척"
          mainTime="18:30"
          homeLogo="/Logo/TeamLogo/emblem_WO.png"
          awayLogo="/Logo/TeamLogo/emblem_KT.png"
        />
        <GameCard
          homeTeam="키움"
          awayTeam="KT"
          stadium="고척"
          mainTime="18:30"
          homeLogo="/Logo/TeamLogo/emblem_WO.png"
          awayLogo="/Logo/TeamLogo/emblem_KT.png"
        />
        <GameCard
          homeTeam="키움"
          awayTeam="KT"
          stadium="고척"
          mainTime="18:30"
          homeLogo="/Logo/TeamLogo/emblem_WO.png"
          awayLogo="/Logo/TeamLogo/emblem_KT.png"
        />
        <GameCard
          homeTeam="키움"
          awayTeam="KT"
          stadium="고척"
          mainTime="18:30"
          homeLogo="/Logo/TeamLogo/emblem_WO.png"
          awayLogo="/Logo/TeamLogo/emblem_KT.png"
        />
      </div>
    </div>
  );
};

export default Party;
