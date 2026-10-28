import React from "react";
import styles from "./AuthLayout.module.css";

function AuthLayout({ title, description, children, footer }) {
  return (
    <section className={styles.auth}>
      <div className={styles.inner}>
        <div className={styles.heading}>
          <div className={styles.point_bar} aria-hidden="true" />
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>
        {children}
        {footer && <p className={styles.bottom_text}>{footer}</p>}
      </div>
    </section>
  );
}

export default AuthLayout;
