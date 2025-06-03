import React, { useState, useRef } from "react";
import axios from "axios";
import NotificationModal from "../../Modal/NotificationModal/NotificationModal";
import {useNavigate} from "react-router-dom";
import styles from "./Header.module.css";
import {useSearch} from "../../SearchContext";

const Header = () => {
    const {inputValue, setInputValue, setKeyword} = useSearch();
    const navigate = useNavigate();

    // 실시간 인기 검색어 state
    const [trendingList, setTrendingList] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const blurTimeoutRef = useRef(null);

    // 입력창 포커스 시 인기 검색어 조회
    const handleInputFocus = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_LOCAL_BACKEND_SEARCH_URI}/search/trending`,
          { withCredentials: true }
        );
        setTrendingList(response.data);
        setShowDropdown(true);
      } catch (err) {
        console.error("실시간 검색어 조회 중 에러:", err);
        setTrendingList([]);
        setShowDropdown(false);
      }
    };

    // 입력창 블러 시 드롭다운 숨기기 (잠시 지연)
    const handleInputBlur = () => {
      blurTimeoutRef.current = setTimeout(() => {
        setShowDropdown(false);
      }, 200);
    };

    // 입력값 변경 시 드롭다운 숨기기
    const handleInputChange = (e) => {
      setInputValue(e.target.value);
      setShowDropdown(false);
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };

    // 드롭다운 항목 클릭 시
    const handleKeywordClick = (keyword) => {
      setInputValue(keyword);
      setKeyword(keyword);
      navigate("/search");
      setShowDropdown(false);
    };

    const [showModal, setShowModal] = useState(false);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && inputValue.trim() !== "") {
            setKeyword(inputValue); // 엔터키를 눌렀을 때만 실제 검색어 설정
            navigate("/search");
        }
    };

    function alwaysHome() {
        navigate("/home")
    }

    return (
        <header className={styles.mobile_header}>
            <div className={styles.header_left}>
                <img
                    className={styles.main_logo}
                    src={`${process.env.PUBLIC_URL}/Logo/NewLogo_small.png`}
                    alt="Logo"
                    onClick={alwaysHome}
                />
            </div>
            <div className={styles.header_center}>
                <input
                    type="text"
                    className={styles.header_search_input}
                    placeholder="검색어 입력..."
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                />
                {showDropdown && trendingList.length > 0 && (
                  <ul className={styles.searchDropdown}>
                    {trendingList.slice(0, 5).map((item) => (
                      <li
                        key={item.rank}
                        className={styles.dropdownItem}
                        onClick={() => handleKeywordClick(item.keyword)}
                      >
                        <span className={styles.rank}>{item.rank}.</span>
                        <span className={styles.keyword}>{item.keyword}</span>
                      </li>
                    ))}
                  </ul>
                )}
            </div>
            <div className={`${styles.header_right} ${styles.header_right_absolute}`}>
                {/*<button>*/}
                {/*    /!* 관리자 기능은 현재 Non-MVP이므로 미구현 *!/*/}
                {/*    <img*/}
                {/*        src={`${process.env.PUBLIC_URL}/Button/admin.png`}*/}
                {/*        alt="관리자"*/}
                {/*        className={styles.noti_alert}*/}
                {/*    />*/}
                {/*</button>*/}
                <button onClick={() => setShowModal(!showModal)}>
                    <img
                        src={`${process.env.PUBLIC_URL}/Button/alert.png`}
                        alt="알림"
                        className={styles.noti_alert}
                    />
                </button>
                {showModal && <NotificationModal onClose={() => setShowModal(false)} />}
            </div>
        </header>
    );
};

export default Header;