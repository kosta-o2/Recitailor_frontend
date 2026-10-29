import { useEffect, useState } from "react";
import PageTitle from "../components/mypage/PageTitle";
import PostCard from "../components/mypage/PostCard";
import Pagination from "../components/mypage/Pagination";
import EmptyState from "../components/mypage/EmptyState";
import KindFilter from "../components/mypage/KindFilter";
import { getMyRecipes } from "../api/mypageApi";
import { getErrorMessage } from "../utils/getErrorMessage";
import styles from "../components/mypage/MyPage.module.css";

function MyPostsPage() {
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState("all");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getMyRecipes(page, kind === "all" ? undefined : kind)
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, "게시글을 불러오지 못했어요."));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, kind]);

  function handleKindChange(next) {
    setKind(next);
    setPage(1);
  }

  return (
    <>
      <PageTitle
        title="내가 작성한 게시글"
        description="내가 등록한 레시피를 최신순으로 모아봤어요."
      />

      <KindFilter value={kind} onChange={handleKindChange} />

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {!result && !error && <p className={styles.status}>불러오는 중이에요.</p>}

      {result && result.total === 0 && kind !== "all" && (
        <EmptyState
          title="해당하는 게시글이 없어요"
          description="다른 구분을 선택해 보세요."
        />
      )}

      {result && result.total === 0 && kind === "all" && (
        <EmptyState
          title="아직 작성한 레시피가 없어요"
          description="나만의 레시피를 만들어 다른 사람들과 나눠보세요."
          action={{
            label: "AI 레시피 생성하러 가기",
            to: "/",
            state: { mode: "generate", focusInput: true },
          }}
        />
      )}

      {result && result.total > 0 && (
        <div className={styles.list}>
          <span className={styles.total}>
            총 <strong>{result.total}</strong>개
          </span>
          <div className={styles.grid}>
            {result.items.map((recipe) => (
              <PostCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onChange={setPage}
          />
        </div>
      )}
    </>
  );
}

export default MyPostsPage;
