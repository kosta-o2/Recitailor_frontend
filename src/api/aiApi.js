import api from "./axios";
import { createRecipePost } from "./recipePostApi";
import searchMock from "../mock/ai-search.json";
import createMock from "../mock/ai-create.json";

const USER_RECIPE_LIMIT = 3;

// 로딩 화면을 볼 수 있도록 두는 지연. 실제 API·AI를 연결하면 지운다.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// "두부, 계란, 20분 이내" → "두부|계란|20분|이내" (json-server의 _like는 정규식이다)
function toTitlePattern(query) {
  return query
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
}

// 레시피 찾기: 레시피 API 결과(목데이터) + 사용자 레시피(제목 검색, 최신순 3개)
export async function fetchSearch(query) {
  await wait(1500);

  const pattern = toTitlePattern(query);
  let user = [];

  if (pattern) {
    const { data } = await api.get("/recipes", {
      params: {
        title_like: pattern,
        _sort: "create_at",
        _order: "desc",
        _limit: USER_RECIPE_LIMIT,
      },
    });
    user = data;
  }

  return { mode: "search", query, api: searchMock.api, user, savedIds: {} };
}

// 레시피 생성: AI 결과(목데이터)
export async function fetchCreate(query) {
  await wait(2000);

  return { mode: "create", query, ai: createMock.ai, savedIds: {} };
}

// 결과 한 개(RecipeDraft)를 기존 recipes 게시글 모양으로 바꿔 저장한다.
export function saveDraft(draft, mode) {
  const toText = ({ name, quantity }) => `${name} ${quantity}`.trim();

  return createRecipePost({
    title: draft.title,
    content: draft.description,
    portion: `${draft.portion}인분`,
    time: draft.time,
    all_ingredient: {
      ingredients: draft.ingredients.filter((i) => i.type === 0).map(toText),
      sauces: draft.ingredients.filter((i) => i.type === 1).map(toText),
    },
    category: { method: draft.method, type: draft.type },
    recipes: draft.steps,
    post_type: mode === "search" ? "ai_search" : "ai_create",
  });
}
