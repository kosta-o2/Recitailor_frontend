// 로그인 세션(sessionStorage)에 저장하는 값
// accessToken: API 인증 토큰, memberId: members.id, nickname: members.nickname
const KEYS = ["accessToken", "memberId", "nickname"];

export function saveSession({ accessToken, member }) {
  sessionStorage.setItem("accessToken", accessToken);
  sessionStorage.setItem("memberId", member.id);
  sessionStorage.setItem("nickname", member.nickname);
}

export function setSessionNickname(nickname) {
  sessionStorage.setItem("nickname", nickname);
}

export function clearSession() {
  KEYS.forEach((key) => sessionStorage.removeItem(key));
}

// 로그인한 회원 정보. 로그인하지 않았으면 null
export function getSessionMember() {
  const id = sessionStorage.getItem("memberId");
  const nickname = sessionStorage.getItem("nickname");

  return id ? { id, nickname } : null;
}
