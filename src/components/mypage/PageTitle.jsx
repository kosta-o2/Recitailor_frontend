import styles from "./PageTitle.module.css";

// 포인트 바 + 제목 + 설명. back에는 위에 둘 링크(예: 돌아가기)를 넘긴다.
function PageTitle({ title, description, back }) {
  return (
    <div className={styles.title_area}>
      {back}
      <div className={styles.bar} aria-hidden="true" />
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}

export default PageTitle;
