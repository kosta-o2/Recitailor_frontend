import { useContext } from "react";
import { AuthContext } from "../context/authContextValue";

// 로그인한 회원 정보와 login/logout을 돌려준다. AuthProvider 안에서만 쓸 수 있다.
export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth는 AuthProvider 안에서 사용해야 합니다.");
  }

  return value;
}
