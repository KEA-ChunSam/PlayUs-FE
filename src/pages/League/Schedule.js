// 경기 일정 메뉴 페이지
import React, {useState} from 'react';
import GameCard from '../../components/GameCard/GameCard';
import ScheduleSlider from "../../components/League/ScheduleSlider/ScheduleSlider";
import styles from './Schedule.module.css';
import CasterbotModal from "../Chatbot/CasterbotModal";

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
                        homeLogo={`${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_WO.png`}
                        awayLogo={`${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_KT.png`}
                    />
                    <GameCard
                        homeTeam="키움"
                        awayTeam="KT"
                        stadium="고척"
                        mainTime="18:30"
                        homeLogo={`${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_WO.png`}
                        awayLogo={`${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_KT.png`}
                    />
                    <GameCard
                        homeTeam="키움"
                        awayTeam="KT"
                        stadium="고척"
                        mainTime="18:30"
                        homeLogo={`${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_WO.png`}
                        awayLogo={`${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_KT.png`}
                    />
                    <GameCard
                        homeTeam="키움"
                        awayTeam="KT"
                        stadium="고척"
                        mainTime="18:30"
                        homeLogo={`${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_WO.png`}
                        awayLogo={`${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_KT.png`}
                    />
                    <GameCard
                        homeTeam="키움"
                        awayTeam="KT"
                        stadium="고척"
                        mainTime="18:30"
                        homeLogo={`${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_WO.png`}
                        awayLogo={`${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_KT.png`}
                    />
                </div>
            </div>
            <button
                onClick={() => setShowCasterbot(true)}
                className={styles.casterbotButton}
            >
                <img
                    src={`${process.env.PUBLIC_URL}/Button/casterbot.png`}
                    alt="캐스터봇"
                />
            </button>

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
        </>
    );
};

export default Schedule;
