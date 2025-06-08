import React from "react";
import styles from "./PostListItem.module.css";

const PostListItem = ({ title, date, createdAt, writerNickname, writerName, image, thumbnailUrl, onClick }) => {
  const formattedDate = date?.replace(/-/g, '.') || createdAt || '';
  const author = writerNickname || writerName || '익명';
  const imageUrl = image
    ? `${image}`
    : thumbnailUrl
    ? `${process.env.REACT_APP_PRESIGNED_URI}/${thumbnailUrl}`
    : null;

  return (
    <li className={styles.item} onClick={onClick}>
      {imageUrl && <img src={imageUrl} alt="썸네일" className={styles.thumbnail} />}
      <span className={styles.title}>{title}</span>
      <span className={styles.time}>{formattedDate}</span>
      <span className={styles.author}>{author}</span>
    </li>
  );
};

export default PostListItem;