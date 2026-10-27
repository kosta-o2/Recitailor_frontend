// 페이지별 문구
export const loginText = {
  title: "다시 만나서 반가워요",
  description: "로그인하고 나만의 레시피를 이어서 만들어보세요.",
};

export const signupText = {
  title: "recitailor 시작하기",
  description: "간단한 정보만 입력하면 다섯 셰프와 함께할 수 있어요.",
};

export const findIdText = {
  title: "아이디 찾기",
  description: "가입할 때 입력한 이메일을 알려주세요.",
  resultTitle: "입력하신 이메일로 가입된 아이디예요.",
  notFound: "입력하신 이메일로 가입된 아이디가 없어요.",
};

export const findPasswordText = {
  title: "비밀번호 찾기",
  description:
    "아이디와 가입한 이메일을 확인한 뒤 새 비밀번호를 설정할 수 있어요.",
  sentTitle: "재설정 링크를 보냈어요",
  sentCaption: "메일의 링크를 눌러 새 비밀번호를 설정해주세요.",
};

export const resetPasswordText = {
  title: "비밀번호 재설정",
  description: "앞으로 사용할 새 비밀번호를 입력해주세요.",
  doneTitle: "비밀번호가 변경되었어요",
  doneCaption: "새 비밀번호로 다시 로그인해주세요.",
  noToken: "재설정 링크가 올바르지 않아요. 비밀번호 찾기를 다시 진행해주세요.",
};

export const placeholders = {
  id: "영문, 숫자 4~30자",
  loginId: "아이디를 입력하세요",
  password: "영문, 숫자, 특수문자 포함 8자 이상",
  loginPassword: "비밀번호를 입력하세요",
  passwordConfirm: "비밀번호를 한 번 더 입력하세요",
  nickname: "2~30자",
  email: "example@email.com",
};

export const passwordMessages = {
  match: "비밀번호가 일치해요.",
  mismatch: "비밀번호가 일치하지 않아요.",
};

// 회원가입 검증 규칙 (placeholder와 같은 규칙)
export const validationRules = {
  id: {
    pattern: /^[A-Za-z0-9]{4,30}$/,
    message: "아이디는 영문, 숫자 4~30자로 입력해주세요.",
  },
  password: {
    pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
    message: "비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요.",
  },
  nickname: {
    pattern: /^.{2,30}$/u,
    message: "닉네임은 2~30자로 입력해주세요.",
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "50자 이내의 올바른 이메일을 입력해주세요.",
  },
};

// 더미 데이터: 중복 확인·아이디 찾기 API가 정해지면 교체한다.
export const takenIds = ["recipe01", "chefbrio", "admin"];
export const takenNicknames = ["브리오", "세이지", "요리왕"];

export const dummyMembers = [
  { email: "recipe01@email.com", id: "recipe01", createdAt: "2026-03-14" },
  { email: "chef@email.com", id: "chefbrio", createdAt: "2026-05-02" },
];
