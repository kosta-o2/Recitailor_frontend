import React from "react";
import styles from "./SectionHeading.module.css";
function SectionHeading({ id, title, description }) {
  return (
    <div className={styles.heading}>
      <h2 id={id}>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export default SectionHeading;
