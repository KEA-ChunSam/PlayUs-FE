// 경기 일정 메뉴 페이지
import React, {useState} from 'react';
import GameCard from '../../components/GameCard/GameCard';
import ScheduleSlider from "../../components/League/ScheduleSlider/ScheduleSlider";
import styles from './Schedule.module.css';
import CasterbotModal from "../Chatbot/CasterbotModal";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";

const Schedule = () => {
    const [showCasterbot, setShowCasterbot] = useState(false);

    return (
        <>
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
            <CasterbotButton onClick={() => setShowCasterbot(true)} />

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
        </>
    );
};

export default Schedule;
