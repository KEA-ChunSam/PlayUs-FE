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
        const token = params.get('accessToken'); // URL에서 accessToken 추출

        if (token) {
            console.warn('❌ accessToken이 URL에 포함되어 있습니다. 쿠키를 사용 중이라면 URL에서 토큰을 제거하세요.');
        } else {
            console.log('✅ 쿠키를 통해 토큰이 관리됩니다.');
        }

        // 필요 시, 토큰 검증 API 호출
        // apiClient.get('/auth/validate-token')
        //     .then(response => console.log('✅ 토큰 유효:', response.data))
        //     .catch(error => console.error('❌ 토큰 유효성 검증 실패:', error));
    }, []);

    const onButtonClick = () => {
        if (!selectedTeam) {
            setShowModal(true);
            return;
        }
        localStorage.setItem('selectedTeam', selectedTeam);
        navigate("/setprofile");
    };
    return (
        <div className={styles.login_container}>
            <LoginHeader/>
            <div className={styles.team_choice_wrapper}>
                <h2 className={styles.team_choice_title}>선호하는 팀을 선택해 주세요.</h2>
                <p className={styles.team_choice_subtitle}>(이후 선호 팀 추가가 가능합니다.)</p>

                <div className={styles.team_grid}>
                    {[
                        {id: 1, teamId: 'NC Dinos', name: 'NC', logo: 'emblem_NC.png'},
                        {id: 2, teamId: 'Samsung Lions', name: '삼성', logo: 'emblem_SS.png'},
                        {id: 3, teamId: 'Doosan Bears', name: '두산', logo: 'emblem_OB.png'},
                        {id: 4, teamId: 'Hanhwa Eagles', name: '한화', logo: 'emblem_HH.png'},
                        {id: 5, teamId: 'Kia Tigers', name: 'KIA', logo: 'emblem_HT.png'},
                        {id: 6, teamId: 'KT Wiz', name: 'KT', logo: 'emblem_KT.png'},
                        {id: 7, teamId: 'Lotte Giants', name: '롯데', logo: 'emblem_LT.png'},
                        {id: 8, teamId: 'LG Twins', name: 'LG', logo: 'emblem_LG.png'},
                        {id: 9, teamId: 'SSG Landers', name: 'SSG', logo: 'emblem_SK.png'},
                        {id: 10, teamId: 'Kiwoom Heroes', name: '키움', logo: 'emblem_WO.png'},
                    ].map((team) => (
                        <div
                            className={`${styles.team_card} ${selectedTeam === team.id ? styles.selected : ''}`}
                            key={team.id}
                            onClick={() => setSelectedTeam(team.id)}
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
                    buttons={[
                        { label: '확인', onClick: () => setShowModal(false) }
                    ]}
                />
            )}
        </div>
    );
}
export default TeamChoice;