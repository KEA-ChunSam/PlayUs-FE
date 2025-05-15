import React from 'react';
import styles from './CasterbotButton.module.css';

const CasterbotButton = ({ onClick }) => {
  return (
    <button onClick={onClick} className={styles.casterbotButton}>
      <img
        src={`${process.env.PUBLIC_URL}/Button/casterbot.png`}
        alt="캐스터봇"
      />
    </button>
  );
};

export default CasterbotButton;