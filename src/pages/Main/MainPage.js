import { useState } from "react";
import ScheduleSection from "./ScheduleSection";
import PopularPost from "./PopularPost";
import MyPartyCard from "./MyPartyCard";
import styles from "./MainPage.module.css";

const sampleData = {
  "NC 다이노스": {
    schedule: { home: "NC", away: "삼성", status: "종료", score: [6, 3] },
    posts: [
      {
        profile: "/profile/user2.jpg",
        nickname: "NC팬1",
        title: "오늘 경기 너무 재밌었어요!",
        date: "2025.05.02 18:00",
      },
    ],
    parties: [
      {
        image: "/profile/party1.png",
        filters: ["승인제", "20대", "여자만"],
        title: "NC 직관팟 모집",
        author: "홍길동",
        gender: "남성",
        date: "5.5(일) 오후 2:00",
        participants: 8,
        maxParticipants: 12,
      },
    ],
  },
  "LG 트윈스": {
    schedule: { home: "LG", away: "KT", status: "예정", score: [0, 0] },
    posts: [
      {
        profile: "/profile/party1.png",
        nickname: "엘지빠돌이",
        title: "비 예보 있어서 걱정이네",
        date: "2025.05.02 15:30",
      },
    ],
    parties: [],
  },
  "삼성 라이온즈": {
    schedule: { home: "삼성", away: "SSG", status: "경기중", score: [2, 4] },
    posts: [],
    parties: [],
  },
};

export default function MainPage() {
  const selectedTeam = "NC 다이노스"; // 기본값으로 NC 다이노스 선택
  const { schedule, posts, parties } = sampleData[selectedTeam];

  return (
    <div className={styles.main_page}>
      <h2 className="font-bold text-sm mb-2">오늘의 일정</h2>
      <ScheduleSection schedule={schedule} />

      <h2 className="font-bold text-sm mt-6 mb-2">인기 포스트</h2>
      {posts.length > 0 ? (
        posts.map((post, i) => <PopularPost key={i} {...post} />)
      ) : (
        <p className="text-sm text-gray-500">게시글이 없습니다.</p>
      )}

      <h2 className="font-bold text-sm mt-6 mb-2">나의 직관팟</h2>
      {parties.length > 0 ? (
        parties.map((party, i) => <MyPartyCard key={i} {...party} />)
      ) : (
        <p className="text-sm text-gray-500">등록된 직관팟이 없습니다.</p>
      )}
    </div>
  );
}
