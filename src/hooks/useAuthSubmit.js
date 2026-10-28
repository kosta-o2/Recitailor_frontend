import { useState } from "react";
import { getErrorMessage } from "../utils/getErrorMessage";

// 제출 중 상태와 에러 메시지를 관리한다. action이 던진 에러는 fallbackMessage로 바꿔 보여준다.
export function useAuthSubmit(fallbackMessage) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(action) {
    setError("");
    setSubmitting(true);
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err, fallbackMessage));
    } finally {
      setSubmitting(false);
    }
  }

  return { submitting, error, setError, submit };
}
