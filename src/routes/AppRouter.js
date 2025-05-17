// 페이지 라우터 컴포넌트
import React from 'react';
import {HashRouter as Router, Route, Routes} from "react-router-dom";
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
import PostDetail from '../pages/Community/PostDetail';
import Schedule from '../pages/League/Schedule';
import Party from "../pages/Party/Party";
import PartyDetail from "../pages/Party/PartyDetail";
import PartyMake from "../pages/Party/PartyMake";
import PartyApply from "../pages/Party/PartyApply";
import Chatting from "../pages/Party/Chatting/Chatting";
import ReviewParty from "../pages/Party/ReviewParty/ReviewParty";
import MatchInfo from "../pages/League/MatchInfo";
import DiaryList from "../pages/LiveMatchDiary/DiaryList";
import DiaryDetail from "../pages/LiveMatchDiary/DiaryDetail";
import NewDiary from "../pages/LiveMatchDiary/NewDiary";

function AppRouter() {
    return (
        <Router>
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
                <Route path="/community/write" element={<MobileView />}>
                    <Route index element={<PostWrite />} />
                </Route>
                <Route path="/search" element={<MobileView />}>
                    <Route index element={<SearchResultPage />} />
                </Route>
                {/* 서브메뉴 표시 탭 -> 라우트에는 필요 없어서 주석 처리함 */}
                {/*<Route path="/schedule/tab" element={<MobileView/>}>*/}
                {/*    <Route index element={<TabNav/>}/>*/}
                {/*</Route>*/}
                {/* 경기 정보 */}
                <Route path="/schedule/matchid" element={<MobileView/>}>
                    <Route index element={<MatchInfo/>}/>
                </Route>
                {/* 직관팟 목록 */}
                <Route path="/party/matchid" element={<MobileView/>}>
                    {/*나중에 path를 /party/{partyid}로 수정 예정*/}
                    <Route index element={<Party/>}/>
                </Route>
                {/* 직관팟 상세 */}
                <Route path="/party/matchid/:partyid" element={<MobileView/>}>
                    <Route index element={<PartyDetail/>}/>
                </Route>
                {/* 직관팟 만들기 */}
                <Route path="/party/newparty" element={<MobileView/>}>
                    <Route index element={<PartyMake/>}/>
                </Route>
                {/* 직관팟 신청하기 */}
                <Route path="/party/applyparty/partyid" element={<MobileView/>}>
                    <Route index element={<PartyApply/>}/>
                </Route>
                {/* 직관팟 입장 시 채팅방 */}
                <Route path="/chat/party/partyid" element={<MobileView/>}>
                    <Route index element={<Chatting/>}/>
                </Route>
                {/* 직관팟 후기 페이지 */}
                <Route path="/review/party/partyid" element={<MobileView/>}>
                    <Route index element={<ReviewParty/>}/>
                </Route>
                {/*<Route path="/schedule" element={<MobileView/>}>*/}
                {/*    <Route index element={<LeagueSchedule />} />*/}
                {/*</Route>*/}
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
        </Router>
    );
}

export default AppRouter;