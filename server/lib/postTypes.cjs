// 일반 글은 normal(없으면 normal로 본다), AI 결과를 저장한 글은 ai_search / ai_create
const AI_POST_TYPES = ["ai_search", "ai_create"];

function isAiPost(recipe) {
  return AI_POST_TYPES.includes(recipe.post_type);
}

// ?kind=user|ai 를 해석한다. 없으면 "all", 잘못된 값이면 null
function parseKind(value) {
  if (value === undefined || value === "") return "all";

  return value === "user" || value === "ai" ? value : null;
}

// kind에 맞는 글만 남긴다.
function filterByKind(recipes, kind) {
  if (kind === "ai") return recipes.filter(isAiPost);
  if (kind === "user") return recipes.filter((recipe) => !isAiPost(recipe));

  return recipes;
}

module.exports = { AI_POST_TYPES, isAiPost, parseKind, filterByKind };
