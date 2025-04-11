// 기본 틀이 되는 모바일 환경 기반 화면 틀
// TODO: 차후 MobileView와 AppRouter의 구성 순서를 바꿀 예정. ~04/11
import React from "react";
import Header from "../Header/Header.js";
import "./MobileView.css";

const MobileView = () => {
    return (
        <div className="mobile-view">
            <Header />
            <div className="mobile-content">
                <p>Hello</p>
            </div>
        </div>
    );
};

export default MobileView;