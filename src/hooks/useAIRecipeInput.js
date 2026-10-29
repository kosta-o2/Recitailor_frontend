import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { focusRecipeInput } from "../utils/header";
import { clearResults } from "../utils/aiResults";

export function useAIRecipeInput() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [mode, setMode] = useState("search");
  const [keyword, setKeyword] = useState("");

  // 헤더에서 전달한 요청 처리
  useEffect(() => {
    const request = location.state;

    if (!request?.focusInput) return;

    if (request.mode !== "search" && request.mode !== "generate") {
      return;
    }

    setMode(request.mode);
    focusRecipeInput(inputRef.current);
  }, [location.key, location.state]);

  // 입력창 위의 검색·생성 탭 클릭
  function handleModeChange(nextMode) {
    setMode(nextMode);
    focusRecipeInput(inputRef.current);
  }

  // 입력값 변경
  function handleKeywordChange(event) {
    setKeyword(event.target.value);
  }

  // 입력창 옆 실행 버튼 클릭
  function handleExecute() {
    const value = keyword.trim();

    if (!value) {
      focusRecipeInput(inputRef.current);
      return;
    }

    // 새 검색이므로 이전 결과를 지우고 결과 페이지로 보낸다.
    // 로그인하지 않았으면 결과 페이지의 RequireAuth가 로그인으로 보내고, 로그인 후 같은 주소로 돌아온다.
    clearResults();
    navigate(
      `/ai/${mode === "search" ? "search" : "create"}?q=${encodeURIComponent(value)}`,
    );
  }

  return {
    mode,
    keyword,
    inputRef,
    handleModeChange,
    handleKeywordChange,
    handleExecute,
  };
}
