// 페이지 라우터 컴포넌트
import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import MobileView from "../components/MobileView/MobileView";
import MainPage from "../pages/Main/MainPage";
import Splash from "../pages/Login/Splash";
import Login from "../pages/Login/Login";
import Community from '../components/Community';
import Party from '../components/Party';
import Profile from '../components/Profile';

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Splash />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<MobileView />}>
                    <Route index element={<MainPage />} />
                </Route>
                <Route path="/mainpage" element={<MobileView />}>
                    <Route index element={<MainPage />} />
                </Route>   
                <Route path="/community" element={<MobileView />}>
                    <Route index element={<Community />} />
                </Route>
                <Route path="/party" element={<MobileView/>}>
                    <Route index element={<Party />} />
                </Route>
                <Route path="/profile" element={<MobileView />}>
                    <Route index element={<Profile />} />    
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;