import styles from './PopularPost.module.css';

export default function PopularPost({ profile, nickname, title, date }) {
  return (
    <div className={styles.post}>
      <div className={styles.left}>
        <img src={profile} alt="profile" className={styles.profile} />
        <div>
          <p className={styles.nickname}>{nickname}</p>
          <p className={styles.title}>{title}</p>
        </div>
      </div>
      <span className={styles.date}>{date}</span>
    </div>
  );
}