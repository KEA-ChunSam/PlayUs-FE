import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SearchResultPage.module.css";
import { useSearch } from "../../components/SearchContext";
import PostListItem from "../../components/Post/PostListItem";

const SearchResultPage = () => {
  const { keyword } = useSearch();
  const navigate = useNavigate();
  const safeKeyword = keyword?.toLowerCase() ?? "";
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('communityPosts')) || [];
      setPosts(saved);
    } catch (error) {
      console.error('게시물 데이터 로드 중 오류 발생:', error);
      setPosts([]);
    }
  }, []);

  const filtered = posts.filter(
    (post) => post.title && post.title.toLowerCase().includes(safeKeyword)
  );

  const handleBack = () => {
    navigate(-1);
  };

  const handlePostClick = (postId) => {
    navigate(`/community/post/${postId}`);
  };

  return (
    <div className={styles.container}>
      {/* 상단 남색 바 */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={handleBack}>
          <img src={`${process.env.PUBLIC_URL}/Button/back.png`} alt="back" style={{width: 16, height: 16}} />
        </button>
        <span className={styles.topBarTitle}>검색 결과</span>
        <div className={styles.spacer}></div>
      </div>

      {/* 검색 결과 요약 및 0건 안내 */}
      <div className={styles.summary}>
        {filtered.length > 0
          ? <>총 <strong>{filtered.length}</strong>건의 검색결과가 있습니다.</>
          : "검색 결과가 없습니다."}
      </div>

      <ul className={styles.list}>
        {filtered.length > 0 && filtered.map((post) => (
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
    </div>
  );
};

export default SearchResultPage;