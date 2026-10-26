import React from "react";
import styles from "./Header.module.css";
import logo from "../../assets/images/logo.png";

function Header() {
  return (
    <div className={styles.header}>
      <div className={styles.inner}>
        <a href="/" className={styles.logo}>
          <img src={logo} alt="" className={styles.logo_image} />
          <span className={styles.logo_text}>recitailor</span>
        </a>
        <nav>
          <a href="recipes/search" className={styles.link}>
            AI 레시피 검색
          </a>
          <a href="recipes/search" className={styles.link}>
            AI 레시피 생성
          </a>
          <a href="recipes/search" className={styles.link}>
            사용자 레시피
          </a>
        </nav>
        <div className={styles.account}>
          <a href="/login" className={styles.link}>
            로그인
          </a>
          <a href="/mypage" className={styles.link}>
            마이페이지
          </a>
        </div>
      </div>
    </div>
  );
}

export default Header;
