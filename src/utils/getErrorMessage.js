// 명세서 형식 { error: { message } }과 목 서버 형식 { message }를 모두 처리한다.
export function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  return data?.error?.message ?? data?.message ?? fallback;
}
