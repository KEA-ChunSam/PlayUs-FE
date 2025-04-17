// /src/components/NavBar/NavBar.js
import React from "react";
import "./NavBar.css"; // 기존 CSS 사용

const NavBar = () => {
    return (
        <nav className="nav-bar">
            <button>홈</button>
            <button>커뮤니티</button>
            <button>일정</button>
            <button>마이페이지</button>
        </nav>
    );
};

export default NavBar;