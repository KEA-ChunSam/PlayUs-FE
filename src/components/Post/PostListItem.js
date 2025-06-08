import React from "react";
import styles from "./PostListItem.module.css";

const PostListItem = ({ title, date, writerNickname, image, onClick }) => {
  const formattedDate = date?.replace(/-/g, '.');
  return (
    <li className={styles.item} onClick={onClick}>
      {image && <img src={image} alt="썸네일" className={styles.thumbnail} />}
      <span className={styles.title}>{title}</span>
      <span className={styles.time}>{formattedDate}</span>
      <span className={styles.author}>{writerNickname}</span>
    </li>
  );
};

export default PostListItem;