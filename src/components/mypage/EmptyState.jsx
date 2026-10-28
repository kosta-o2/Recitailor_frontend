import { Link } from "react-router";
import styles from "./EmptyState.module.css";

// 목록이 비었을 때 보여 주는 안내. action은 { label, to }.
function EmptyState({ title, description, action }) {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      </div>
      <span className={styles.title}>{title}</span>
      <span className={styles.description}>{description}</span>
      {action && (
        <Link to={action.to} state={action.state} className={styles.action}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
