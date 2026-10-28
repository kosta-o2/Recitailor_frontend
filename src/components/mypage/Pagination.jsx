import styles from "./Pagination.module.css";

const PAGES_PER_BLOCK = 5;

function Icon({ d }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

// « ‹ 1 2 3 4 5 › » — 번호는 5개씩 묶어서 보여 준다.
function Pagination({ page, totalPages, onChange }) {
  if (totalPages < 1) return null;

  const blockStart =
    Math.floor((page - 1) / PAGES_PER_BLOCK) * PAGES_PER_BLOCK + 1;
  const blockEnd = Math.min(blockStart + PAGES_PER_BLOCK - 1, totalPages);
  const numbers = [];
  for (let n = blockStart; n <= blockEnd; n++) numbers.push(n);

  return (
    <nav aria-label="페이지 이동" className={styles.pagination}>
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(1)}
        disabled={page === 1}
        aria-label="첫 페이지"
      >
        <Icon d="M11 6l-6 6 6 6M18 6l-6 6 6 6" />
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label="이전 페이지"
      >
        <Icon d="M15 6l-6 6 6 6" />
      </button>
      {numbers.map((n) => (
        <button
          key={n}
          type="button"
          className={
            n === page ? `${styles.button} ${styles.current}` : styles.button
          }
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label="다음 페이지"
      >
        <Icon d="M9 6l6 6-6 6" />
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(totalPages)}
        disabled={page === totalPages}
        aria-label="마지막 페이지"
      >
        <Icon d="M13 6l6 6-6 6M6 6l6 6-6 6" />
      </button>
    </nav>
  );
}

export default Pagination;
