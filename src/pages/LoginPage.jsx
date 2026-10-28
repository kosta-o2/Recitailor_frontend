import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import AuthLayout from "../components/authpage/AuthLayout";
import AuthCard from "../components/authpage/AuthCard";
import FormField from "../components/authpage/FormField";
import PasswordField from "../components/authpage/PasswordField";
import AuthSocialActions from "../components/authpage/AuthSocialActions";
import { loginText, placeholders } from "../constants/authText";
import { login } from "../api/authApi";
import { useAuthSubmit } from "../hooks/useAuthSubmit";
import { validateLogin } from "../utils/authValidation";
import styles from "./LoginPage.module.css";

function LoginPage() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const { submitting, error, setError, submit } = useAuthSubmit(
    "로그인에 실패했어요. 다시 시도해주세요.",
  );

  async function handleSubmit(event) {
    event.preventDefault();
    const message = validateLogin({ id, password });
    if (message) {
      setError(message);
      return;
    }

    await submit(async () => {
      await login({ id: id.trim(), password });
      navigate("/");
    });
  }

  return (
    <AuthLayout
      title={loginText.title}
      description={loginText.description}
      footer={
        <>
          아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </>
      }
    >
      <AuthCard as="form" compact onSubmit={handleSubmit} noValidate>
        <FormField
          id="login-id"
          label="아이디"
          type="text"
          autoComplete="username"
          maxLength={30}
          placeholder={placeholders.loginId}
          value={id}
          onChange={(event) => setId(event.target.value)}
        />
        <FormField id="login-password" label="비밀번호">
          <PasswordField
            id="login-password"
            autoComplete="current-password"
            placeholder={placeholders.loginPassword}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            visible={showPassword}
            onToggle={() => setShowPassword((prev) => !prev)}
          />
        </FormField>

        <div className={styles.login_options}>
          <label htmlFor="remember" className={styles.remember}>
            <input
              id="remember"
              type="checkbox"
              className={styles.remember_checkbox}
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            로그인 상태 유지
          </label>
          <div className={styles.find_links}>
            <Link to="/find-id">아이디 찾기</Link>
            <span className={styles.separator} aria-hidden="true">
              |
            </span>
            <Link to="/find-password">비밀번호 찾기</Link>
          </div>
        </div>

        {/* <AuthSocialActions
          error={error}
          submitting={submitting}
          submitLabel="로그인"
          googleLabel="Google로 시작하기"
        /> */}
      </AuthCard>
    </AuthLayout>
  );
}

export default LoginPage;
