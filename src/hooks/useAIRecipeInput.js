import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { focusRecipeInput } from "../utils/header";

export function useAIRecipeInput() {
  const location = useLocation();
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

    if (mode === "search") {
      // 여기에 검색 함수를 연결하고 value 전달
    } else {
      // 여기에 생성 함수를 연결하고 value 전달
    }
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
