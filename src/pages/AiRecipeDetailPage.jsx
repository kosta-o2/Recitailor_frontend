import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { saveDraft } from "../api/aiApi";
import { findDraft, loadResults, markSaved } from "../utils/aiResults";
import { getErrorMessage } from "../utils/getErrorMessage";
import styles from "./AiRecipeDetailPage.module.css";

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

function ToggleHeader({ id, label, count, open, onToggle }) {
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-expanded={open}
      aria-controls={id}
      onClick={onToggle}
    >
      <span className={styles.toggle_label}>
        {label}
        <span className={styles.count}>{count}</span>
      </span>
      <svg {...iconProps} className={styles.chevron}>
        <path d={open ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} />
      </svg>
    </button>
  );
}

function IngredientColumn({ title, items, dotClass }) {
  return (
    <div className={styles.column}>
      <span className={styles.column_title}>{title}</span>
      {items.map((item, index) => (
        <div key={`${item.name}-${index}`} className={styles.pill}>
          <span className={styles.pill_name}>
            <span className={dotClass} aria-hidden="true" />
            {item.name}
          </span>
          <span className={styles.pill_quantity}>{item.quantity}</span>
        </div>
      ))}
    </div>
  );
}

// AI 레시피 상세 (저장 전). 결과 카드에서 들어오며 [저장하기]를 눌러야 내 게시글로 저장된다.
function AiRecipeDetailPage() {
  const { tempId } = useParams();
  const navigate = useNavigate();

  const draft = findDraft(tempId);
  const results = loadResults();

  const [savedPostId, setSavedPostId] = useState(
    results?.savedIds?.[tempId] ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ingredientsOpen, setIngredientsOpen] = useState(true);
  const [stepsOpen, setStepsOpen] = useState(true);
  const savingRef = useRef(false);

  const isSaved = savedPostId !== null;
  const mode = results?.mode ?? "create";
  const backTo = results
    ? `/ai/${results.mode}?q=${encodeURIComponent(results.query)}`
    : "/";

  if (!draft) {
    return (
      <div className={styles.page}>
        <div role="alert" className={styles.not_found}>
          <h1 className={styles.not_found_title}>레시피를 찾을 수 없어요</h1>
          <p className={styles.not_found_text}>
            결과가 사라졌거나 잘못된 주소예요. 처음부터 다시 찾아주세요.
          </p>
          <button
            type="button"
            className={styles.primary}
            onClick={() => navigate("/")}
          >
            메인으로 가기
          </button>
        </div>
      </div>
    );
  }

  const ingredients = draft.ingredients.filter((item) => item.type === 0);
  const sauces = draft.ingredients.filter((item) => item.type === 1);

  async function handleSave() {
    if (savingRef.current || isSaved) return;

    savingRef.current = true;
    setSaving(true);
    setError("");

    try {
      const post = await saveDraft(draft, mode);
      markSaved(tempId, post.id);
      setSavedPostId(post.id);
    } catch (err) {
      setError(getErrorMessage(err, "레시피를 저장하지 못했어요."));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <Link to={backTo} className={styles.back}>
        <svg {...iconProps} width={14} height={14}>
          <path d="M15 6l-6 6 6 6" />
        </svg>
        결과 목록으로
      </Link>

      <article className={styles.card}>
        <div className={styles.head}>
          <div className={styles.tags}>
            <span className={styles.source}>
              {draft.source === "api" ? "레시피 API" : "AI 생성 레시피"}
            </span>
            <span className={styles.type}>{draft.type}</span>
            <span className={styles.method}>{draft.method}</span>
          </div>
          <h1 className={styles.title}>{draft.title}</h1>
          <p className={styles.description}>{draft.description}</p>

          <div className={styles.info}>
            <div className={styles.info_item}>
              <span className={styles.info_label}>조리 시간</span>
              <span className={styles.info_value}>{draft.time}분</span>
            </div>
            <div className={styles.info_item}>
              <span className={styles.info_label}>인원 수</span>
              <span className={styles.info_value}>{draft.portion}인분</span>
            </div>
            <div className={styles.info_item}>
              <span className={styles.info_label}>조리 방법</span>
              <span className={styles.info_value}>{draft.method}</span>
            </div>
            <div className={styles.info_item}>
              <span className={styles.info_label}>조리 종류</span>
              <span className={styles.info_value}>{draft.type}</span>
            </div>
          </div>
        </div>

        {isSaved ? (
          <div role="status" className={styles.saved_notice}>
            <svg {...iconProps} className={styles.notice_icon}>
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>
              내 게시글에 저장했어요.{" "}
              <Link to="/mypage/posts" className={styles.saved_link}>
                내 게시글에서 보기
              </Link>
            </span>
          </div>
        ) : (
          <div className={styles.notice}>
            <svg {...iconProps} className={styles.notice_icon}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 11v5M12 7.5v.5" />
            </svg>
            <span>
              아직 저장하지 않은 레시피예요. 저장하면{" "}
              <strong>마이페이지 › 내가 작성한 게시글</strong>에서 다시 볼 수
              있어요.
            </span>
          </div>
        )}

        <section className={styles.section}>
          <ToggleHeader
            id="ai-ingredients"
            label="재료"
            count={`${draft.ingredients.length}개`}
            open={ingredientsOpen}
            onToggle={() => setIngredientsOpen((value) => !value)}
          />
          {ingredientsOpen && (
            <div id="ai-ingredients" className={styles.columns}>
              <IngredientColumn
                title="재료"
                items={ingredients}
                dotClass={styles.dot_ingredient}
              />
              <IngredientColumn
                title="소스"
                items={sauces}
                dotClass={styles.dot_sauce}
              />
            </div>
          )}
        </section>

        <section className={styles.section}>
          <ToggleHeader
            id="ai-steps"
            label="레시피"
            count={`${draft.steps.length}단계`}
            open={stepsOpen}
            onToggle={() => setStepsOpen((value) => !value)}
          />
          {stepsOpen && (
            <ol id="ai-steps" className={styles.steps}>
              {draft.steps.map((step, index) => (
                <li key={index} className={styles.step}>
                  <span className={styles.step_number} aria-hidden="true">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </article>

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => navigate(backTo)}
        >
          목록으로
        </button>
        <button
          type="button"
          className={isSaved ? styles.done : styles.primary}
          onClick={handleSave}
          disabled={saving || isSaved}
        >
          {isSaved ? (
            "저장됨 ✓"
          ) : (
            <>
              <svg {...iconProps}>
                <path d="M6 3h12v18l-6-4-6 4z" />
              </svg>
              {saving ? "저장하는 중…" : "저장하기"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default AiRecipeDetailPage;
