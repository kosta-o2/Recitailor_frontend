import styles from "./KindFilter.module.css";

const OPTIONS = [
  { value: "all", label: "전체" },
  { value: "user", label: "일반" },
  { value: "ai", label: "AI" },
];

// 게시글 구분 필터. value: "all" | "user" | "ai"
function KindFilter({ value, onChange }) {
  return (
    <div className={styles.filter} role="group" aria-label="게시글 구분">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.option} ${
            value === option.value ? styles.active : ""
          }`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default KindFilter;
