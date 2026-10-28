import React, { useState } from "react";
import { Link, useSearchParams } from "react-router";
import AuthLayout from "../components/authpage/AuthLayout";
import AuthCard from "../components/authpage/AuthCard";
import FormField from "../components/authpage/FormField";
import PasswordField from "../components/authpage/PasswordField";
import PasswordMatchMessage from "../components/authpage/PasswordMatchMessage";
import ResultBox from "../components/authpage/ResultBox";
import authStyles from "../components/authpage/Auth.module.css";
import { getErrorMessage } from "../utils/getErrorMessage";
import {
  resetPasswordText,
  placeholders,
  passwordMessages,
} from "../constants/authText";
import { validationRules } from "../constants/validationRules";
import { confirmPasswordReset } from "../api/authApi";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!token) {
      setError(resetPasswordText.noToken);
      return;
    }
    if (!validationRules.password.pattern.test(password)) {
      setError(validationRules.password.message);
      return;
    }
    if (password !== passwordConfirm) {
      setError(passwordMessages.mismatch);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await confirmPasswordReset({ token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(
        getErrorMessage(err, "비밀번호 변경에 실패했어요. 다시 시도해주세요."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title={resetPasswordText.title}
      description={resetPasswordText.description}
    >
      {done ? (
        <AuthCard role="status">
          <ResultBox
            title={resetPasswordText.doneTitle}
            caption={resetPasswordText.doneCaption}
          />
          <Link to="/login" className={authStyles.primary_button}>
            로그인하기
          </Link>
        </AuthCard>
      ) : (
        <AuthCard as="form" onSubmit={handleSubmit} noValidate>
          {!token && (
            <p role="alert" className={authStyles.form_error}>
              {resetPasswordText.noToken}{" "}
              <Link to="/find-password">비밀번호 찾기</Link>
            </p>
          )}
          <FormField id="reset-password" label="새 비밀번호">
            <PasswordField
              id="reset-password"
              autoComplete="new-password"
              placeholder={placeholders.password}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              visible={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
            />
          </FormField>
          <FormField
            id="reset-password-confirm"
            label="비밀번호 확인"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={placeholders.passwordConfirm}
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            message={
              <PasswordMatchMessage
                password={password}
                confirm={passwordConfirm}
              />
            }
          />
          {token && error && (
            <p role="alert" className={authStyles.form_error}>
              {error}
            </p>
          )}
          <button
            type="submit"
            className={`${authStyles.primary_button} ${authStyles.submit}`}
            disabled={!token || submitting}
          >
            비밀번호 변경
          </button>
        </AuthCard>
      )}
    </AuthLayout>
  );
}

export default ResetPasswordPage;
