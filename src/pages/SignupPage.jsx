import React from "react";
import { Link } from "react-router";
import AuthLayout from "../components/authpage/AuthLayout";
import AuthCard from "../components/authpage/AuthCard";
import FormField from "../components/authpage/FormField";
import FieldMessage from "../components/authpage/FieldMessage";
import PasswordField from "../components/authpage/PasswordField";
import PasswordMatchMessage from "../components/authpage/PasswordMatchMessage";
import DuplicateCheckButton from "../components/authpage/DuplicateCheckButton";
import authStyles from "../components/authpage/Auth.module.css";
import { signupText, placeholders } from "../constants/authText";
import { useSignupForm } from "../hooks/useSignupForm";

function SignupPage() {
  const {
    form,
    showPassword,
    toggleShowPassword,
    formError,
    submitting,
    handleChange,
    handleDuplicateCheck,
    getFieldMessage,
    handleSubmit,
  } = useSignupForm();

  function renderFieldMessage(name) {
    const message = getFieldMessage(name);
    if (!message) return null;
    return <FieldMessage type={message.type}>{message.text}</FieldMessage>;
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
            <DuplicateCheckButton onClick={() => handleDuplicateCheck("id")} />
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
            onToggle={toggleShowPassword}
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
            <DuplicateCheckButton
              onClick={() => handleDuplicateCheck("nickname")}
            />
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
      </AuthCard>
    </AuthLayout>
  );
}

export default SignupPage;
