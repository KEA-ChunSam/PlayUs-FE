//미사용
import React, { useState } from "react";
import dayjs from "dayjs";

const CalendarHeader = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, "month"));
  };

  const today = dayjs();
  const weekDates = [...Array(7)].map((_, i) =>
    today.add(i - 3, "day")
  );

  const isToday = (date) => date.isSame(today, "day");

  return (
    <div className="w-full bg-white pt-2 sticky top-[64px] z-10">
      {/* 년월 + 화살표 */}
      <div className="flex justify-between items-center mb-2 px-6">
        <button onClick={handlePrevMonth}>&lt;</button>
        <div className="text-lg font-semibold">{currentDate.format("YYYY.MM")}</div>
        <button onClick={handleNextMonth}>&gt;</button>
      </div>

      {/* 날짜 블럭 + 밑줄 */}
      <div className="flex justify-between border-b border-gray-300 relative">
        {weekDates.map((date, idx) => {
          const isNow = isToday(date);
          return (
            <div
              key={idx}
              className="flex flex-col items-center w-full py-1 relative"
            >
              <span className="text-xs text-gray-600">
                {["일", "월", "화", "수", "목", "금", "토"][date.day()]}
              </span>
              <span
                className={`text-sm ${
                  isNow ? "text-blue-600 font-bold" : "text-gray-800"
                }`}
              >
                {date.date()}
              </span>
              {isNow && (
                <>
                  <span className="text-[10px] text-blue-400 mt-[2px]">오늘</span>
                  <div className="absolute bottom-0 w-4 h-[2px] bg-blue-500 rounded-full" />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarHeader;