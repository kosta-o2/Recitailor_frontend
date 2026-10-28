import { useState } from "react";
import { Link, useNavigate } from "react-router";
import PageTitle from "../components/mypage/PageTitle";
import authStyles from "../components/authpage/Auth.module.css";
import { useAuth } from "../hooks/useAuth";
import { useAuthSubmit } from "../hooks/useAuthSubmit";
import { withdraw } from "../api/mypageApi";
import styles from "../components/mypage/MyPage.module.css";

function WithdrawPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const { submitting, error, setError, submit } = useAuthSubmit(
    "회원탈퇴에 실패했어요. 다시 시도해주세요.",
  );

  async function handleSubmit(event) {
    event.preventDefault();
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    await submit(async () => {
      await withdraw(password);
      // 로그아웃하면 이 화면은 로그인 필요 구역을 벗어나므로 공개 완료 화면으로 보낸다.
      logout();
      navigate("/withdraw-complete", { replace: true });
    });
  }

  return (
    <>
      <PageTitle
        title="회원탈퇴"
        description="탈퇴하기 전에 아래 내용을 꼭 확인해주세요."
        back={
          <Link to="/mypage/edit" className={styles.back_link}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
            회원정보 수정으로 돌아가기
          </Link>
        }
      />

      <form
        className={`${styles.card} ${styles.card_narrow}`}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className={styles.warning}>
          <span className={styles.warning_title}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C2410C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 7v6M12 16.5v.5" />
            </svg>
            탈퇴 전 유의사항
          </span>
          <ul className={styles.warning_list}>
            <li>탈퇴하면 같은 아이디와 이메일로 다시 가입할 수 없어요.</li>
            <li>작성한 게시글은 삭제되지 않고, 작성자가 ‘탈퇴한 회원’으로 표시돼요.</li>
            <li>좋아요한 게시글 목록과 회원 정보는 더 이상 확인할 수 없어요.</li>
          </ul>
        </div>

        <div className={styles.field}>
          <label htmlFor="withdraw-password" className={styles.field_label}>
            비밀번호 확인
          </label>
          <input
            id="withdraw-password"
            type="password"
            autoComplete="current-password"
            placeholder="현재 비밀번호를 입력하세요"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            className={authStyles.input}
          />
          <span className={styles.help}>
            본인 확인을 위해 현재 비밀번호를 입력해주세요.
          </span>
        </div>

        <label htmlFor="withdraw-agree" className={styles.agree}>
          <input
            id="withdraw-agree"
            type="checkbox"
            checked={agree}
            onChange={(event) => setAgree(event.target.checked)}
          />
          위 유의사항을 모두 확인했으며, 탈퇴에 동의해요.
        </label>

        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Link
            to="/mypage/edit"
            className={`${styles.button} ${styles.button_secondary}`}
          >
            취소
          </Link>
          <button
            type="submit"
            className={`${styles.button} ${styles.button_danger}`}
            disabled={!agree || submitting}
          >
            탈퇴하기
          </button>
        </div>
      </form>
    </>
  );
}

export default WithdrawPage;
