// 페이지 라우터 컴포넌트
import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import MobileView from "../components/MobileView/MobileView";
import MainPage from "../pages/Main/MainPage";
import Splash from "../pages/Login/Splash";
import Login from "../pages/Login/Login";
import Community from '../components/Community';
import Profile from '../components/Profile';
import TeamChoice from "../pages/InitialProfile/TeamChoice";
import SetProfile from "../pages/InitialProfile/SetProfile";
import LoginComplete from "../pages/InitialProfile/LoginComplete";
import Schedule from '../pages/League/Schedule';
import TabNav from '../components/TabNav/TabNav';
import Party from "../pages/Party/Party";
import PartyDetail from "../pages/Party/PartyDetail";
import PartyMake from "../pages/Party/PartyMake";
import PartyApply from "../pages/Party/PartyApply";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 로그인 & 회원가입 */}
                <Route path="/" element={<Splash/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/choice-team" element={<TeamChoice/>}/>
                <Route path="/setprofile" element={<SetProfile/>}/>
                <Route path="/login-complete" element={<LoginComplete/>}/>
                {/* 메인 화면 */}
                <Route path="/home" element={<MobileView/>}>
                    <Route index element={<MainPage/>}/>
                </Route>
                {/* 커뮤니티 */}
                <Route path="/community" element={<MobileView/>}>
                    <Route index element={<Community/>}/>
                </Route>
                {/* 일정 & 직관팟 */}
                {/* 일정 메인 */}
                <Route path="/schedule" element={<MobileView/>}>
                    <Route index element={<Schedule/>}/>
                </Route>
                {/* 서브메뉴 표시 탭 -> 라우트에는 필요 없어서 주석 처리함 */}
                {/*<Route path="/schedule/tab" element={<MobileView/>}>*/}
                {/*    <Route index element={<TabNav/>}/>*/}
                {/*</Route>*/}
                {/* 직관팟 목록 */}
                <Route path="/party/matchid" element={<MobileView/>}>
                    {/*나중에 path를 /party/{partyid}로 수정 예정*/}
                    <Route index element={<Party/>}/>
                </Route>
                {/* 직관팟 상세 */}
                <Route path="/party/matchid/partyid" element={<MobileView/>}>
                    <Route index element={<PartyDetail/>}/>
                </Route>
                {/* 직관팟 만들기 */}
                <Route path="/party/newparty" element={<MobileView/>}>
                    <Route index element={<PartyMake/>}/>
                </Route>
                {/* 직관팟 신청하기 */}
                <Route path="/Party/applyParty/partyid" element={<MobileView/>}>
                    <Route index element={<PartyApply/>}/>
                </Route>
                {/*<Route path="/schedule" element={<MobileView/>}>*/}
                {/*    <Route index element={<LeagueSchedule />} />*/}
                {/*</Route>*/}
                {/* 프로필 & 직관일지 */}
                {/* 프로필 메인 */}
                <Route path="/profile" element={<MobileView/>}>
                    <Route index element={<Profile/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;