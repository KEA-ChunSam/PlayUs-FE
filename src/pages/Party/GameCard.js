import React from "react";
import { useNavigate } from 'react-router-dom';

const GameCard = ({
  time,
  homeTeam,
  awayTeam,
  stadium,
  mainTime,
  homeLogo,
  awayLogo,
}) => {
  const navigate = useNavigate(); 
  const handlePartyClick = () => {
    navigate('/party/tab');           
  };

  return (
    <div className="w-full flex justify-between items-start px-4 py-3 border-b">
      {/* 좌측: 시간 + 팀 */}
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">{time}</span>
        <div className="flex items-center gap-1 mt-1">
          <img src={awayLogo} alt={awayTeam} className="w-5 h-5" />
          <span className="text-sm font-medium">{awayTeam}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <img src={homeLogo} alt={homeTeam} className="w-5 h-5" />
          <span className="text-sm font-medium">{homeTeam}</span>
        </div>
      </div>

      {/* 중간: 본 경기 시간 + 경기장 */}
      <div className="flex flex-col items-center justify-center">
        <span className="text-sm text-gray-500">{mainTime}</span>
        <span className="text-sm text-gray-600">{stadium}</span>
      </div>

      {/* 우측: 버튼 */}
      <div className="flex flex-col gap-1 items-end">
        <button onClick={handlePartyClick} className="border text-sm px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100">
          직관팟
        </button>
        <button className="border text-sm px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100">
          정보
        </button>
      </div>
    </div>
  );
};

export default GameCard;