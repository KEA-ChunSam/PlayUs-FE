// 페이지 라우터 컴포넌트
import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import MobileView from "../components/MobileView/MobileView";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MobileView />}/>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;