import React from "react";
import OrDivider from "./OrDivider";
import authStyles from "./Auth.module.css";
import { startGoogleLogin } from "../../api/authApi";

// 폼 에러, 제출 버튼, 구분선, Google 버튼을 한 묶음으로 그린다.
function AuthSocialActions({
  error,
  submitting,
  submitLabel,
  googleLabel,
  submitClassName = "",
}) {
  return (
    <>
      {error && (
        <p role="alert" className={authStyles.form_error}>
          {error}
        </p>
      )}

      <button
        type="submit"
        className={`${authStyles.primary_button} ${submitClassName}`.trim()}
        disabled={submitting}
      >
        {submitLabel}
      </button>
      <OrDivider />
      <button
        type="button"
        className={authStyles.secondary_button}
        onClick={startGoogleLogin}
      >
        {googleLabel}
      </button>
    </>
  );
}

export default AuthSocialActions;
