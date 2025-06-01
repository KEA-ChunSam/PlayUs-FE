// 경기 일정 메뉴 페이지
import React, {useState} from 'react';
import GameCard from '../../components/GameCard/GameCard';
import ScheduleSlider from "../../components/League/ScheduleSlider/ScheduleSlider";
import styles from './Schedule.module.css';
import CasterbotModal from "../Chatbot/CasterbotModal";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";

import { teamInfoMap} from "../../utils/teamInfoMap";

const Schedule = () => {
    const getTeamLogoByName = (teamName) => {
        const team = teamInfoMap.find(item => item.name === teamName);
        return team ? team.logo : `${process.env.PUBLIC_URL}/Logo/TeamLogo/default.png`;
    };
    const [showCasterbot, setShowCasterbot] = useState(false);
    const [matches, setMatches] = useState([]);

    return (
        <>
            <div className={styles.wrapper}>
                <ScheduleSlider onDateSelect={setMatches}/>
                {/*<div className={styles.headerSpacer} />*/}
                <div className={styles.content}>
                    {matches.length === 0 ? (
                        <p>오늘은 경기가 없어요!</p>
                    ) : (
                        matches.map((match) => (
                            <GameCard
                                key={match.match_id}
                                homeTeam={match.home_team_name}
                                awayTeam={match.away_team_name}
                                stadium={match.stadium}
                                mainTime={new Date(match.game_date_time).toLocaleTimeString('ko-KR', {
                                    timeZone: 'Asia/Seoul',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                                homeLogo={getTeamLogoByName(match.home_team_name)}
                                awayLogo={getTeamLogoByName(match.away_team_name)}
                                homeTeamScore={match.home_team_score}
                                awayTeamScore={match.away_team_score}
                                statusCode={match.status_code}
                            />
                        ))
                    )}
                </div>
            </div>
            <CasterbotButton onClick={() => setShowCasterbot(true)}/>

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
        </>
    );
};

export default Schedule;
