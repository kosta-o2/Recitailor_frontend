import api from "./axios";

const endpoint = "/recipes";
// 레시피 목록 조회 (JSON Server 0.17 페이지 응답)
export const getPostbyPage = async ({
  page,
  limit,
  sortBy,
  sortOrder,
  keyword = "",
}) => {
  const currentPage = Math.max(1, Number(page) || 1);

  const params = {
    page: currentPage,
    limit,
    keyword,
  };

  if (sortBy && sortOrder) {
    params.sortBy = sortBy;
    params.sortOrder = sortOrder;
  }

  const { data } = await api.get(`${endpoint}/search`, { params });

  return {
    data: data.data,
    first: 1,
    items: data.total,
    last: data.last,
    next: currentPage < data.last ? currentPage + 1 : null,
    pages: data.last,
    prev: currentPage > 1 ? currentPage - 1 : null,
  };
};

// 게시글 정보 조회
export async function getPostbyId(id) {
  const { data } = await api.get(`${endpoint}/${id}`);
  //   console.log(data);

  return data;
}

// 이미지를 함께 등록한다. 게시글은 JSON 문자열(post), 파일은 image로 한 요청에 보낸다.
// 작성자는 서버가 로그인 토큰으로 정하므로 보내지 않아도 된다.
export const createRecipePostWithImage = async (postData, imageFile) => {
  const formData = new FormData();

  formData.append("post", JSON.stringify(postData));

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await api.post(endpoint, formData);
  return response.data;
};

//게시글 삭제
export const DeletePost = async (id) => {
  const response = await api.delete(`${endpoint}/${id}`);
  return response;
};

//게시글 수정
export const updateRecipePostWithImage = async (
  id,
  postData,
  imageFile,
  removeImage = false,
) => {
  const formData = new FormData();

  formData.append("post", JSON.stringify(postData));
  formData.append("removeImage", String(removeImage));

  if (imageFile instanceof File) {
    formData.append("image", imageFile);
  }

  const response = await api.patch(`${endpoint}/${id}`, formData);

  return response.data;
};
