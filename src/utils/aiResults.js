// AI 레시피 결과를 sessionStorage에 보관한다. 상세에서 돌아와도 다시 호출하지 않기 위해서다.
// { mode: 'search' | 'create', query, api: [], user: [], ai: [], savedIds: { tempId: 게시글 id } }
const KEY = "aiResults";

export function loadResults() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) ?? null;
  } catch {
    return null;
  }
}

export function saveResults(data) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // 저장 공간이 없거나 막혀 있어도 화면은 그대로 동작한다.
  }
}

export function clearResults() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // 위와 같다.
  }
}

export function findDraft(tempId) {
  const results = loadResults();

  if (!results) return null;

  return (
    [...(results.api ?? []), ...(results.ai ?? [])].find(
      (draft) => draft.tempId === tempId,
    ) ?? null
  );
}

// 저장한 레시피를 기록해 다시 들어와도 "저장됨"으로 보이게 하고 중복 저장을 막는다.
export function markSaved(tempId, postId) {
  const results = loadResults();

  if (!results) return;

  saveResults({
    ...results,
    savedIds: { ...(results.savedIds ?? {}), [tempId]: postId },
  });
}
