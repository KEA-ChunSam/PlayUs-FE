import Modal from "../../components/Modal/Modal";
import LoginHeader from "../../components/Header/LoginHeader/LoginHeader";
import React, {useEffect, useState} from "react";
import './TeamChoice.css';
import {href, Link, useNavigate} from "react-router-dom";

const TeamChoice = () => {
    const navigate = useNavigate();
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const onButtonClick = () => {
        if (!selectedTeam) {
            setShowModal(true);
            return;
        }
        navigate("/setprofile");
    }
    return (
        <div className="login-container">
            <LoginHeader style={{marginBottom:'-50px'}}/>
            <div className="team-choice-wrapper">
                <h2 className="team-choice-title">선호하는 팀을 선택해 주세요.</h2>
                <p className="team-choice-subtitle">(이후 선호 팀 추가가 가능합니다.)</p>

                <div className="team-grid">
                    {[
                        { name: 'LG', logo: 'emblem_LG.png' },
                        { name: 'KIA', logo: 'emblem_HT.png' },
                        { name: '롯데', logo: 'emblem_LT.png' },
                        { name: '한화', logo: 'emblem_HH.png' },
                        { name: '삼성', logo: 'emblem_SS.png' },
                        { name: '두산', logo: 'emblem_OB.png' },
                        { name: 'SSG', logo: 'emblem_SK.png' },
                        { name: 'NC', logo: 'emblem_NC.png' },
                        { name: '키움', logo: 'emblem_WO.png' },
                        { name: 'KT', logo: 'emblem_KT.png' },
                    ].map((team) => (
                        <div
                          className={`team-card ${selectedTeam === team.name ? 'selected' : ''}`}
                          key={team.name}
                          onClick={() => setSelectedTeam(team.name)}
                        >
                            <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo/${team.logo}`} alt={`${team.name} 로고`} />
                            <p>{team.name}</p>
                        </div>
                    ))}
                </div>

                <button className="profile-button" onClick={onButtonClick}>내 프로필 설정하기</button>
            </div>
            {showModal && (
                <Modal
                    title="알림"
                    message="팀을 선택해 주세요."
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
export default TeamChoice;