import React from 'react';
import styles from './CasterbotButton.module.css';

const CasterbotButton = ({ onClick }) => {
  return (
    <button onClick={onClick} className={styles.casterbotButton}>
      <img
        src={`${import.meta.env.BASE_URL}Button/casterbot.png`}
        alt="캐스터봇"
      />
    </button>
  );
};

export default CasterbotButton;
