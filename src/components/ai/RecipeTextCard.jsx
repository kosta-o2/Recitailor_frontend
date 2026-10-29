import { Link } from "react-router";
import Time from "../../assets/images/Time.svg";
import People from "../../assets/images/People.svg";
import styles from "./RecipeTextCard.module.css";

// 레시피 API·AI 생성 결과 카드. 이미지 없이 글자만 보여주고 카드 전체가 상세로 가는 링크다.
function RecipeTextCard({ draft }) {
  return (
    <Link to={`/ai/recipes/${draft.tempId}`} className={styles.card}>
      <div className={styles.tags}>
        <span className={styles.type}>{draft.type}</span>
        <span className={styles.method}>{draft.method}</span>
      </div>
      <h3 className={styles.title}>{draft.title}</h3>
      <p className={styles.description}>{draft.description}</p>
      <div className={styles.footer}>
        <span className={styles.meta}>
          <img src={Time} alt="" className={styles.icon} />
          {draft.time}분
          <img src={People} alt="" className={`${styles.icon} ${styles.gap}`} />
          {draft.portion}인분
        </span>
        <span className={styles.more}>자세히 보기 ›</span>
      </div>
    </Link>
  );
}

export default RecipeTextCard;
