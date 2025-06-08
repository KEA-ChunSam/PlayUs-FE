import React, {useEffect, useState} from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import {useLocation, useNavigate} from 'react-router-dom';
import PostListItem from '../../components/Post/PostListItem';
import styles from './Community.module.css';
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import CasterbotModal from "../Chatbot/CasterbotModal";
import axios from 'axios';
import {teamInfoMapCommunity} from '../../utils/teamInfoMap';
// import Modal from '../../components/Modal/Modal';

const initialPosts = [
    {
        id: 1,
        title: '비와서 경기 종료',
        time: '18:36',
        date: new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\. /g, '.').replace('.', ''),
        author: '이플립스',
        image: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HH.png`,
        team: 'hanwha',
        teamName: '한화 이글스',
        timestamp: Date.now()
    }
];


const teams = [
    {id: 'hanwha', name: '한화 이글스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HH.png`},
    {id: 'lg', name: 'LG 트윈스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LG.png`},
    {id: 'kt', name: 'KT 위즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_KT.png`},
    {id: 'ssg', name: 'SSG 랜더스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SK.png`},
    {id: 'nc', name: 'NC 다이노스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_NC.png`},
    {id: 'doosan', name: '두산 베어스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_OB.png`},
    {id: 'kia', name: 'KIA 타이거즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HT.png`},
    {id: 'samsung', name: '삼성 라이온즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SS.png`},
    {id: 'lotte', name: '롯데 자이언츠', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LT.png`},
    {id: 'kiwoom', name: '키움 히어로즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_WO.png`},
];

const Community = () => {

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [tempTeam, setTempTeam] = useState(null);
    const [posts, setPosts] = useState([]);
    const [showAbsModal, setShowAbsModal] = useState(false);
    const [profanityMessage, setProfanityMessage] = useState('');
    const [showCasterbot, setShowCasterbot] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [showPostMenu, setShowPostMenu] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 8;

    const getTeamInfo = (teamId) => {
        if (!teamId) return null;
        const normalize = v => (v || '').replace(/_/g, '').toUpperCase();
        return teamInfoMapCommunity.find(t => normalize(t.teamId) === normalize(teamId));
    };

    const teamInfo = getTeamInfo(selectedTeam);

    useEffect(() => {
        const fetchFavoriteTeam = async () => {
            // 초기 로딩이 아닌 경우 실행하지 않음
            if (!isInitialLoad) return;

            try {
                const baseUrl = process.env.REACT_APP_LOCAL_BACKEND_URI;

                const res = await axios.get(`${baseUrl}/user/profile`, {withCredentials: true});

                const favorites = Array.isArray(res.data.favoriteTeams) ? res.data.favoriteTeams : [];

                const sorted = [...favorites].sort((a, b) => a.displayOrder - b.displayOrder);
                if (sorted.length === 0) {
                    throw new Error('선호팀이 없습니다.');
                }
                const firstTeamId = sorted[0].teamId;

                // teamInfoMapCommunity에서 해당 ID의 팀 정보 찾기
                const teamInfo = teamInfoMapCommunity.find(team => team.id === firstTeamId);

                if (teamInfo) {
                    // URL에 팀 정보가 없는 경우에만 선호팀으로 설정
                    if (!location.pathname.includes('/post/')) {
                        setSelectedTeam(teamInfo.teamId);
                        navigate(`/community/post/${teamInfo.teamId}`);
                    }
                } else {
                    // URL에 팀 정보가 없는 경우에만 기본 팀으로 설정
                    if (!location.pathname.includes('/post/')) {
                        const defaultTeam = 'KIA_TIGERS';
                        setSelectedTeam(defaultTeam);
                        navigate(`/community/post/${defaultTeam}`);
                    }
                }
            } catch (error) {
                console.error('선호팀 가져오기 실패:', error);
                // URL에 팀 정보가 없는 경우에만 기본 팀으로 설정
                if (!location.pathname.includes('/post/')) {
                    const defaultTeam = 'KIA_TIGERS';
                    setSelectedTeam(defaultTeam);
                    navigate(`/community/post/${defaultTeam}`);
                }
            } finally {
                setIsInitialLoad(false);
            }
        };
        fetchFavoriteTeam();
    }, [navigate, isInitialLoad, location.pathname]);

    // URL에서 팀 정보 가져오기
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        const teamIndex = pathParts.indexOf('post') + 1;
        if (teamIndex > 0 && teamIndex < pathParts.length) {
            const teamFromUrl = pathParts[teamIndex];
            if (teamFromUrl && teamFromUrl !== selectedTeam) {
                setSelectedTeam(teamFromUrl);
            }
        }
    }, [location.pathname, selectedTeam]);

    useEffect(() => {
        if (!selectedTeam) return;
        // 게시글 목록 fetch
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const url = `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/${selectedTeam}`;

                const response = await axios.get(url, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });


                if (!response.data) {
                    throw new Error('서버 응답이 없습니다.');
                }

                // team 필드가 없으면 selectedTeam으로 채워줌
                const postsWithTeam = (response.data || []).map(post => ({
                    ...post,
                    team: post.team || selectedTeam,
                    id: post.postId || post.id // postId를 id로 통일
                }));

                setPosts(postsWithTeam);
            } catch (error) {
                console.error('게시글 목록 조회 실패:', error);
                if (error.response) {
                    console.error('에러 응답:', error.response.data);
                    console.error('에러 상태:', error.response.status);
                }
                alert('게시글을 불러오는 중 오류가 발생했습니다.');
                setPosts([]); // 에러 시 빈 배열로 설정
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, [selectedTeam]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && showModal) {
                handleCloseModal();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showModal]);

    const handlePostClick = (team, postId) => {
        navigate(`/community/post/${team}/${postId}`);
    };

    const handleWriteClick = () => {
        teamInfoMapCommunity.forEach(team => {
        });
        const teamInfo = teamInfoMapCommunity.find(team => team.teamId === selectedTeam);
        if (!teamInfo) {
            alert('팀 정보를 찾을 수 없습니다.');
            return;
        }
        navigate('/newpost', {state: {team: teamInfo.teamId, teamName: teamInfo.name}});
    };

    const handleOpenModal = () => {
        setTempTeam(selectedTeam);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSelectTeam = () => {
        if (!tempTeam) {
            alert('팀을 선택해주세요.');
            return;
        }

        // teamInfoMapCommunity에서 선택한 팀 정보 찾기
        const selectedTeamInfo = teamInfoMapCommunity.find(team => team.teamId === tempTeam);
        if (!selectedTeamInfo) {
            console.error('선택한 팀 정보를 찾을 수 없습니다:', tempTeam);
            alert('팀 정보를 찾을 수 없습니다.');
            return;
        }

        setSelectedTeam(tempTeam);
        setShowModal(false);
        navigate(`/community/post/${tempTeam}`);
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('게시글을 삭제하시겠습니까?')) return;

        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/${postId}`,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                // 서버에서 삭제가 성공적으로 처리된 후에만 상태 업데이트
                setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
                setShowPostMenu(null);
                alert('게시글이 삭제되었습니다.');
            } else {
                throw new Error('게시글 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            if (error.response) {
                if (error.response.status === 403) {
                    alert('게시글을 삭제할 권한이 없습니다.');
                } else if (error.response.status === 401) {
                    alert('로그인이 필요합니다.');
                } else {
                    alert(`게시글 삭제 중 오류가 발생했습니다: ${error.response.data?.message || error.message}`);
                }
            } else {
                alert('게시글 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    const handleBackToList = () => {
        navigate(`/community/post/${selectedTeam}`);
    };

    // 게시글 리스트 렌더링
    const filterByTeam = (post) => {
        if (!post || !post.team || !selectedTeam) return false;
        // team 값이 selectedTeam과 대소문자, 언더스코어 무시하고 일치하는지 비교
        const normalize = v => (v || '').replace(/_/g, '').toUpperCase();
        const normalizedPostTeam = normalize(post.team);
        const normalizedSelectedTeam = normalize(selectedTeam);
        return normalizedPostTeam === normalizedSelectedTeam;
    };

    if (!selectedTeam || !teamInfoMapCommunity.find(team => team.teamId === selectedTeam)?.name) {
        return <div className={styles.loading}>로딩 중...</div>;
    }

    const sortedPosts = posts
        .filter(filterByTeam)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.lockerHeader}>
                <img src={teamInfo?.logo || `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HH.png`} alt="팀로고"
                     className={styles.teamLogo}/>
                <span
                    className={styles.lockerTitle}>{teamInfoMapCommunity.find(team => team.teamId === selectedTeam).name} 라커룸</span>
                <button className={styles.writeBtn} onClick={handleWriteClick}>포스트 작성</button>
                <button className={styles.arrowBtn} onClick={handleOpenModal}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5L15 12L8 19" stroke="#111" strokeWidth="2.2" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>
            <ul className={styles.postList}>
                {isLoading ? (
                    <li style={{textAlign: 'center', color: '#888', marginTop: '2rem'}}>로딩 중...</li>
                ) : sortedPosts.length === 0 ? (
                    <li style={{textAlign: 'center', color: '#888', marginTop: '2rem'}}>게시글이 없습니다.</li>
                ) : (
                    currentPosts.map((post) => (
                        <PostListItem
                            key={post.id || post.postId}
                            title={post.title}
                            date={post.date}
                            writerNickname={post.writerNickname}
                            image={post.image ? `${process.env.REACT_APP_PRESIGNED_URI}/${post.image}` : null}
                            onClick={() => handlePostClick(post.team, post.id || post.postId)}
                        />
                    ))
                )}
            </ul>
            <div className={styles.paginationWrapper}>
                <Stack spacing={2}>
                    <Pagination
                        count={Math.ceil(sortedPosts.length / postsPerPage)}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Stack>
            </div>
            {showModal && (
                <div
                    className={styles.modalOverlay}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="community-modal-title"
                >
                    <div className={styles.modalContent}>
                        <h2 id="community-modal-title" className={styles.modalTitle}>커뮤니티 이동</h2>
                        <div
                            className={styles.teamGrid}
                            role="radiogroup"
                            aria-label="팀 선택"
                        >
                            {teamInfoMapCommunity.map((team) => (
                                <button
                                    key={team.teamId}
                                    className={
                                        tempTeam === team.teamId
                                            ? styles.teamBtnSelected
                                            : styles.teamBtn
                                    }
                                    onClick={() => setTempTeam(team.teamId)}
                                    role="radio"
                                    aria-checked={tempTeam === team.teamId}
                                    aria-label={`${team.name} 선택`}
                                >
                                    <img src={team.logo} alt="" className={styles.teamModalLogo}/>
                                    <span>{team.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.selectBtn}
                                onClick={handleSelectTeam}
                                aria-label="선택한 팀으로 이동"
                            >
                                선택
                            </button>
                            <button
                                className={styles.cancelBtn}
                                onClick={handleCloseModal}
                                aria-label="팀 선택 취소"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <CasterbotButton onClick={() => setShowCasterbot(true)}/>

            {showCasterbot && (
                <CasterbotModal onClose={() => setShowCasterbot(false)}/>
            )}
        </div>
    );
};

export default Community;
