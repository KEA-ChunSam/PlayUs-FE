import React from "react";
import styles from "./PostListItem.module.css";

const PostListItem = ({ title, time, author, image, onClick }) => {
  return (
    <li className={styles.item} onClick={onClick}>
      {image && <img src={image} alt="썸네일" className={styles.thumbnail} />}
      <span className={styles.title}>{title}</span>
      <span className={styles.time}>{time}</span>
      <span className={styles.author}>{author}</span>
    </li>
  );
};

export default PostListItem;