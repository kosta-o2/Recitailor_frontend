import api from "./axios";

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

// 로그인 (아이디 + 비밀번호)
export async function login({ id, password }) {
  const { data } = await api.post("/auth/login", {
    id,
    password,
  });

  sessionStorage.setItem("accessToken", data.accessToken);

  return data;
}

// 비밀번호 재설정
export async function confirmPasswordReset({ token, newPassword }) {
  const { data } = await api.post("/auth/password-reset/confirm", {
    token,
    newPassword,
  });

  sessionStorage.removeItem("accessToken");

  return data;
}

// 프론트의 로그인 토큰 삭제
export function logout() {
  sessionStorage.removeItem("accessToken");
}
