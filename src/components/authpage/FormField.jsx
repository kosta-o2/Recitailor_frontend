import React from "react";
import styles from "./FormField.module.css";
import authStyles from "./Auth.module.css";

// children을 넘기면 기본 input 대신 그 요소(예: PasswordField)를 그린다.
function FormField({ id, label, action, message, children, ...inputProps }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        {children ?? <input id={id} className={authStyles.input} {...inputProps} />}
        {action}
      </div>
      {message}
    </div>
  );
}

export default FormField;
