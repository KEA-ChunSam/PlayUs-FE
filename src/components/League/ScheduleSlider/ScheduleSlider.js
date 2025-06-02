// 경기 일정 날짜 선택 컴포넌트
import React, {useEffect, useRef, useState} from 'react';
import axios from 'axios';
import styles from './ScheduleSlider.module.css';
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

const getWeekDates = (centerDate) => {
    const start = new Date(centerDate);
    start.setDate(centerDate.getDate() - 3);
    return Array.from({length: 7}, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
    });
};

export default function ScheduleSlider({initialDate = new Date(), onDateSelect}) {
    const [baseDate, setBaseDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [showPicker, setShowPicker] = useState(false);
    const handleDateChange = date => setSelectedDate(date);

    const shiftDate = (days) => {
        const newDate = new Date(baseDate);
        newDate.setDate(baseDate.getDate() + days);
        setBaseDate(newDate);
    };

    const handleDateSelect = async (date) => {
        setBaseDate(date);
        setSelectedDate(date);
        if (onDateSelect) {
            try {
                const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const token = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('Access='))
                    ?.split('=')[1];
                const response = await axios.get(
                    `${process.env.REACT_APP_AI_API_BASE}/matches`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        withCredentials: true,
                        params: { date: formattedDate }
                    }
                );
                onDateSelect(response.data);
            } catch (error) {
                console.error('경기 정보 조회 실패:', error);
            }
        }
    };

    const pickerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.scheduleSlider} ref={pickerRef}>
            <div
                onClick={() => setShowPicker(true)}
                className={styles.yearMonth}
            >
                {baseDate.getFullYear()}.{String(baseDate.getMonth() + 1).padStart(2, '0')}
            </div>

            <div className={styles.dateList}>
                <button onClick={() => shiftDate(-7)}>{'<'}</button>
                {getWeekDates(baseDate).map((date) => {
                    const isToday = isSameDay(date, new Date());
                    const isSelected = isSameDay(date, selectedDate);
                    return (
                        <div
                            key={date.toDateString()}
                            onClick={() => handleDateSelect(date)}
                            className={`${styles.dateItem} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                        >
                            <div>{['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}</div>
                            <div>{date.getDate()}</div>
                        </div>
                    );
                })}
                <button onClick={() => shiftDate(7)}>{'>'}</button>
            </div>

            {showPicker && (
                <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    className={styles.pickerPopup}
                    placeholderText="날짜를 선택하세요"
                />
            )}
        </div>
    );
}