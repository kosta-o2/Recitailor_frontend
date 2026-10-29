import styles from "./QueryBox.module.css";

// 결과 화면 위에 입력한 조건을 보여준다.
function QueryBox({ mode, query }) {
  const isSearch = mode === "search";

  return (
    <div className={styles.box}>
      <span className={styles.chip}>
        {isSearch ? "레시피 찾기" : "레시피 생성"}
      </span>
      <p className={styles.text}>
        <strong>{query}</strong>
        {isSearch ? "(으)로 찾은 결과예요." : "(으)로 만든 레시피예요."}
      </p>
    </div>
  );
}

export default QueryBox;
