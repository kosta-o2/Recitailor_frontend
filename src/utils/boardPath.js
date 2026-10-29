// 게시글이 속한 게시판 목록 경로. AI 글(ai_search, ai_create)은 AI 레시피 게시판이다.
export function boardPath(postType) {
  return String(postType ?? "").startsWith("ai") ? "/ai/posts" : "/post";
}
