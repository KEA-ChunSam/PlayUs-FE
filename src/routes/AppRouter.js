// 페이지 라우터 컴포넌트
import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import MobileView from "../components/MobileView/MobileView";
import MainPage from "../pages/Main/MainPage";
import Splash from "../pages/Login/Splash";
import Login from "../pages/Login/Login";
import TeamChoice from "../pages/InitialProfile/TeamChoice";
import SetProfile from "../pages/InitialProfile/SetProfile";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Splash />} />
                <Route path="/login" element={<Login />}/>
                <Route path="/choice-team" element={<TeamChoice/>}/>
                <Route path="/setprofile" element={<SetProfile/>}/>
                <Route path="/home" element={<MobileView />}>
                    <Route index element={<MainPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;