import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PostListItem from '../../components/Post/PostListItem';
import styles from './Community.module.css';
import CasterbotButton from "../../components/CasterbotButton/CasterbotButton";
import CasterbotModal from "../Chatbot/CasterbotModal";
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
  const [selectedTeam, setSelectedTeam] = useState(searchParams.get('team') || 'hanwha');
  const [showModal, setShowModal] = useState(false);
  const [tempTeam, setTempTeam] = useState(selectedTeam);
  const [posts, setPosts] = useState(initialPosts);
  const [showAbsModal, setShowAbsModal] = useState(false);
  const [profanityMessage, setProfanityMessage] = useState('');
  const [showCasterbot, setShowCasterbot] = useState(false);


  useEffect(() => {
    // URL의 team 쿼리 파라미터가 있으면 해당 팀으로 세팅
    const teamParam = searchParams.get('team');
    if (teamParam && teamParam !== selectedTeam) {
      setSelectedTeam(teamParam);
    }

    // 사용자 정보 검증
    let user = null;
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        user = JSON.parse(userData);
        if (!user || typeof user !== 'object') {
          throw new Error('Invalid user data');
        }
      }
    } catch (error) {
      console.error('사용자 정보를 불러오는 중 오류가 발생했습니다:', error);
      user = null;
    }

    // localStorage에서 모든 게시글 불러오기
    let saved = [];
    try {
      const storedPosts = localStorage.getItem('communityPosts');
      saved = storedPosts ? JSON.parse(storedPosts) : [];
      if (!Array.isArray(saved)) {
        throw new Error('Invalid data format');
      }

      // 게시글 데이터 정규화 (날짜/시간 형식 통일)
      saved = saved.map(post => ({
        ...post,
        date: post.date || new Date(post.timestamp).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\. /g, '.').replace('.', ''),
        time: post.time || new Date(post.timestamp).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        timestamp: post.timestamp || Date.now()
      }));
    } catch (error) {
      console.error('게시물 데이터를 불러오는 중 오류가 발생했습니다:', error);
      saved = [];
    }

    if (saved.length > 0) {
      setPosts(saved);
    } else {
      // localStorage가 비어있으면, 샘플 데이터를 localStorage에 복사
      try {
        localStorage.setItem('communityPosts', JSON.stringify(initialPosts));
        setPosts(initialPosts);
      } catch (error) {
        console.error('샘플 데이터 저장 중 오류가 발생했습니다:', error);
        setPosts(initialPosts);
      }
    }
  }, [searchParams.get('team'), selectedTeam]);

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

  const handlePostClick = (postId) => {
    navigate(`/community/posts/${postId}`, { state: { team: selectedTeam } });
  };

  const handleWriteClick = () => {
    navigate('/newpost', { state: { team: selectedTeam } });
  };

  const handleOpenModal = () => {
    setTempTeam(selectedTeam);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSelectTeam = () => {
    setSelectedTeam(tempTeam);
    setShowModal(false);
    // 선택한 팀의 게시판으로 이동
    navigate(`/community?team=${tempTeam}`);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.lockerHeader}>
        <img src={teams.find(t => t.id === selectedTeam)?.logo} alt="팀로고" className={styles.teamLogo} />
        <span className={styles.lockerTitle}>{teams.find(t => t.id === selectedTeam)?.name} 라커룸</span>
        <button className={styles.writeBtn} onClick={handleWriteClick}>포스트 작성</button>
        <button className={styles.arrowBtn} onClick={handleOpenModal}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5L15 12L8 19" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <ul className={styles.postList}>
        {posts.filter(post => post.team === selectedTeam).map((post) => (
          <PostListItem
            key={post.id}
            title={post.title}
            time={post.time}
            author={post.author}
            image={post.image}
            onClick={() => handlePostClick(post.id)}
          />
        ))}
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
              {teams.map((team) => (
                <button
                  key={team.id}
                  className={
                    tempTeam === team.id
                      ? styles.teamBtnSelected
                      : styles.teamBtn
                  }
                  onClick={() => setTempTeam(team.id)}
                  role="radio"
                  aria-checked={tempTeam === team.id}
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