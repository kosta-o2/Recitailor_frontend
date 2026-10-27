import React from "react";
import styles from "./ResultBox.module.css";

// label(위 작은 글씨) → title(굵은 제목) → highlight(강조 값) → caption 순서로 그린다.
function ResultBox({ label, title, highlight, caption }) {
  return (
    <div className={styles.result_box}>
      {label && <span className={styles.label}>{label}</span>}
      {title && <span className={styles.title}>{title}</span>}
      {highlight && <span className={styles.highlight}>{highlight}</span>}
      {caption && <span className={styles.caption}>{caption}</span>}
    </div>
  );
}

export default ResultBox;
