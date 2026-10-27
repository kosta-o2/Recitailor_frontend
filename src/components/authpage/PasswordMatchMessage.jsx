import React from "react";
import FieldMessage from "./FieldMessage";
import { passwordMessages } from "./authPageData";

// 확인 칸에 입력이 있을 때만 일치 여부를 보여 준다.
function PasswordMatchMessage({ password, confirm }) {
  if (!confirm) return null;

  return password === confirm ? (
    <FieldMessage type="success">{passwordMessages.match}</FieldMessage>
  ) : (
    <FieldMessage type="error">{passwordMessages.mismatch}</FieldMessage>
  );
}

export default PasswordMatchMessage;
