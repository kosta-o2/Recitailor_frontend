import React from "react";
import styles from "./PasswordField.module.css";
import authStyles from "./Auth.module.css";

// visible 상태는 부모가 관리해서 비밀번호 확인 칸과 함께 전환한다.
function PasswordField({ id, visible, onToggle, ...inputProps }) {
  return (
    <div className={styles.password_field}>
      <input
        id={id}
        type={visible ? "text" : "password"}
        className={`${authStyles.input} ${styles.password_input}`}
        {...inputProps}
      />
      <button
        type="button"
        className={styles.toggle_button}
        onClick={onToggle}
        aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
      >
        {visible ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 3l18 18" />
            <path d="M10.6 5.1A9.9 9.9 0 0 1 12 5c5 0 9 4.5 10 7a12.6 12.6 0 0 1-3.2 4.3" />
            <path d="M6.6 6.6C4.4 8 2.8 10.1 2 12c1 2.5 5 7 10 7a9.8 9.8 0 0 0 5.4-1.6" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default PasswordField;
