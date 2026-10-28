import React from "react";
import styles from "./FieldMessage.module.css";

// type: "error" | "success"
function FieldMessage({ type, children }) {
  if (type === "error") {
    return (
      <span role="alert" className={`${styles.message} ${styles.error}`}>
        {children}
      </span>
    );
  }

  return (
    <span className={`${styles.message} ${styles.success}`}>{children}</span>
  );
}

export default FieldMessage;
