import { useEffect, useState } from "react";
import { logout as clearToken } from "../api/authApi";
import { getMyInfo } from "../api/mypageApi";
import { AuthContext } from "./authContextValue";

const hasToken = () => Boolean(sessionStorage.getItem("accessToken"));

// 로그인한 회원 정보를 전역으로 관리한다. 새로고침하면 토큰으로 회원 정보를 다시 불러온다.
export function AuthProvider({ children }) {
  const [member, setMember] = useState(null);
  // 토큰이 있으면 회원 정보를 확인할 때까지 로딩 상태다.
  const [loading, setLoading] = useState(hasToken());

  useEffect(() => {
    if (!hasToken()) return;

    let cancelled = false;

    getMyInfo()
      .then((data) => {
        if (!cancelled) setMember(data.member);
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function login(nextMember) {
    setMember(nextMember);
  }

  function logout() {
    clearToken();
    setMember(null);
  }

  return (
    <AuthContext.Provider value={{ member, loading, login, logout, setMember }}>
      {children}
    </AuthContext.Provider>
  );
}
