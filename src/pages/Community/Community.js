import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PostListItem from '../../components/Post/PostListItem';
import styles from './Community.module.css';
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import CasterbotModal from "../Chatbot/CasterbotModal";
import axios from 'axios';
import { teamInfoMapCommunity } from '../../utils/teamInfoMap';
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
  { id: 'hanwha', name: '한화 이글스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HH.png` },
  { id: 'lg', name: 'LG 트윈스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LG.png` },
  { id: 'kt', name: 'KT 위즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_KT.png` },
  { id: 'ssg', name: 'SSG 랜더스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SK.png` },
  { id: 'nc', name: 'NC 다이노스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_NC.png` },
  { id: 'doosan', name: '두산 베어스', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_OB.png` },
  { id: 'kia', name: 'KIA 타이거즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HT.png` },
  { id: 'samsung', name: '삼성 라이온즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_SS.png` },
  { id: 'lotte', name: '롯데 자이언츠', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_LT.png` },
  { id: 'kiwoom', name: '키움 히어로즈', logo: `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_WO.png` },
];

const Community = () => {
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
<<<<<<< Updated upstream
  const [isLoading, setIsLoading] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(null);
=======
>>>>>>> Stashed changes

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
        console.log('선호팀 가져오기 시작');
        const baseUrl = process.env.REACT_APP_LOCAL_BACKEND_URI;
        console.log('백엔드 URL:', baseUrl);
        
        const res = await axios.get(`${baseUrl}/user/profile`, { withCredentials: true });
        console.log('프로필 응답:', res.data);
        
        const favorites = Array.isArray(res.data.favoriteTeams) ? res.data.favoriteTeams : [];
        console.log('선호팀 목록:', favorites);
        
        const sorted = [...favorites].sort((a, b) => a.displayOrder - b.displayOrder);
        if (sorted.length === 0) {
          console.log('선호팀이 없습니다.');
          return;
        }
        
        const firstTeamId = sorted[0].teamId;
        console.log('첫 번째 선호팀 ID:', firstTeamId);
        
        // teamInfoMapCommunity에서 해당 ID의 팀 정보 찾기
        const teamInfo = teamInfoMapCommunity.find(team => team.id === firstTeamId);
        console.log('찾은 팀 정보:', teamInfo);
        
        if (teamInfo) {
          // URL에 팀 정보가 없는 경우에만 선호팀으로 설정
          if (!location.pathname.includes('/post/')) {
            setSelectedTeam(teamInfo.teamId);
            navigate(`/community/post/${teamInfo.teamId}`);
          }
        } else {
          console.log('팀 정보를 찾을 수 없습니다.');
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
        console.log('URL에서 팀 정보 가져옴:', teamFromUrl);
        setSelectedTeam(teamFromUrl);
      }
    }
  }, [location.pathname, selectedTeam]);

  // selectedTeam이 변경될 때마다 로그 출력
  useEffect(() => {
    console.log('selectedTeam 변경됨:', selectedTeam);
  }, [selectedTeam]);

  // teamInfo가 변경될 때마다 로그 출력
  useEffect(() => {
    console.log('teamInfo 변경됨:', teamInfo);
  }, [teamInfo]);

  // 초기 렌더링 시 로그 출력
  useEffect(() => {
    console.log('컴포넌트 마운트됨');
    console.log('현재 selectedTeam:', selectedTeam);
    console.log('현재 teamInfo:', teamInfo);
  }, []);

  useEffect(() => {
    if (!selectedTeam) return;
    // 게시글 목록 fetch
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        console.log('선택된 팀:', selectedTeam);
        const url = `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/${selectedTeam}`;
        console.log('API 요청 URL:', url);
        
        const response = await axios.get(url, { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('API 응답:', response.data);
        
        if (!response.data) {
          throw new Error('서버 응답이 없습니다.');
        }

        // team 필드가 없으면 selectedTeam으로 채워줌
        const postsWithTeam = (response.data || []).map(post => ({
          ...post,
          team: post.team || selectedTeam,
          id: post.postId || post.id // postId를 id로 통일
        }));
        
        console.log('처리된 게시글 목록:', postsWithTeam);
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

  const handlePostClick = (postId, team) => {
    navigate(`/community/post/${team}/${postId}`);
  };

  const handleWriteClick = () => {
    console.log('selectedTeam:', selectedTeam, 'typeof:', typeof selectedTeam);
    console.log('teamInfoMapCommunity teamIds:', teamInfoMapCommunity.map(t => t.teamId));
    teamInfoMapCommunity.forEach(team => {
      console.log('team.teamId:', team.teamId, 'typeof:', typeof team.teamId, '===', team.teamId === selectedTeam);
    });
    const teamInfo = teamInfoMapCommunity.find(team => team.teamId === selectedTeam);
    console.log('teamInfo:', teamInfo);
    if (!teamInfo) {
      alert('팀 정보를 찾을 수 없습니다.');
      return;
    }
    navigate('/newpost', { state: { team: teamInfo.teamId, teamName: teamInfo.name } });
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

    console.log('선택된 팀 정보:', selectedTeamInfo);
    setSelectedTeam(tempTeam);
    setShowModal(false);
    navigate(`/community/post/${tempTeam}`);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_LOCAL_BACKEND_COMMUNITY_URI}/post/${postId}`,
        {
          withCredentials: true
        }
      );

      setPosts(posts.filter(post => post.id !== postId));
      setShowPostMenu(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('게시글 삭제 중 오류가 발생했습니다.');
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
    console.log('팀 비교:', { 
      postTeam: post.team, 
      normalizedPostTeam,
      selectedTeam,
      normalizedSelectedTeam,
      matches: normalizedPostTeam === normalizedSelectedTeam
    });
    return normalizedPostTeam === normalizedSelectedTeam;
  };

  if (!selectedTeam || !teamInfoMapCommunity.find(team => team.teamId === selectedTeam)?.name) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  const filteredPosts = posts.filter(filterByTeam);
  console.log('필터링된 게시글:', filteredPosts);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.lockerHeader}>
        <img src={teamInfo?.logo || `${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_HH.png`} alt="팀로고" className={styles.teamLogo} />
        <span className={styles.lockerTitle}>{teamInfoMapCommunity.find(team => team.teamId === selectedTeam).name} 라커룸</span>
        <button className={styles.writeBtn} onClick={handleWriteClick}>포스트 작성</button>
        <button className={styles.arrowBtn} onClick={handleOpenModal}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5L15 12L8 19" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <ul className={styles.postList}>
        {isLoading ? (
          <li style={{textAlign: 'center', color: '#888', marginTop: '2rem'}}>로딩 중...</li>
        ) : filteredPosts.length === 0 ? (
          <li style={{textAlign: 'center', color: '#888', marginTop: '2rem'}}>게시글이 없습니다.</li>
        ) : (
          filteredPosts.map((post) => (
            <PostListItem
              key={post.id || post.postId}
              title={post.title}
              time={post.time}
              author={post.author}
              image={post.image}
              onClick={() => handlePostClick(post.id || post.postId, post.team)}
            />
          ))
        )}
      </ul>
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
                  <img src={team.logo} alt="" className={styles.teamModalLogo} />
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
      <CasterbotButton onClick={() => setShowCasterbot(true)} />

      {showCasterbot && (
          <CasterbotModal onClose={() => setShowCasterbot(false)}/>
      )}
    </div>
  );
};

export default Community;