import React from "react";
import styles from "./Header.module.css";
import logo from "../../assets/images/logo.png";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";

function Header() {
  const navigate = useNavigate();
  const { member, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <img src={logo} alt="" className={styles.logo_image} />
          <span className={styles.logo_text}>recitailor</span>
        </Link>
        <nav>
          <Link
            to="/"
            state={{ mode: "search", focusInput: true }}
            className={styles.link}
          >
            AI 레시피 찾기
          </Link>
          <Link
            to="/"
            state={{ mode: "generate", focusInput: true }}
            className={styles.link}
          >
            AI 레시피 생성
          </Link>
          <Link to="/post" className={styles.link}>
            사용자 레시피
          </Link>
          <Link to="/ai/posts" className={styles.link}>
            AI 레시피 모음
          </Link>
        </nav>
        <div className={styles.account}>
          {member ? (
            <button
              type="button"
              className={`${styles.link} ${styles.logout}`}
              onClick={handleLogout}
            >
              로그아웃
            </button>
          ) : (
            <Link to="/login" className={styles.link}>
              로그인
            </Link>
          )}
          <Link to="/mypage" className={styles.link}>
            마이페이지
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Header;
