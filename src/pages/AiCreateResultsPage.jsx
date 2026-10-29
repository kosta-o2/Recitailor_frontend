import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import PageTitle from "../components/mypage/PageTitle";
import QueryBox from "../components/ai/QueryBox";
import RecipeTextCard from "../components/ai/RecipeTextCard";
import AiLoading from "../components/ai/AiLoading";
import ResultError from "../components/ai/ResultError";
import { fetchCreate } from "../api/aiApi";
import { clearResults, loadResults, saveResults } from "../utils/aiResults";
import styles from "./AiResultPage.module.css";

// 레시피 생성 결과. /ai/create?q=…
function AiCreateResultsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() ?? "";

  // 새로 만든 결과. 같은 조건의 결과가 sessionStorage에 있으면 그것을 쓰고 다시 만들지 않는다.
  const [attempt, setAttempt] = useState(0);
  const [fetched, setFetched] = useState(null);

  const stored = loadResults();
  const cached =
    stored?.mode === "create" && stored.query === query ? stored : null;
  const hasCache = Boolean(cached);
  const current =
    fetched?.query === query && fetched.attempt === attempt ? fetched : null;
  const data = cached ?? current?.data ?? null;

  useEffect(() => {
    if (!query || hasCache) return;

    let cancelled = false;

    fetchCreate(query)
      .then((result) => {
        if (cancelled) return;
        saveResults(result);
        setFetched({ query, attempt, data: result });
      })
      .catch(() => {
        if (!cancelled) setFetched({ query, attempt, error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [query, attempt, hasCache]);

  function handleRestart() {
    clearResults();
    navigate("/");
  }

  // 같은 조건으로 다시 만든다. 이전 결과는 지우고 새 결과로 덮어쓴다.
  function handleRegenerate() {
    clearResults();
    setAttempt((value) => value + 1);
  }

  if (!query) return <Navigate to="/" replace />;

  if (current?.error && !data) {
    return (
      <div className={styles.page}>
        <ResultError
          title="레시피를 만들지 못했어요"
          onRestart={handleRestart}
          onRetry={handleRegenerate}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <AiLoading mode="create" query={query} onCancel={handleRestart} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageTitle
        title="AI가 만든 레시피"
        description="입력한 조건으로 셰프들이 새 레시피 3가지를 만들었어요. 마음에 드는 레시피를 골라보세요."
      />
      <QueryBox mode="create" query={query} />

      <div className={styles.grid}>
        {data.ai.map((draft) => (
          <RecipeTextCard key={draft.tempId} draft={draft} />
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={handleRestart}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          처음부터 다시
        </button>
        <button type="button" className={styles.primary} onClick={handleRegenerate}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
            <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
          </svg>
          다른 레시피 만들기
        </button>
      </div>
    </div>
  );
}

export default AiCreateResultsPage;
