// /src/components/MobileView/MobileView.js
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import NavBar from "../NavBar/NavBar";
import "./MobileView.css";

const MobileView = () => {
    return (
        <div className="mobile-view">
            {/* 상단 고정 Header */}
            <Header />

            {/* 가운데 내용 영역 - 여기서 Outlet을 통해 페이지들이 동적으로 교체됩니다 */}
            <div className="mobile-content">
                <Outlet />
            </div>

            {/* 하단 고정 NavBar */}
            <NavBar />
        </div>
    );
};

export default MobileView;