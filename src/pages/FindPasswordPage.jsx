import React, { useState } from "react";
import { Link } from "react-router";
import AuthLayout from "../components/authpage/AuthLayout";
import AuthCard from "../components/authpage/AuthCard";
import FormField from "../components/authpage/FormField";
import ResultBox from "../components/authpage/ResultBox";
import authStyles from "../components/authpage/Auth.module.css";
import { findPasswordText, placeholders } from "../constants/authText";

function FindPasswordPage() {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  // 재설정 메일 요청은 더미다. POST /auth/password-reset/request 형식이 정해지면 연결한다.
  function handleSubmit(event) {
    event.preventDefault();
    if (!id.trim() || !email.trim()) {
      setError("아이디와 이메일을 입력해주세요.");
      return;
    }
    setError("");
    setSent(true);
  }

  return (
    <AuthLayout
      title={findPasswordText.title}
      description={findPasswordText.description}
      footer={
        <>
          아이디가 기억나지 않나요? <Link to="/find-id">아이디 찾기</Link>
        </>
      }
    >
      {sent ? (
        <AuthCard role="status">
          <ResultBox
            title={findPasswordText.sentTitle}
            caption={findPasswordText.sentCaption}
          />
          <Link to="/login" className={authStyles.primary_button}>
            로그인하기
          </Link>
        </AuthCard>
      ) : (
        <AuthCard as="form" onSubmit={handleSubmit} noValidate>
          <FormField
            id="find-password-id"
            label="아이디"
            type="text"
            autoComplete="username"
            maxLength={30}
            placeholder={placeholders.loginId}
            value={id}
            onChange={(event) => setId(event.target.value)}
          />
          <FormField
            id="find-password-email"
            label="이메일"
            type="email"
            autoComplete="email"
            maxLength={50}
            placeholder={placeholders.email}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {error && (
            <p role="alert" className={authStyles.form_error}>
              {error}
            </p>
          )}
          <button
            type="submit"
            className={`${authStyles.primary_button} ${authStyles.submit}`}
          >
            다음
          </button>
        </AuthCard>
      )}
    </AuthLayout>
  );
}

export default FindPasswordPage;
