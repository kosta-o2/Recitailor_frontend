import { useEffect, useState } from "react";
import PageTitle from "../components/mypage/PageTitle";
import PostCard from "../components/mypage/PostCard";
import Pagination from "../components/mypage/Pagination";
import EmptyState from "../components/mypage/EmptyState";
import KindFilter from "../components/mypage/KindFilter";
import { addFavorite, getMyFavorites, removeFavorite } from "../api/mypageApi";
import { getErrorMessage } from "../utils/getErrorMessage";
import styles from "../components/mypage/MyPage.module.css";

function MyLikesPage() {
  const [page, setPage] = useState(1);
  const [kind, setKind] = useState("all");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  // 하트를 누른 카드의 상태. 카드는 그대로 두고 하트와 좋아요 수만 바꾼다.
  const [toggled, setToggled] = useState({});

  useEffect(() => {
    let cancelled = false;

    getMyFavorites(page, kind === "all" ? undefined : kind)
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setToggled({});
        setError("");
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, "좋아요한 게시글을 불러오지 못했어요."));
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

  async function handleToggleLike(recipe) {
    const liked = toggled[recipe.id]?.liked ?? true;

    try {
      const data = liked
        ? await removeFavorite(recipe.id)
        : await addFavorite(recipe.id);
      setToggled((prev) => ({
        ...prev,
        [recipe.id]: { liked: !liked, likes: data.likes },
      }));
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "좋아요를 바꾸지 못했어요."));
    }
  }

  return (
    <>
      <PageTitle
        title="좋아요한 게시글"
        description="좋아요를 누른 레시피를 모아봤어요. 하트를 누르면 좋아요가 취소돼요."
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
          title="아직 좋아요한 레시피가 없어요"
          description="마음에 드는 레시피에 좋아요를 누르면 여기에 모여요."
          action={{ label: "사용자 레시피 둘러보기", to: "/post" }}
        />
      )}

      {result && result.total > 0 && (
        <div className={styles.list}>
          <span className={styles.total}>
            총 <strong>{result.total}</strong>개
          </span>
          <div className={styles.grid}>
            {result.items.map((recipe) => {
              const state = toggled[recipe.id];

              return (
                <PostCard
                  key={recipe.id}
                  recipe={{ ...recipe, likes: state?.likes ?? recipe.likes }}
                  liked={state?.liked ?? true}
                  onToggleLike={handleToggleLike}
                />
              );
            })}
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

export default MyLikesPage;
