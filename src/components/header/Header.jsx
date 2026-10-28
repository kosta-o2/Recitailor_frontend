import React from "react";
import styles from "./Header.module.css";
import logo from "../../assets/images/logo.png";
import { Link } from "react-router";

function Header() {
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
        </nav>
        <div className={styles.account}>
          <Link to="/login" className={styles.link}>
            로그인
          </Link>
          <Link to="/mypage" className={styles.link}>
            마이페이지
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Header;
