import api from "./axios";

const endpoint = "/recipes";
// 레시피 목록 조회 (JSON Server 0.17 페이지 응답)
export async function getPostbyPage({ page, limit, sortBy, sortOrder }) {
  const currentPage = Math.max(1, Number(page) || 1);
  const params = {
    _page: page,
    _limit: limit,
  };
  if (sortBy && sortOrder) {
    params._sort = sortBy;
    params._order = sortOrder;
  }
  const { data, headers } = await api.get(endpoint, { params });

  const items = Number(headers["x-total-count"]); //아이템 최대 수
  const pages = Math.ceil(items / limit);
  return {
    data,
    first: 1,
    items,
    last: pages,
    next: currentPage < pages ? currentPage + 1 : null,
    pages,
    prev: currentPage > 1 ? currentPage - 1 : null,
  };
}

// 게시글 정보 조회
export async function getPostbyId(id) {
  const { data } = await api.get(`${endpoint}/${id}`);
  //   console.log(data);

  return data;
}
