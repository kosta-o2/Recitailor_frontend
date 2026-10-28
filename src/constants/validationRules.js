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
