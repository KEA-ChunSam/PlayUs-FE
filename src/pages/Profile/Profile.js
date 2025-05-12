import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../components/CustomCalendar/CalendarOverride.css';
import styles from './Profile.module.css';
import Modal from '../../components/Modal/Modal';
import ProfileEditModal from '../../components/Modal/ProfileEditModal/ProfileEditModal';
import WithdrawalModal from '../../components/Modal/WithdrawalModal/WithdrawalModal';

const teamLogs = {
  '2025-03-03': 'nc.png',
  '2025-03-04': 'nc.png',
  '2025-03-10': 'nc.png',
  '2025-03-11': 'nc.png',
  '2025-03-14': 'hh.png',
  '2025-03-17': 'nc.png',
  '2025-03-18': 'nc.png',
  '2025-03-19': 'nc.png',
  '2025-05-05': 'kt.png',
};

const journalEntries = [
  { date: '2025.03.03', title: '비와서 경기 종료..', image: `${process.env.PUBLIC_URL}/exImage.png` },
  { date: '2025.03.03', title: '편안한 직관~', image: null }
];

const Profile = () => {
  const today = new Date();
  const [value, setValue] = useState(today);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [nickname, setNickname] = useState('ZSJ');
  const navigate = useNavigate();
  const handleLogout = () => {
    console.log('로그아웃 확인됨');
    setShowLogoutModal(false);
    navigate('/login');
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const key = date.toLocaleDateString('sv-SE');
      if (teamLogs[key]) {
        return (
          <div className={styles.logoWrapper}>
            <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo/emblem_${teamLogs[key]}`} alt="logo" className={styles.teamLogo} />
          </div>
        );
      }
    }
    return null;
  };

  const handleDiaryList = () => {
    navigate('/diary/list')
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <img src={`${process.env.PUBLIC_URL}/Logo/profile2.png`} alt="profile" className={styles.profileImg} />
        <div className={styles.userInfo}>
          <div className={styles.username}>
            <span>{nickname}</span>
            <img
              src={`${process.env.PUBLIC_URL}/Button/create.png`}
              alt="edit"
              className={styles.editIcon}
              onClick={() => setShowProfileEditModal(true)}
            />
          </div>
          <div className={styles.email}>cho010105@gachon.ac.kr</div>
          <div className={styles.logout} onClick={() => setShowLogoutModal(true)}>
            <img src={`${process.env.PUBLIC_URL}/Button/logout.png`} alt="logout" className={styles.logoutImg}/>로그아웃
          </div>
          <div className={styles.withdrawal} onClick={() => setShowWithdrawalModal(true)}>탈퇴하기</div>
        </div>
        <img src={`${process.env.PUBLIC_URL}/Logo/TeamLogo_Big/NC.png`} alt="team" className={styles.teamImg} />
      </header>

      <section className={styles.calendarSection}>
        <h2>직관 달력</h2>
        <div className={styles.calendarSectionDiv}>
          <Calendar
              onChange={setValue}
              value={value}
              tileContent={tileContent}
              // calendarType="ISO 8601"
              formatDay={(locale, date) => date.getDate().toString()}
              locale="ko-KR"
          />
        </div>
      </section>

      <section className={styles.journalSection}>
        <div className={styles.journalHeader}>
          <h2>이번 달 나의 직관일지</h2>
          <button className={styles.writeBtn}>직관일지 작성하기</button>
          <div className={styles.logout} onClick={handleDiaryList}>더보기</div>
        </div>
        <ul className={styles.journalList}>
          {journalEntries.map((entry, idx) => (
            <li key={idx} className={styles.journalItem}>
              {entry.image && <img src={entry.image} alt="entry" className={styles.entryImg} />}
              <span className={styles.entryTitle}>{entry.title}</span>
              <span className={styles.entryDate}>{entry.date}</span>
            </li>
          ))}
        </ul>
      </section>
      {showLogoutModal && (
          <Modal
              title="로그아웃"
              message="로그아웃하시겠어요?"
              onClose={handleLogout}
          />
      )}
      {showWithdrawalModal && (
        <WithdrawalModal
          nickname={nickname}
          onCancel={() => setShowWithdrawalModal(false)}
          onWithdraw={() => {
            setShowWithdrawalModal(false);
            setShowFinalModal(true);
          }}
        />
      )}
      {showFinalModal && (
        <Modal
          title="탈퇴 완료"
          message={"탈퇴가 완료되었습니다.\n언제든 다시 돌아오세요!"}
          buttons={[
            {
              label: '확인',
              onClick: () => {
                setShowFinalModal(false);
                navigate('/login');
              }
            }
          ]}
        />
      )}
      {showProfileEditModal && (
        <ProfileEditModal
          onClose={() => setShowProfileEditModal(false)}
          onSubmit={(newNickname) => setNickname(newNickname)}
        />
      )}
    </div>
  );
};

export default Profile;
