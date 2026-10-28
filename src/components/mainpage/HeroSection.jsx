import React from "react";
import styles from "./HeroSection.module.css";
import HeroImage from "../../assets/images/hero-image.png";
import { useAIRecipeInput } from "../../hooks/useAiRecipeInput";

function HeroSection() {
  const {
    mode,
    keyword,
    inputRef,
    handleModeChange,
    handleKeywordChange,
    handleExecute,
  } = useAIRecipeInput();

  return (
    <section className={styles.hero}>
      <img
        src={HeroImage}
        alt="다섯 셰프가 함께 요리하는 모습"
        className={styles.hero_image}
      />

      <div className={styles.hero_text}>
        <h1 className={styles.hero_title}>오늘은 어떤 요리를 해볼까요?</h1>
        <p className={styles.hero_description}>
          가지고 있는 재료나 먹고 싶은 요리를 알려주세요.
        </p>
      </div>

      <div className={styles.search_panel}>
        <div className={styles.mode_buttons}>
          <button
            type="button"
            className={styles.mode_button}
            aria-pressed={mode === "search"}
            onClick={() => handleModeChange("search")}
          >
            레시피 검색
          </button>

          <button
            type="button"
            className={styles.mode_button}
            aria-pressed={mode === "generate"}
            onClick={() => handleModeChange("generate")}
          >
            레시피 생성
          </button>
        </div>

        <div className={styles.search_row}>
          <input
            ref={inputRef}
            type="text"
            className={styles.search_input}
            aria-label="재료나 요리명"
            placeholder="재료나 요리명을 입력하세요"
            value={keyword}
            onChange={handleKeywordChange}
          />

          <button
            type="button"
            className={styles.search_button}
            onClick={handleExecute}
          >
            {mode === "search" ? "레시피 찾기" : "AI로 만들기"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
