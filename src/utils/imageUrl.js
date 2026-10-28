// 서버가 내려준 이미지 경로(/uploads/...)를 화면에 쓸 수 있는 주소로 바꾼다.
// 백엔드 주소는 API baseURL(VITE_API_BASE_URL)에서 origin만 가져온다. (/api 제외)
export function resolveImageUrl(path) {
  if (!path || typeof path !== "string") return null;

  // 외부 URL, 번들된 정적 이미지 등은 그대로 사용
  if (!path.startsWith("/uploads/")) return path;

  try {
    return new URL(path, import.meta.env.VITE_API_BASE_URL).href;
  } catch {
    return path;
  }
}
