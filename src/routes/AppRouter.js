// 페이지 라우터 컴포넌트
import React from 'react';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import MobileView from "../components/MobileView/MobileView";
import MainPage from "../pages/Main/MainPage";
import Splash from "../pages/Login/Splash";
import Login from "../pages/Login/Login";
import Community from '../components/Community';
import LeagueSchedule from '../pages/League/LeagueSchedule';
import Profile from '../components/Profile';
import TeamChoice from "../pages/InitialProfile/TeamChoice";
import SetProfile from "../pages/InitialProfile/SetProfile";
import LoginComplete from "../pages/InitialProfile/LoginComplete";
import Schedule from '../pages/Party/Schedule';
import TabNav from '../components/TabNav/TabNav';
import Party from "../pages/Party/Party";

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
                <Route path="/schedule" element={<MobileView/>}>
                    <Route index element={<Schedule />} />
                </Route>
                {/*직관팟*/}
                <Route path="/schedule/tab" element={<MobileView/>}>
                    <Route index element={<TabNav />} />
                </Route>
                <Route path="/party/partyid" element={<MobileView/>}>
                    {/*나중에 path를 /party/{partyid}로 수정 예정*/}
                    <Route index element={<Party />} />
                </Route>
                {/*<Route path="/schedule" element={<MobileView/>}>*/}
                {/*    <Route index element={<LeagueSchedule />} />*/}
                {/*</Route>*/}
                <Route path="/profile" element={<MobileView />}>
                    <Route index element={<Profile />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;