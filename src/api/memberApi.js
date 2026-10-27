import api from "./axios";

// 회원 목록 조회
export async function getMembers() {
  const { data } = await api.get("/members");
  return data;
}

// 회원 한 명 조회
export async function getMember(id) {
  const { data } = await api.get(`/members/${encodeURIComponent(id)}`);

  return data;
}

// 회원 생성
export async function createMember(member) {
  const now = new Date().toISOString();

  const { data } = await api.post("/members", {
    ...member,
    status: "1",
    created_at: now,
    updated_at: now,
    deleted_at: "",
  });

  return data;
}

// 회원 정보 수정
export async function updateMember(id, changes) {
  // 아이디는 수정 대상에서 제외
  const { id: ignoredId, ...fields } = changes;

  const { data } = await api.patch(`/members/${encodeURIComponent(id)}`, {
    ...fields,
    updated_at: new Date().toISOString(),
  });

  return data;
}

// 회원 삭제
export async function deleteMember(id) {
  await api.delete(`/members/${encodeURIComponent(id)}`);
}
