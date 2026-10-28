import { useState } from "react";
import { useNavigate } from "react-router";
import { validationRules } from "../constants/validationRules";
import { takenIds, takenNicknames } from "../mocks/authMocks";
import { signup } from "../api/authApi";
import { validateSignup } from "../utils/authValidation";
import { useAuthSubmit } from "./useAuthSubmit";

const initialForm = {
  id: "",
  password: "",
  passwordConfirm: "",
  nickname: "",
  email: "",
};

const duplicateTargets = {
  id: { label: "아이디", taken: takenIds },
  nickname: { label: "닉네임", taken: takenNicknames },
};

// 회원가입 폼 상태, 중복 확인, 제출을 관리한다.
export function useSignupForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  // 중복 확인 결과: undefined(미확인) | "ok" | "taken"
  const [checks, setChecks] = useState({});
  const [errors, setErrors] = useState({});
  const { submitting, error: formError, setError: setFormError, submit } =
    useAuthSubmit("회원가입에 실패했어요. 다시 시도해주세요.");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (name in duplicateTargets) {
      setChecks((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  // 더미 목록과 비교한다. 중복 확인 API가 정해지면 교체한다.
  function handleDuplicateCheck(name) {
    const value = form[name].trim();
    const rule = validationRules[name];

    if (!rule.pattern.test(value)) {
      setErrors((prev) => ({ ...prev, [name]: rule.message }));
      return;
    }

    const isTaken = duplicateTargets[name].taken.includes(value);
    setChecks((prev) => ({ ...prev, [name]: isTaken ? "taken" : "ok" }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  // 필드 아래에 보여줄 메시지. 없으면 null.
  function getFieldMessage(name) {
    if (errors[name]) return { type: "error", text: errors[name] };

    const label = duplicateTargets[name]?.label;
    if (checks[name] === "taken") {
      return { type: "error", text: `이미 사용 중인 ${label}예요.` };
    }
    if (checks[name] === "ok") {
      return { type: "success", text: `사용할 수 있는 ${label}예요.` };
    }
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateSignup(form, checks);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    await submit(async () => {
      await signup({
        id: form.id.trim(),
        nickname: form.nickname.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate("/login");
    });
  }

  return {
    form,
    showPassword,
    toggleShowPassword: () => setShowPassword((prev) => !prev),
    formError,
    submitting,
    handleChange,
    handleDuplicateCheck,
    getFieldMessage,
    handleSubmit,
  };
}
