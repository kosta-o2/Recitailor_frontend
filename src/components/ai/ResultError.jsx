import styles from "./ResultError.module.css";

// 결과를 불러오거나 만들지 못했을 때의 화면.
function ResultError({ title, onRestart, onRetry }) {
  return (
    <div role="alert" className={styles.box}>
      <div className={styles.icon} aria-hidden="true">
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>잠시 후 다시 시도해주세요.</p>
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={onRestart}>
          처음부터 다시
        </button>
        <button type="button" className={styles.primary} onClick={onRetry}>
          다시 시도
        </button>
      </div>
    </div>
  );
}

export default ResultError;
