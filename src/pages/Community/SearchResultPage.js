import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SearchResultPage.module.css";
import { useSearch } from "../../components/SearchContext";
import PostListItem from "../../components/Post/PostListItem";
import axios from "axios";

const SearchResultPage = () => {
  const { keyword } = useSearch();
  const navigate = useNavigate();
  const safeKeyword = keyword?.toLowerCase() ?? "";
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // 검색 키워드(keyword)가 비어 있으면 빈 배열로 초기화
    if (!keyword || keyword.trim() === "") {
      setPosts([]);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_LOCAL_BACKEND_SEARCH_URI}/search/posts`,
          {
            params: { query: keyword },
            withCredentials: true,
          }
        );
        // 백엔드 응답: { resultSize: number, searchResultList: [ { postId, writerName, title, thumbnailUrl, createdAt, teamTag }, ... ] }
        const resultList = response.data.searchResultList || [];
        setPosts(resultList);
      } catch (err) {
        console.error("검색 API 호출 중 오류:", err);
        setPosts([]);
      }
    };

    fetchSearchResults();
  }, [keyword]);

  const handleBack = () => {
    navigate(-1);
  };

  const handlePostClick = (team, postId) => {
    navigate(`/community/post/${team}/${postId}`);
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
        {posts.length > 0
          ? <>총 <strong>{posts.length}</strong>건의 검색결과가 있습니다.</>
          : "검색 결과가 없습니다."}
      </div>

      <ul className={styles.list}>
        {posts.length > 0 && posts.map((item) => (
          <PostListItem
            key={item.postId}
            title={item.title}
            time={item.createdAt}
            author={item.writerName}
            image={item.thumbnailUrl}
            onClick={() => handlePostClick(item.teamTag, item.postId)}
          />
        ))}
      </ul>
    </div>
  );
};

export default SearchResultPage;