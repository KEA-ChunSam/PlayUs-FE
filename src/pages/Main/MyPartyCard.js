import styles from './MyPartyCard.module.css';

export default function MyPartyCard({ image, filters, title, author, gender, date, participants, maxParticipants }) {
  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <img src={image} alt="party" className={styles.image} />
        <div className={styles.right}>
        <div className={styles.tags}>
  {filters.map((tag, idx) => (
    <span
      key={idx}
      className={`${styles.tag} ${
        tag === "여자만" ? styles.red : styles.gray
      }`}
    >
      {tag}
    </span>
  ))}
</div>
          <p className={styles.title}>{title}</p>
          <p className={styles.meta}>{author} ({gender}) · {date}</p>
          <p className={styles.count}>참여자 {participants}/{maxParticipants}</p>
        </div>
      </div>
    </div>
  );
}