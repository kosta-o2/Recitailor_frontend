import api from "./axios";
import { setSessionNickname } from "./session";

// 내 정보와 활동 개수 조회
export async function getMyInfo() {
  const { data } = await api.get("/mypage");

  return data;
}

// 닉네임 수정
export async function updateNickname(nickname) {
  const { data } = await api.patch("/mypage", { nickname });

  setSessionNickname(data.member.nickname);

  return data;
}

// 비밀번호 변경
export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await api.patch("/mypage/password", {
    currentPassword,
    newPassword,
  });

  return data;
}

// 회원탈퇴
export async function withdraw(password) {
  const { data } = await api.post("/mypage/withdraw", { password });

  return data;
}

// 내가 작성한 레시피 목록
export async function getMyRecipes(page = 1) {
  const { data } = await api.get("/mypage/recipes", { params: { page } });

  return data;
}

// 좋아요한 레시피 목록
export async function getMyFavorites(page = 1) {
  const { data } = await api.get("/mypage/favorites", { params: { page } });

  return data;
}

// 좋아요 추가
export async function addFavorite(recipeId) {
  const { data } = await api.put(
    `/mypage/favorites/${encodeURIComponent(recipeId)}`,
  );

  return data;
}

// 좋아요 해제
export async function removeFavorite(recipeId) {
  const { data } = await api.delete(
    `/mypage/favorites/${encodeURIComponent(recipeId)}`,
  );

  return data;
}
