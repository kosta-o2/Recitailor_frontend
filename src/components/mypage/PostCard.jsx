import { Link } from "react-router";
import { formatDate } from "../../utils/formatDate";
import styles from "./PostCard.module.css";

const heartPath = "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z";

// 게시글 카드. onToggleLike를 넘기면 오른쪽 위에 하트 버튼이 붙는다 (liked: 채워진 하트).
function PostCard({ recipe, liked = false, onToggleLike }) {
  return (
    <div className={styles.wrapper}>
      <Link to={`/post/${recipe.id}`} className={styles.card}>
        <div className={styles.thumb} aria-hidden="true">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.6" />
            <path d="M21 16l-5-5-8 8" />
          </svg>
        </div>
        <div className={styles.body}>
          <span className={styles.badge}>일반 레시피</span>
          <span className={styles.title}>{recipe.title}</span>
          <span className={styles.meta}>
            {formatDate(recipe.create_at)}
            <span aria-hidden="true" className={styles.dot}>
              ·
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="좋아요"
              role="img"
            >
              <path d={heartPath} />
            </svg>
            {recipe.likes}
          </span>
        </div>
      </Link>
      {onToggleLike && (
        <button
          type="button"
          className={styles.like}
          onClick={() => onToggleLike(recipe)}
          aria-pressed={liked}
          aria-label={liked ? "좋아요 취소" : "좋아요"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={heartPath} />
          </svg>
        </button>
      )}
    </div>
  );
}

export default PostCard;
