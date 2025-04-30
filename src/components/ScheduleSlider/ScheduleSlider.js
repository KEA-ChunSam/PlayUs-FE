// 경기 일정 날짜 선택 컴포넌트
import React, { useState } from 'react';
import styles from './ScheduleSlider.module.css';

const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const getWeekDates = (centerDate) => {
  const start = new Date(centerDate);
  start.setDate(centerDate.getDate() - 3);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

export default function ScheduleSlider() {
  const [baseDate, setBaseDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const shiftDate = (days) => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + days);
    setBaseDate(newDate);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className={styles.scheduleSlider}>
      <div
        onClick={() => setShowPicker(true)}
        className={styles.yearMonth}
      >
        {baseDate.getFullYear()}.{String(baseDate.getMonth() + 1).padStart(2, '0')}
      </div>

      <div className={styles.dateList}>
        <button onClick={() => shiftDate(-7)}>{'◀'}</button>
        {getWeekDates(baseDate).map((date) => {
          const isToday = isSameDay(date, new Date());
          const isSelected = isSameDay(date, selectedDate);
          return (
            <div
              key={date.toDateString()}
              onClick={() => handleDateSelect(date)}
              className={`${styles.dateItem} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
            >
              <div onClick={() => setShowPicker(true)}>{['일','월','화','수','목','금','토'][date.getDay()]}</div>
              <div>{date.getDate()}</div>
            </div>
          );
        })}
        <button onClick={() => shiftDate(7)}>{'▶'}</button>
      </div>

      {showPicker && (
        <div className={styles.pickerPopup}>
          <span>날짜별 경기 일정</span>
        </div>
      )}
    </div>
  );
}