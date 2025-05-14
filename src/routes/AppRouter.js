// 페이지 라우터 컴포넌트
import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import MobileView from "../components/MobileView/MobileView";
import MainPage from "../pages/Main/MainPage";
import Splash from "../pages/Login/Splash";
import Login from "../pages/Login/Login";
import Community from '../pages/Community/Community';
import PostWrite from '../pages/Community/PostWrite';
import Party from '../components/Party';
import Profile from '../pages/Profile/Profile';
import TeamChoice from "../pages/InitialProfile/TeamChoice";
import SetProfile from "../pages/InitialProfile/SetProfile";
import LoginComplete from "../pages/InitialProfile/LoginComplete";
import SearchResultPage from "../pages/Community/SearchResultPage";
import DiaryList from "../pages/LiveMatchDiary/DiaryList";
import DiaryDetail from "../pages/LiveMatchDiary/DiaryDetail";
import NewDiary from "../pages/LiveMatchDiary/NewDiary";
import PostDetail from '../pages/Community/PostDetail';

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Splash />} />
                <Route path="/login" element={<Login />}/>
                <Route path="/choice-team" element={<TeamChoice/>}/>
                <Route path="/setprofile" element={<SetProfile/>}/>
                <Route path="/login-complete" element={<LoginComplete/>}/>
                <Route path="/home" element={<MobileView />}>
                    <Route index element={<MainPage />} />
                </Route>
                <Route path="/mainpage" element={<MobileView />}>
                    <Route index element={<MainPage />} />
                </Route>
                <Route path="/community" element={<MobileView />}>
                    <Route index element={<Community />} />
                </Route>
                <Route path="/community/write" element={<MobileView />}>
                    <Route index element={<PostWrite />} />
                </Route>
                <Route path="/search" element={<MobileView />}>
                    <Route index element={<SearchResultPage />} />
                </Route>
                <Route path="/party" element={<MobileView/>}>
                    <Route index element={<Party />} />
                </Route>
                <Route path="/profile" element={<MobileView />}>
                    <Route index element={<Profile />} />
                </Route>
                {/* 프로필 & 직관일지 */}
                {/* 프로필 메인 & 타 사용자 프로필 */}
                <Route path="/profile" element={<MobileView/>}>
                    <Route index element={<Profile/>}/>
                {/* 차후 User Id를 받아 /profile/:userId로 변경 예정 */}
                </Route>
                {/* 직관일지 목록 */}
                <Route path="/diary/list" element={<MobileView/>}>
                    <Route index element={<DiaryList/>}/>
                </Route>
                {/* 직관일지 작성 */}
                <Route path="/diary/newdiary" element={<MobileView/>}>
                    <Route index element={<NewDiary/>}/>
                </Route>
                {/* 직관일지 상세 */}
                <Route path="/diary/:id" element={<MobileView/>}>
                    <Route index element={<DiaryDetail/>}/>
                </Route>
                <Route path="/community/post/:postId" element={<MobileView />}>
                    <Route index element={<PostDetail />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;