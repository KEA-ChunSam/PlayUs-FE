// 일정 메뉴의 각 경기별 정보 컴포넌트
import React from "react";
import {useNavigate} from 'react-router-dom';
import styles from './GameCard.module.css';
import PropTypes from 'prop-types';

const GameCard = ({
                      matchId,
                      time,
                      homeTeam,
                      awayTeam,
                      stadium,
                      mainTime,
                      homeLogo,
                      awayLogo,
                      homeTeamScore,
                      awayTeamScore,
                      statusCode,
                      gameId
                  }) => {
    const navigate = useNavigate();
    const handlePartyClick = () => {
        navigate(`/party/${gameId}`, {
            state: {
                homeTeam,
                awayTeam,
                stadium,
                mainTime,
            },
        });
    };
    const handleInfoClick = () => {
        navigate(`/schedule/${gameId}`, {
            state: {
                homeTeam,
                awayTeam,
                stadium,
                mainTime,
            },
        });
    };

    return (
        <div className={styles.card}>
            <div className={styles.timeBlock}>
                <span className={styles.time}>{time}</span>
                <div className={styles.teamRow}>
                    <img src={awayLogo} alt={awayTeam} className={styles.logo}/>
                    <span className={styles.teamName}>
                        {awayTeam}
                        {statusCode === "RESULT" && (
                            <span className={styles.score}> {awayTeamScore}</span>
                        )}
                    </span>
                </div>
                <div className={styles.teamRow}>
                    <img src={homeLogo} alt={homeTeam} className={styles.logo}/>
                    <span className={styles.teamName}>
                        {homeTeam}
                        {statusCode === "RESULT" && (
                            <span className={styles.score}> {homeTeamScore}</span>
                        )}
                    </span>
                </div>
            </div>

            <div className={styles.infoBlock}>
                <span className={styles.mainTime}>{mainTime}</span>
                <span className={styles.stadium}>{stadium}</span>
                <span
                    className={
                        statusCode === "RESULT"
                            ? styles.statusResult
                            : statusCode === "READY"
                                ? styles.statusLive
                                : statusCode === "BEFORE"
                                    ? styles.statusBefore
                                    : ""
                    }
                >
                  {statusCode === "RESULT"
                      ? "경기종료"
                      : statusCode === "READY"
                          ? "LIVE!"
                          : statusCode === "BEFORE"
                              ? "경기전"
                              : ""}
                </span>
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

GameCard.propTypes = {
    matchId: PropTypes.number,
    time: PropTypes.string.isRequired,
    homeTeam: PropTypes.string.isRequired,
    awayTeam: PropTypes.string.isRequired,
    stadium: PropTypes.string.isRequired,
    mainTime: PropTypes.string.isRequired,
    homeLogo: PropTypes.string.isRequired,
    awayLogo: PropTypes.string.isRequired,
    homeTeamScore: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    awayTeamScore: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    statusCode: PropTypes.oneOf(['RESULT', 'STARTED', 'BEFORE']).isRequired,
    gameId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};