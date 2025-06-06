import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GameCard from '../../components/GameCard/GameCard';
import ScheduleSlider from "../../components/League/ScheduleSlider/ScheduleSlider";
import styles from './Schedule.module.css';
import CasterbotModal from "../Chatbot/CasterbotModal";
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import { teamInfoMap } from "../../utils/teamInfoMap";

const getTeamLogoByName = (teamName) => {
    const team = teamInfoMap.find(item => item.name === teamName);
    return team ? team.logo : `${process.env.PUBLIC_URL}/Logo/TeamLogo/default.png`;
};

export default function Schedule() {
    const [showCasterbot, setShowCasterbot] = useState(false);
    const [matches, setMatches] = useState([]);

    // Fetch matches for a given date string "YYYY-MM-DD"
    const fetchMatches = async (date) => {
        try {
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('Access='))
                ?.split('=')[1];
            const response = await axios.get(
                `${process.env.REACT_APP_AI_API_BASE}/matches`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                    params: { date: formattedDate }
                }
            );
            setMatches(response.data);
        } catch (error) {
            console.error('오늘 경기 정보 조회 실패:', error);
        }
    };

    // On mount, fetch today's matches
    useEffect(() => {
        fetchMatches(new Date());
    }, []);

    return (
        <>
            <div className={styles.wrapper}>
                <ScheduleSlider onDateSelect={setMatches} />
                <div className={styles.content}>
                    {matches.length === 0 ? (
                        <p>오늘은 경기가 없어요!</p>
                    ) : (
                        matches.map((match) => (
                            <GameCard
                                key={match.match_id}
                                gameId={match.game_id}
                                matchId={match.match_id}
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
            <CasterbotButton onClick={() => setShowCasterbot(true)} />

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)} />
            )}
        </>
    );
}
