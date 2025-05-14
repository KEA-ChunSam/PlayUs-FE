import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SearchResultPage.module.css";
import { useSearch } from "../../pages/Community/SearchContext";
import PostListItem from "../../components/Post/PostListItem";

const SearchResultPage = () => {
  const { keyword } = useSearch();
  const navigate = useNavigate();
  const safeKeyword = keyword?.toLowerCase() ?? "";
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('communityPosts')) || [];
    setPosts(saved);
  }, []);

  const filtered = posts.filter(
    (post) => post.title && post.title.toLowerCase().includes(safeKeyword)
  );

  const handleBack = () => {
    navigate("/community");
  };

  const handlePostClick = (postId) => {
    navigate(`/community/post/${postId}`);
  };

  return (
    <div className={styles.container}>
      {/* 상단 남색 바 */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={handleBack}>
          <img src={`${process.env.PUBLIC_URL}/Button/back.png`} alt="back" style={{width: 24, height: 24}} />
        </button>
        <span className={styles.topBarTitle}>검색 결과</span>
        <div className={styles.spacer}></div>
      </div>

      {/* 검색 결과 요약 */}
      <div className={styles.summary}>
        총 <strong>{filtered.length}</strong>건의 검색결과가 있습니다.
      </div>

      {/* 게시글 목록 */}
      <ul className={styles.list}>
        {filtered.map((post) => (
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