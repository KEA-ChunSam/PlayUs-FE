import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PostListItem from '../../components/Post/PostListItem';
import styles from './Community.module.css';
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import CasterbotModal from "../Chatbot/CasterbotModal";
import axios from 'axios';
import { teamInfoMapCommunity } from '../../utils/teamInfoMap';
// import Modal from '../../components/Modal/Modal';

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
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showCasterbot, setShowCasterbot] = useState(false);
  const [favoriteTeam, setFavoriteTeam] = useState(null);
  const [showTeamSelectModal, setShowTeamSelectModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showAbsModal, setShowAbsModal] = useState(false);
  const [profanityMessage, setProfanityMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    image: null
  });
  const [showModal, setShowModal] = useState(false);
  const [tempTeam, setTempTeam] = useState(null);
  const [showPostMenu, setShowPostMenu] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFetchingTeam, setIsFetchingTeam] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const getTeamInfo = (teamId) => {
    if (!teamId) return null;
    const normalize = v => (v || '').replace(/_/g, '').toUpperCase();
    return teamInfoMapCommunity.find(t => normalize(t.teamId) === normalize(teamId));
  };

  const teamInfo = getTeamInfo(selectedTeam);

  useEffect(() => {
    const fetchFavoriteTeam = async () => {
      if (selectedTeam !== null) {
        setIsInitialLoad(false);
        setIsFetchingTeam(false);
        return;
      }
      
      try {
        const baseUrl = process.env.REACT_APP_LOCAL_BACKEND_URI;
        const res = await axios.get(`${baseUrl}/user/profile`, { withCredentials: true });
        const favorites = Array.isArray(res.data.favoriteTeams) ? res.data.favoriteTeams : [];
        const sorted = [...favorites].sort((a, b) => a.displayOrder - b.displayOrder);
        let targetTeamId = null;

        if (sorted.length > 0) {
          const firstTeamId = sorted[0].teamId;
          const teamInfo = teamInfoMapCommunity.find(team => team.id === firstTeamId);
          if (teamInfo) {
            targetTeamId = teamInfo.teamId;
          } else {
            targetTeamId = null;
          }
        }

        if (targetTeamId) {
          setSelectedTeam(targetTeamId);
          navigate(`/community/post/${targetTeamId}`);
        } else {
          const defaultTeamFromMap = teamInfoMapCommunity.length > 0 ? teamInfoMapCommunity[0].teamId : 'KIA_TIGERS';
          setSelectedTeam(defaultTeamFromMap);
          navigate(`/community/post/${defaultTeamFromMap}`);
        }
      } catch (error) {
        const defaultTeamFromMap = teamInfoMapCommunity.length > 0 ? teamInfoMapCommunity[0].teamId : 'KIA_TIGERS';
        setSelectedTeam(defaultTeamFromMap);
        navigate(`/community/post/${defaultTeamFromMap}`);
      } finally {
        setIsInitialLoad(false);
        setIsFetchingTeam(false);
      }
    };

    if (isInitialLoad && selectedTeam === null) {
      fetchFavoriteTeam();
    }
  }, [navigate, selectedTeam, isInitialLoad]);

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
    const fetchPosts = async () => {
      setLoading(true);
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

        const postsWithTeam = (response.data || []).map(post => ({
          ...post,
          team: post.team || selectedTeam,
          id: post.postId || post.id
        }));
        
        setPosts(postsWithTeam);
      } catch (error) {
        alert('게시글을 불러오는 중 오류가 발생했습니다.');
        setPosts([]);
      } finally {
        setLoading(false);
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
    const teamInfo = teamInfoMapCommunity.find(team => team.teamId === selectedTeam);
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

    const selectedTeamInfo = teamInfoMapCommunity.find(team => team.teamId === tempTeam);
    if (!selectedTeamInfo) {
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
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        setShowPostMenu(null);
        alert('게시글이 삭제되었습니다.');
      } else {
        alert('게시글 삭제에 실패했습니다.');
      }
    } catch (error) {
      alert('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEditPost = (post) => {
    navigate(`/editpost/${post.id}`, { state: { post } });
  };

  const handleTogglePostMenu = (postId) => {
    setShowPostMenu(showPostMenu === postId ? null : postId);
  };

  const handleBackToList = () => {
    navigate('/community');
  };

  const filterByTeam = (post) => {
    return selectedTeam ? post.team === selectedTeam : true;
  };

  const getTeamLogo = (teamId) => {
    const team = teams.find(t => t.id.toUpperCase() === teamId.toUpperCase());
    return team ? team.logo : '';
  };

  const getTeamName = (teamId) => {
    const team = teamInfoMapCommunity.find(t => t.teamId.toUpperCase() === teamId.toUpperCase());
    return team ? team.name : '알 수 없음';
  };

  const handleCasterbotButtonClick = () => {
    setShowCasterbot(true);
  };

  const handleCasterbotClose = () => {
    setShowCasterbot(false);
  };

  if (isFetchingTeam || !selectedTeam || !teamInfoMapCommunity.find(team => team.teamId === selectedTeam)?.name) {
    return <div className={styles.loading}>로딩 중...</div>;
  }

  const filteredPosts = posts.filter(filterByTeam);

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
        {loading ? (
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
              onClick={() => handlePostClick(post.team, post.id || post.postId)}
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
      <CasterbotButton onClick={handleCasterbotButtonClick} />

      {showCasterbot && (
          <CasterbotModal onClose={handleCasterbotClose}/>
      )}
    </div>
  );
};

export default Community;
