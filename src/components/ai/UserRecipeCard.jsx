import { Link } from "react-router";
import defaultImage from "../../assets/images/defaultImage.png";
import Time from "../../assets/images/Time.svg";
import People from "../../assets/images/People.svg";
import like from "../../assets/images/like.svg";
import { resolveImageUrl } from "../../utils/imageUrl";
import styles from "./UserRecipeCard.module.css";

// 사용자 레시피 카드. 사용자 레시피 목록의 카드와 같은 모양이고 기존 게시글 상세로 이동한다.
function UserRecipeCard({ recipe }) {
  return (
    <Link to={`/post/${recipe.id}`} className={styles.card}>
      <img
        src={resolveImageUrl(recipe.img_url) ?? defaultImage}
        alt=""
        className={styles.image}
      />
      <div className={styles.tags}>
        <span className={styles.type}>{recipe.category?.type}</span>
        <span className={styles.method}>{recipe.category?.method}</span>
      </div>
      <h3 className={styles.title}>{recipe.title}</h3>
      <hr className={styles.divider} />
      <div className={styles.row}>
        <span className={styles.info}>
          <img src={Time} alt="" className={styles.icon} />
          {recipe.time}분
          <img src={People} alt="" className={`${styles.icon} ${styles.gap}`} />
          {recipe.portion}
        </span>
        <span className={styles.likes}>
          <img src={like} alt="좋아요 수" className={styles.icon} />
          {recipe.likes}
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.info}>
          by {recipe.author ? recipe.author : "삭제된 계정입니다."}
        </span>
        <span className={styles.info}>
          게시일: {recipe.create_at?.slice(0, 10)}
        </span>
      </div>
    </Link>
  );
}

export default UserRecipeCard;
