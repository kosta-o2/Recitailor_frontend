import { useEffect, useState } from "react";
import { Link } from "react-router";
import PageTitle from "../components/mypage/PageTitle";
import { getMyInfo } from "../api/mypageApi";
import { formatDate } from "../utils/formatDate";
import { getErrorMessage } from "../utils/getErrorMessage";
import styles from "../components/mypage/MyPage.module.css";

function Chevron({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function MyInfoPage() {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getMyInfo()
      .then((data) => {
        if (!cancelled) setInfo(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, "회원정보를 불러오지 못했어요."));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageTitle
        title="회원정보"
        description="내 계정 정보와 활동을 한눈에 확인할 수 있어요."
      />

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {!info && !error && <p className={styles.status}>불러오는 중이에요.</p>}

      {info && (
        <>
          <div className={styles.profile}>
            <div className={styles.avatar}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
            <div className={styles.profile_body}>
              <span className={styles.nickname}>{info.member.nickname}</span>
              <dl className={styles.info}>
                <dt>아이디</dt>
                <dd>{info.member.id}</dd>
                <dt>이메일</dt>
                <dd>{info.member.email}</dd>
                <dt>가입일</dt>
                <dd>{formatDate(info.member.created_at)}</dd>
              </dl>
            </div>
            <Link to="/mypage/edit" className={styles.edit_link}>
              회원정보 수정
              <Chevron size={16} />
            </Link>
          </div>

          <div>
            <h2 className={styles.activity_title}>내 활동</h2>
            <div className={styles.activity}>
              <Link to="/mypage/posts" className={styles.activity_card}>
                <div className={styles.activity_icon}>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="5" y="3" width="14" height="18" rx="2" />
                    <path d="M9 8h6M9 12h6M9 16h4" />
                  </svg>
                </div>
                <div className={styles.activity_text}>
                  <span className={styles.activity_label}>내가 작성한 게시글</span>
                  <span className={styles.activity_count}>
                    {info.postCount}
                    <span className={styles.activity_unit}>개</span>
                  </span>
                </div>
                <span className={styles.activity_more}>
                  목록 보기
                  <Chevron size={14} />
                </span>
              </Link>

              <Link to="/mypage/likes" className={styles.activity_card}>
                <div
                  className={`${styles.activity_icon} ${styles.activity_icon_like}`}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
                  </svg>
                </div>
                <div className={styles.activity_text}>
                  <span className={styles.activity_label}>좋아요한 게시글</span>
                  <span className={styles.activity_count}>
                    {info.favoriteCount}
                    <span className={styles.activity_unit}>개</span>
                  </span>
                </div>
                <span className={styles.activity_more}>
                  목록 보기
                  <Chevron size={14} />
                </span>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default MyInfoPage;
