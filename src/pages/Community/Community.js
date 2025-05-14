import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PostListItem from '../../components/Post/PostListItem';
import styles from './Community.module.css';

const initialPosts = [
  {
    id: 1,
    title: '비와서 경기 종료',
    time: '18:36',
    author: '이플립스',
    image: '/Logo/TeamLogo/emblem_HH.png',
    team: 'hanwha',
    teamName: '한화 이글스'
  }
];

const teams = [
  { id: 'hanwha', name: '한화 이글스', logo: '/Logo/TeamLogo/emblem_HH.png' },
  { id: 'lg', name: 'LG 트윈스', logo: '/Logo/TeamLogo/emblem_LG.png' },
  { id: 'kt', name: 'KT 위즈', logo: '/Logo/TeamLogo/emblem_KT.png' },
  { id: 'ssg', name: 'SSG 랜더스', logo: '/Logo/TeamLogo/emblem_SK.png' },
  { id: 'nc', name: 'NC 다이노스', logo: '/Logo/TeamLogo/emblem_NC.png' },
  { id: 'doosan', name: '두산 베어스', logo: '/Logo/TeamLogo/emblem_OB.png' },
  { id: 'kia', name: 'KIA 타이거즈', logo: '/Logo/TeamLogo/emblem_HT.png' },
  { id: 'samsung', name: '삼성 라이온즈', logo: '/Logo/TeamLogo/emblem_SS.png' },
  { id: 'lotte', name: '롯데 자이언츠', logo: '/Logo/TeamLogo/emblem_LT.png' },
  { id: 'kiwoom', name: '키움 히어로즈', logo: '/Logo/TeamLogo/emblem_WO.png' },
];

const Community = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTeam, setSelectedTeam] = useState(location.state?.team || 'hanwha');
  const [showModal, setShowModal] = useState(false);
  const [tempTeam, setTempTeam] = useState(selectedTeam);
  const [posts, setPosts] = useState(initialPosts);

  useEffect(() => {
    // location.state.team이 있으면 해당 팀으로 세팅
    if (location.state?.team && location.state.team !== selectedTeam) {
      setSelectedTeam(location.state.team);
    }
    // localStorage에서 모든 게시글 불러오기
    const saved = JSON.parse(localStorage.getItem('communityPosts'));
    if (Array.isArray(saved) && saved.length > 0) {
      setPosts(saved);
    } else {
      // localStorage가 비어있으면, 샘플 데이터를 localStorage에 복사
      localStorage.setItem('communityPosts', JSON.stringify(initialPosts));
      setPosts(initialPosts);
    }
  }, [showModal, location.state?.team]);

  const handlePostClick = (postId) => {
    navigate(`/community/post/${postId}`, { state: { team: selectedTeam } });
  };

  const handleWriteClick = () => {
    navigate('/community/write', { state: { team: selectedTeam } });
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
    navigate('/community', { state: { team: tempTeam } });
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
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>커뮤니티 이동</h2>
            <div className={styles.teamGrid}>
              {teams.map((team) => (
                <button
                  key={team.id}
                  className={
                    tempTeam === team.id
                      ? styles.teamBtnSelected
                      : styles.teamBtn
                  }
                  onClick={() => setTempTeam(team.id)}
                >
                  <img src={team.logo} alt={team.name} className={styles.teamModalLogo} />
                  <span>{team.name}</span>
                </button>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.selectBtn} onClick={handleSelectTeam}>선택</button>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;