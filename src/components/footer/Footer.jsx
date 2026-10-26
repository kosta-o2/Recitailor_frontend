import React from "react";
import styles from "./Footer.module.css";

function Footer({ searchHref, generateHref, userRecipesHref }) {
  const services = [
    { label: "AI 레시피 검색", href: searchHref },
    { label: "AI 레시피 생성", href: generateHref },
    { label: "사용자 레시피", href: userRecipesHref },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <a href="/" className={styles.logo}>
            recitailor
          </a>
          <p className={styles.tagline}>원하는 한 끼를, 내 취향에 맞게.</p>
          <small className={styles.copyright}>© 2026 recitailor.</small>
        </div>
        <nav className={styles.services} aria-label="푸터 서비스">
          <h2 className={styles.title}>서비스</h2>
          <ul className={styles.list}>
            {services.map((service) => (
              <li key={service.label}>
                {service.href ? (
                  <a href={service.href} className={styles.link}>
                    {service.label}
                  </a>
                ) : (
                  <span className={styles.link}>{service.label}</span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
