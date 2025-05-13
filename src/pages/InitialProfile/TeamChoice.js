// 로그인 연동 이후 최초 팀 선택 페이지
import Modal from "../../components/Modal/Modal";
import LoginHeader from "../../components/Header/LoginHeader/LoginHeader";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import styles from "./TeamChoice.module.css";

const TeamChoice = () => {
    const navigate = useNavigate();
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // 로그인 직후 전달된 JWT 토큰을 URL query에서 추출해 저장
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem('Authorization', token);
            console.log('✅ JWT 저장 완료:', token);
        } else {
            console.warn('❌ URL에 token 파라미터가 없습니다.');
        }
    }, []);

    const onButtonClick = () => {
        if (!selectedTeam) {
            setShowModal(true);
            return;
        }
        navigate("/setprofile");
    }
    return (
        <div className={styles.login_container}>
            <LoginHeader style={{marginBottom: '-50px'}}/>
            <div className={styles.team_choice_wrapper}>
                <h2 className={styles.team_choice_title}>선호하는 팀을 선택해 주세요.</h2>
                <p className={styles.team_choice_subtitle}>(이후 선호 팀 추가가 가능합니다.)</p>

                <div className={styles.team_grid}>
                    {[
                        {name: 'LG', logo: 'emblem_LG.png'},
                        {name: 'KIA', logo: 'emblem_HT.png'},
                        {name: '롯데', logo: 'emblem_LT.png'},
                        {name: '한화', logo: 'emblem_HH.png'},
                        {name: '삼성', logo: 'emblem_SS.png'},
                        {name: '두산', logo: 'emblem_OB.png'},
                        {name: 'SSG', logo: 'emblem_SK.png'},
                        {name: 'NC', logo: 'emblem_NC.png'},
                        {name: '키움', logo: 'emblem_WO.png'},
                        {name: 'KT', logo: 'emblem_KT.png'},
                    ].map((team) => (
                        <div
                            className={`${styles.team_card} ${selectedTeam === team.name ? styles.selected : ''}`}
                            key={team.name}
                            onClick={() => setSelectedTeam(team.name)}
                        >
                            <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo/${team.logo}`} alt={`${team.name} 로고`}/>
                            <p>{team.name}</p>
                        </div>
                    ))}
                </div>

                <button className={styles.profile_button} onClick={onButtonClick}>내 프로필 설정하기</button>
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