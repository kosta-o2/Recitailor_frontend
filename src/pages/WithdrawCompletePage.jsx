import { Link } from "react-router";
import styles from "../components/mypage/MyPage.module.css";

// 탈퇴 직후에는 이미 로그아웃된 상태라 로그인 없이 볼 수 있는 완료 화면이다.
function WithdrawCompletePage() {
  return (
    <div style={{ padding: "64px 0 80px" }}>
      <div role="status" className={`${styles.done} ${styles.card_narrow}`} style={{ margin: "0 auto" }}>
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ color: "var(--color-primary)" }}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12.5l2.5 2.5L16 9.5" />
        </svg>
        <span className={styles.done_title}>회원탈퇴가 완료되었어요</span>
        <span className={styles.status}>
          그동안 recitailor를 이용해주셔서 감사해요.
        </span>
        <Link to="/" className={`${styles.button} ${styles.button_primary}`}>
          홈으로
        </Link>
      </div>
    </div>
  );
}

export default WithdrawCompletePage;
