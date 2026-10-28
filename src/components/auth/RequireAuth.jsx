import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";

// 로그인한 회원만 통과시킨다. 아니면 로그인 페이지로 보내고, 로그인 후 원래 경로로 돌아오게 한다.
function RequireAuth({ children }) {
  const { member, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!member) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default RequireAuth;
