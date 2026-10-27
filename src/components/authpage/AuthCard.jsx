import React from "react";
import styles from "./AuthCard.module.css";

// as="form"이면 폼 카드, as="div"면 결과 카드(role="status")로 쓴다.
function AuthCard({ as = "div", compact = false, children, ...rest }) {
  const Tag = as;
  const className = compact
    ? `${styles.card} ${styles.card_compact}`
    : styles.card;

  return (
    <Tag className={className} {...rest}>
      {children}
    </Tag>
  );
}

export default AuthCard;
