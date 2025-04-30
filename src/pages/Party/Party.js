import React from 'react';
import CalendarHeader from "./CalendarHeader";
import GameCard from "./GameCard";

const Party = () => {
  return (
    <div className="w-full">
      {/* 상단 헤더: 별도 고정 */}
      <div className="h-[64px]" /> {/* Header 공간 확보용 */}

      {/* 캘린더 헤더 (sticky top-16 적용) */}
      <CalendarHeader />

      {/* 본문: 캘린더 아래로 margin 주기 */}
      <div className="absolute top-[136px] bottom-0 overflow-y-auto w-full px-4 pb-24">
        <GameCard
          time="13:00"
          homeTeam="키움"
          awayTeam="KT"
          stadium="고척"
          mainTime="18:30"
          homeLogo="/Logo/TeamLogo/emblem_WO.png"
          awayLogo="/Logo/TeamLogo/emblem_KT.png"
        />
        <GameCard
          time="13:00"
          homeTeam="키움"
          awayTeam="KT"
          stadium="고척"
          mainTime="18:30"
          homeLogo="/Logo/TeamLogo/emblem_WO.png"
          awayLogo="/Logo/TeamLogo/emblem_KT.png"
        />
        <GameCard
          time="13:00"
          homeTeam="키움"
          awayTeam="KT"
          stadium="고척"
          mainTime="18:30"
          homeLogo="/Logo/TeamLogo/emblem_WO.png"
          awayLogo="/Logo/TeamLogo/emblem_KT.png"
        />
        <GameCard
          time="13:00"
          homeTeam="키움"
          awayTeam="KT"
          stadium="고척"
          mainTime="18:30"
          homeLogo="/Logo/TeamLogo/emblem_WO.png"
          awayLogo="/Logo/TeamLogo/emblem_KT.png"
        />
        <GameCard
          time="13:00"
          homeTeam="키움"
          awayTeam="KT"
          stadium="고척"
          mainTime="18:30"
          homeLogo="/Logo/TeamLogo/emblem_WO.png"
          awayLogo="/Logo/TeamLogo/emblem_KT.png"
        />
        
      
        {/* 더 많은 경기 추가 가능 */}
      </div>
    </div>
  );
};

export default Party;



