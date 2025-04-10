// 공통 헤더 컴포넌트
import React from "react";
import "./Header.css";

const Header = () => {
    return (
        <header className="mobile-header">
            <div className="header-left">
                <img
                    className="main-logo"
                    src={`${process.env.PUBLIC_URL}/Logo/NewLogo_small.png`}
                    alt="Logo"
                />
            </div>
            <div className="header-center">
                <input
                    type="text"
                    className="header-search-input"
                    placeholder="검색어 입력..."
                />
            </div>
            <div className="header-right">
                <button className="admin-btn">
                    <img
                        src={`${process.env.PUBLIC_URL}/button/admin.png`}
                        alt="알림"
                        className="noti-alert"
                    />
                </button>
                <button className="noti-btn">
                    <img
                        src={`${process.env.PUBLIC_URL}/button/alert.png`}
                        alt="알림"
                        className="noti-alert"
                    />
                </button>
            </div>
        </header>
    );
};

export default Header;