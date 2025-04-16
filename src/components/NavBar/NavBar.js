// /src/components/NavBar/NavBar.js
import React from "react";

const NavBar = () => {
    return (
        <nav className="absolute bottom-0 left-0 right-0 h-[60px] bg-white flex items-center justify-around border-t">
            {/* Nav 아이콘 또는 버튼 */}
            <button className="focus:outline-none">홈</button>
            <button className="focus:outline-none">게시판</button>
            <button className="focus:outline-none">마이페이지</button>
        </nav>
    );
};

export default NavBar;