import api from "./axios";
import { clearSession, saveSession } from "./session";

// 회원가입
export async function signup({ id, nickname, email, password }) {
  const { data } = await api.post("/auth/signup", {
    id,
    nickname,
    email,
    password,
  });

  return data;
}

// 아이디 중복 확인: 사용할 수 있으면 true
export async function checkId(id) {
  const { data } = await api.get("/auth/check-id", { params: { id } });

  return data.available;
}

// 닉네임 중복 확인: 사용할 수 있으면 true
export async function checkNickname(nickname) {
  const { data } = await api.get("/auth/check-nickname", {
    params: { nickname },
  });

  return data.available;
}

// 로그인 (아이디 + 비밀번호)

export async function login({ id, password }) {
  const { data } = await api.post("/auth/login", {
    id,
    password,
  });

  saveSession(data);

  return data;
}

// 비밀번호 재설정
export async function confirmPasswordReset({ token, newPassword }) {
  const { data } = await api.post("/auth/password-reset/confirm", {
    token,
    newPassword,
  });

  clearSession();

  return data;
}

// Google 로그인/가입 (서버의 OAuth 시작 주소로 이동)
export function startGoogleLogin() {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
}

// 프론트의 로그인 토큰 삭제
export function logout() {
  clearSession();
}
