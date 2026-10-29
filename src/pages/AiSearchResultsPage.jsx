import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import PageTitle from "../components/mypage/PageTitle";
import QueryBox from "../components/ai/QueryBox";
import RecipeTextCard from "../components/ai/RecipeTextCard";
import UserRecipeCard from "../components/ai/UserRecipeCard";
import AiLoading from "../components/ai/AiLoading";
import ResultError from "../components/ai/ResultError";
import { fetchSearch } from "../api/aiApi";
import { clearResults, loadResults, saveResults } from "../utils/aiResults";
import styles from "./AiResultPage.module.css";

// 레시피 찾기 결과. /ai/search?q=…
function AiSearchResultsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() ?? "";

  // 새로 불러온 결과. 같은 조건의 결과가 sessionStorage에 있으면 그것을 쓰고 다시 호출하지 않는다.
  const [attempt, setAttempt] = useState(0);
  const [fetched, setFetched] = useState(null);

  const stored = loadResults();
  const cached =
    stored?.mode === "search" && stored.query === query ? stored : null;
  const hasCache = Boolean(cached);
  const current =
    fetched?.query === query && fetched.attempt === attempt ? fetched : null;
  const data = cached ?? current?.data ?? null;

  useEffect(() => {
    if (!query || hasCache) return;

    let cancelled = false;

    fetchSearch(query)
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

  function handleRetry() {
    clearResults();
    setAttempt((value) => value + 1);
  }

  if (!query) return <Navigate to="/" replace />;

  if (current?.error && !data) {
    return (
      <div className={styles.page}>
        <ResultError
          title="레시피를 불러오지 못했어요"
          onRestart={handleRestart}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.page}>
        <AiLoading mode="search" query={query} onCancel={handleRestart} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageTitle
        title="AI가 찾은 레시피"
        description="레시피 API와 사용자 레시피에서 입력한 조건에 맞는 레시피를 찾았어요."
      />
      <QueryBox mode="search" query={query} />

      <section className={styles.group} aria-labelledby="api-results">
        <div className={styles.group_head}>
          <div className={styles.group_title_row}>
            <h2 id="api-results" className={styles.group_title}>
              레시피 API에서 찾은 레시피
            </h2>
            <span className={styles.count}>{data.api.length}개</span>
          </div>
          <p className={styles.group_description}>
            공개 레시피 데이터에서 조건에 맞는 요리를 골랐어요.
          </p>
        </div>
        {data.api.length > 0 ? (
          <div className={styles.grid}>
            {data.api.map((draft) => (
              <RecipeTextCard key={draft.tempId} draft={draft} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>
            레시피 API에서 조건에 맞는 레시피를 찾지 못했어요.
          </p>
        )}
      </section>

      <section className={styles.group} aria-labelledby="user-results">
        <div className={styles.group_head}>
          <div className={styles.group_title_row}>
            <h2 id="user-results" className={styles.group_title}>
              사용자 레시피에서 찾은 레시피
            </h2>
            <span className={styles.count}>{data.user.length}개</span>
          </div>
          <p className={styles.group_description}>
            recitailor 사용자들이 올린 레시피 중에서 골랐어요.
          </p>
        </div>
        {data.user.length > 0 ? (
          <div className={styles.grid}>
            {data.user.map((recipe) => (
              <UserRecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>아직 관련된 사용자 레시피가 없어요.</p>
        )}
      </section>

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
      </div>
    </div>
  );
}

export default AiSearchResultsPage;
