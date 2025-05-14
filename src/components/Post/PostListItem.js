import React from "react";
import styles from "./PostListItem.module.css";

const PostListItem = ({ title, time, author, image, onClick }) => {
  return (
    <li className={styles.item} onClick={onClick}>
      {image && <img src={image} alt="썸네일" className={styles.thumbnail} />}
      <div className={styles.row}>
        <div className={styles.left}>
          <span className={styles.title}>{title}</span>
          <span className={styles.time}>{time}</span>
        </div>
        <span className={styles.author}>{author}</span>
      </div>
    </li>
  );
};

export default PostListItem;