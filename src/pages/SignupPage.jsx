import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import AuthLayout from "../components/authpage/AuthLayout";
import AuthCard from "../components/authpage/AuthCard";
import FormField from "../components/authpage/FormField";
import FieldMessage from "../components/authpage/FieldMessage";
import PasswordField from "../components/authpage/PasswordField";
import PasswordMatchMessage from "../components/authpage/PasswordMatchMessage";
import OrDivider from "../components/authpage/OrDivider";
import authStyles from "../components/authpage/Auth.module.css";
import { getErrorMessage } from "../components/authpage/getErrorMessage";
import {
  signupText,
  placeholders,
  validationRules,
  takenIds,
  takenNicknames,
} from "../components/authpage/authPageData";
import { signup } from "../api/authApi";

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

function validate(form, checks) {
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
    errors.passwordConfirm = "비밀번호가 일치하지 않아요.";
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

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  // 중복 확인 결과: undefined(미확인) | "ok" | "taken"
  const [checks, setChecks] = useState({});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  function renderFieldMessage(name) {
    if (errors[name]) {
      return <FieldMessage type="error">{errors[name]}</FieldMessage>;
    }

    const label = duplicateTargets[name]?.label;
    if (checks[name] === "taken") {
      return (
        <FieldMessage type="error">이미 사용 중인 {label}예요.</FieldMessage>
      );
    }
    if (checks[name] === "ok") {
      return (
        <FieldMessage type="success">사용할 수 있는 {label}예요.</FieldMessage>
      );
    }
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form, checks);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await signup({
        id: form.id.trim(),
        nickname: form.nickname.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate("/login");
    } catch (err) {
      setFormError(
        getErrorMessage(err, "회원가입에 실패했어요. 다시 시도해주세요."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogleSignup() {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  }

  return (
    <AuthLayout
      title={signupText.title}
      description={signupText.description}
      footer={
        <>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </>
      }
    >
      <AuthCard as="form" onSubmit={handleSubmit} noValidate>
        <FormField
          id="signup-id"
          name="id"
          label="아이디"
          type="text"
          autoComplete="username"
          maxLength={30}
          placeholder={placeholders.id}
          value={form.id}
          onChange={handleChange}
          action={
            <button
              type="button"
              className={authStyles.check_button}
              onClick={() => handleDuplicateCheck("id")}
            >
              중복 확인
            </button>
          }
          message={renderFieldMessage("id")}
        />

        <FormField
          id="signup-password"
          label="비밀번호"
          message={renderFieldMessage("password")}
        >
          <PasswordField
            id="signup-password"
            name="password"
            autoComplete="new-password"
            placeholder={placeholders.password}
            value={form.password}
            onChange={handleChange}
            visible={showPassword}
            onToggle={() => setShowPassword((prev) => !prev)}
          />
        </FormField>

        <FormField
          id="signup-password-confirm"
          name="passwordConfirm"
          label="비밀번호 확인"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder={placeholders.passwordConfirm}
          value={form.passwordConfirm}
          onChange={handleChange}
          message={
            <PasswordMatchMessage
              password={form.password}
              confirm={form.passwordConfirm}
            />
          }
        />

        <FormField
          id="signup-nickname"
          name="nickname"
          label="닉네임"
          type="text"
          autoComplete="nickname"
          maxLength={30}
          placeholder={placeholders.nickname}
          value={form.nickname}
          onChange={handleChange}
          action={
            <button
              type="button"
              className={authStyles.check_button}
              onClick={() => handleDuplicateCheck("nickname")}
            >
              중복 확인
            </button>
          }
          message={renderFieldMessage("nickname")}
        />

        <FormField
          id="signup-email"
          name="email"
          label="이메일"
          type="email"
          autoComplete="email"
          maxLength={50}
          placeholder={placeholders.email}
          value={form.email}
          onChange={handleChange}
          message={renderFieldMessage("email")}
        />

        {formError && (
          <p role="alert" className={authStyles.form_error}>
            {formError}
          </p>
        )}

        <button
          type="submit"
          className={`${authStyles.primary_button} ${authStyles.submit}`}
          disabled={submitting}
        >
          가입하기
        </button>
        <OrDivider />
        <button
          type="button"
          className={authStyles.secondary_button}
          onClick={handleGoogleSignup}
        >
          Google로 가입하기
        </button>
      </AuthCard>
    </AuthLayout>
  );
}

export default SignupPage;
