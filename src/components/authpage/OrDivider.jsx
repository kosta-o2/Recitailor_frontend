import React from "react";
import styles from "./OrDivider.module.css";

function OrDivider() {
  return (
    <div className={styles.divider} aria-hidden="true">
      <span className={styles.line} />
      <span className={styles.text}>또는</span>
      <span className={styles.line} />
    </div>
  );
}

export default OrDivider;
