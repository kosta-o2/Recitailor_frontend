import { passwordMessages } from "../constants/authText";
import { validationRules } from "../constants/validationRules";

// 로그인 입력 검증. 문제가 없으면 빈 문자열을 돌려준다.
export function validateLogin({ id, password }) {
  if (!id.trim() || !password) return "아이디와 비밀번호를 입력해주세요.";
  return "";
}

// 회원가입 폼 검증. checks는 중복 확인 결과(undefined | "ok" | "taken")다.
export function validateSignup(form, checks) {
  const errors = {};
  const id = form.id.trim();
  const nickname = form.nickname.trim();
  const email = form.email.trim();

  if (!validationRules.id.pattern.test(id)) {
    errors.id = validationRules.id.message;
  } else if (checks.id !== "ok") {
    errors.id = "아이디 중복 확인을 해주세요.";
  }

  if (!validationRules.password.pattern.test(form.password)) {
    errors.password = validationRules.password.message;
  }

  if (form.password !== form.passwordConfirm) {
    errors.passwordConfirm = passwordMessages.mismatch;
  }

  if (!validationRules.nickname.pattern.test(nickname)) {
    errors.nickname = validationRules.nickname.message;
  } else if (checks.nickname !== "ok") {
    errors.nickname = "닉네임 중복 확인을 해주세요.";
  }

  if (email.length > 50 || !validationRules.email.pattern.test(email)) {
    errors.email = validationRules.email.message;
  }

  return errors;
}
