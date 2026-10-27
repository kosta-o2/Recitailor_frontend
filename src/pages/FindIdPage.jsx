import React, { useState } from "react";
import { Link } from "react-router";
import AuthLayout from "../components/authpage/AuthLayout";
import AuthCard from "../components/authpage/AuthCard";
import FormField from "../components/authpage/FormField";
import ResultBox from "../components/authpage/ResultBox";
import authStyles from "../components/authpage/Auth.module.css";
import {
  findIdText,
  placeholders,
  dummyMembers,
} from "../components/authpage/authPageData";

// 앞 4자만 보여 주고 나머지는 *로 가린다.
function maskId(id) {
  return id.slice(0, 4) + "*".repeat(Math.max(id.length - 4, 0));
}

function formatDate(isoDate) {
  return isoDate.slice(0, 10).replaceAll("-", ".");
}

function FindIdPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [found, setFound] = useState(null);

  // 더미 목록에서 찾는다. 아이디 찾기 API가 정해지면 교체한다.
  function handleSubmit(event) {
    event.preventDefault();
    const target = email.trim().toLowerCase();
    if (!target) {
      setError("이메일을 입력해주세요.");
      return;
    }

    const member = dummyMembers.find((item) => item.email === target);
    if (!member) {
      setError(findIdText.notFound);
      return;
    }
    setError("");
    setFound(member);
  }

  return (
    <AuthLayout
      title={findIdText.title}
      description={findIdText.description}
      footer={
        <>
          비밀번호가 기억나지 않나요?{" "}
          <Link to="/find-password">비밀번호 찾기</Link>
        </>
      }
    >
      {found ? (
        <AuthCard role="status">
          <ResultBox
            label={findIdText.resultTitle}
            highlight={maskId(found.id)}
            caption={`가입일 ${formatDate(found.createdAt)}`}
          />
          <Link to="/login" className={authStyles.primary_button}>
            로그인하기
          </Link>
          <Link to="/find-password" className={authStyles.secondary_button}>
            비밀번호 찾기
          </Link>
        </AuthCard>
      ) : (
        <AuthCard as="form" onSubmit={handleSubmit} noValidate>
          <FormField
            id="find-id-email"
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
            아이디 찾기
          </button>
        </AuthCard>
      )}
    </AuthLayout>
  );
}

export default FindIdPage;
