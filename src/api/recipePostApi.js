import api from "./axios";

const endpoint = "/recipes";
// 회원 목록 조회
export async function getPostbyPage(page) {
  const { data } = await api.get(endpoint, {
    params: {
      _page: page,
      _per_page: 8,
    },
  });
  return data;
}

// 게시글 정보 조회
export async function getPostbyId(id) {
  const { data } = await api.get(`${endpoint}/${id}`);
  //   console.log(data);

  return data;
}
