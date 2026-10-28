import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import "./PostCreate.css";
import { createRecipePost } from "../../api/recipePostApi";

// 조리 방식
const METHOD_OPTIONS = [
  "볶음",
  "끓이기",
  "부침",
  "조림",
  "무침",
  "비빔",
  "찜",
  "절임",
  "튀김",
  "삶기",
  "굽기",
  "데치기",
  "회",
  "기타",
];

// 요리 종류
const TYPE_OPTIONS = [
  "밑반찬",
  "메인반찬",
  "국/탕",
  "찌개",
  "디저트",
  "면/만두",
  "밥/죽/떡",
  "퓨젼",
  "김치/젓갈/장류",
  "양념/소스/잼",
  "양식",
  "샐러드",
  "스프",
  "빵",
  "과자",
  "차/음료/술",
  "기타",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const PostCreate = () => {
  const nav = useNavigate();

  //수정되어야 하는것들///////
  const nickname = "채재희";
  const img_url = null;
  /////////////////////////////////

  // 기본 정보
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // 이미지
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

  // 재료 및 양념
  const [ingredients, setIngredients] = useState([""]);
  const [sauces, setSauces] = useState([""]);

  // 조리 순서
  const [recipes, setRecipes] = useState([""]);

  // 조리 정보
  const [time, setTime] = useState("");
  const [portion, setPortion] = useState("");

  // 카테고리
  const [method, setMethod] = useState("");
  const [type, setType] = useState("");

  //생성 연속 클릭 방지
  const [isSubmitting, setIsSubmitting] = useState();
  // 이미지 미리보기 URL 관리
  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [image]);

  // 이미지 선택 및 검증
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // 동일한 파일도 다시 선택할 수 있도록 초기화
    e.target.value = "";

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("JPG 또는 PNG 이미지만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("이미지 크기는 5MB 이하만 가능합니다.");
      return;
    }

    setImage(file);
  };

  const handleImageRemove = () => {
    setImage(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  // 배열 항목 추가
  const addItem = (setter) => {
    setter((prev) => [...prev, ""]);
  };

  // 배열 항목 수정
  const changeItem = (setter, index, value) => {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  // 배열 항목 삭제
  const removeItem = (setter, index) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  // 취소 버튼
  const handleCancel = () => {
    const confirmed = window.confirm(
      "작성 중인 레시피는 저장되지 않습니다.\n게시글 목록으로 이동하시겠습니까?",
    );

    if (confirmed) {
      // 프로젝트의 실제 게시글 목록 경로에 맞게 변경
      nav("/post");
    }
  };

  // 레시피 등록
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validIngredients = ingredients
      .map((item) => item.trim())
      .filter(Boolean);

    const validSauces = sauces.map((item) => item.trim()).filter(Boolean);

    const validRecipes = recipes.map((item) => item.trim()).filter(Boolean);

    if (!title.trim()) {
      alert("레시피 제목을 입력해 주세요.");
      return;
    }

    if (validIngredients.length === 0) {
      alert("재료를 한 개 이상 입력해 주세요.");
      return;
    }

    if (validRecipes.length === 0) {
      alert("조리 순서를 한 단계 이상 입력해 주세요.");
      return;
    }

    if (!method) {
      alert("조리 방식을 선택해 주세요.");
      return;
    }

    if (!type) {
      alert("요리 종류를 선택해 주세요.");
      return;
    }

    if (time.trim() && !/^\d+$/.test(time.trim())) {
      alert("조리 시간은 숫자(분)로 입력해 주세요.");
      return;
    }

    // 조회 데이터 구조에 맞춘 등록 객체
    const recipeData = {
      title: title.trim(),
      content: content.trim(),
      portion: portion.trim(),
      author: nickname,
      time: time.trim() ? Number(time.trim()) : null,
      all_ingredient: {
        ingredients: validIngredients,
        sauces: validSauces,
      },
      category: {
        method,
        type,
      },
      recipes: validRecipes,
      likes: 0,
      img_url: img_url, //이미지 url구조 완성되어야한다.
      create_at: new Date().toLocaleTimeString(),
      update_at: new Date().toLocaleTimeString(),
    };

    console.log("등록할 게시글 객체:", recipeData);
    console.log("업로드 이미지:", image);

    // TODO: Axios POST 요청 연결
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await createRecipePost(recipeData);

      console.log("게시글 생성 성공:", response);
      alert("레시피가 등록되었습니다.");

      nav("/post");
    } catch (error) {
      console.error("게시글 생성 실패:", error);

      alert(
        error.response?.data?.message || "게시글 등록 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-create">
      <form
        className="post-create-container"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* 페이지 제목 */}
        <div className="post-create-header">
          <div className="post-create-title">레시피 생성</div>
          <div className="post-create-description">
            나만의 레시피를 작성하고 공유해 보세요.
          </div>
        </div>

        {/* 대표 이미지 */}
        <div className="post-create-image">
          <div className="post-create-section-title">대표 이미지</div>

          <div className="post-create-image-upload">
            {imagePreview ? (
              <div className="post-create-image-preview">
                <img src={imagePreview} alt="레시피 대표 이미지 미리보기" />

                <div className="post-create-image-buttons">
                  <button type="button" onClick={handleImageClick}>
                    이미지 변경
                  </button>

                  <button type="button" onClick={handleImageRemove}>
                    이미지 삭제
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="post-create-image-placeholder"
                role="button"
                tabIndex={0}
                onClick={handleImageClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleImageClick();
                  }
                }}
              >
                <div className="post-create-image-icon">+</div>
                <div>이미지 업로드</div>
                <div>JPG / PNG (최대 5MB)</div>
              </div>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {/* 레시피 제목 */}
        <div className="post-create-field">
          <div className="post-create-field-title">
            레시피 제목 <span className="post-create-asterisk">*</span>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="레시피 제목을 입력하세요"
          />
        </div>

        {/* 레시피 소개 */}
        <div className="post-create-field">
          <div className="post-create-field-title">레시피 소개</div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="요리의 특징이나 맛을 소개해 주세요."
          />
        </div>

        {/* 재료 */}
        <div className="post-create-ingredients">
          <div className="post-create-section-title">
            재료 <span className="post-create-asterisk">*</span>
          </div>

          <div className="post-create-ingredients-box">
            {ingredients.map((ingredient, index) => (
              <div className="post-create-ingredient-item" key={index}>
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) =>
                    changeItem(setIngredients, index, e.target.value)
                  }
                  placeholder="예: 돼지고기 앞다리살 300g"
                />

                {ingredients.length > 1 && (
                  <button
                    type="button"
                    className="post-create-remove-ingredient"
                    onClick={() => removeItem(setIngredients, index)}
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="post-create-add-ingredient"
              onClick={() => addItem(setIngredients)}
            >
              + 재료 추가
            </button>
          </div>
        </div>

        {/* 양념 */}
        <div className="post-create-ingredients">
          <div className="post-create-section-title">양념</div>

          <div className="post-create-ingredients-box">
            {sauces.map((sauce, index) => (
              <div className="post-create-ingredient-item" key={index}>
                <input
                  type="text"
                  value={sauce}
                  onChange={(e) => changeItem(setSauces, index, e.target.value)}
                  placeholder="예: 고추장 2큰술"
                />

                {sauces.length > 1 && (
                  <button
                    type="button"
                    className="post-create-remove-ingredient"
                    onClick={() => removeItem(setSauces, index)}
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="post-create-add-ingredient"
              onClick={() => addItem(setSauces)}
            >
              + 양념 추가
            </button>
          </div>
        </div>

        {/* 조리 순서 */}
        <div className="post-create-steps">
          <div className="post-create-section-title">
            조리 순서 <span className="post-create-asterisk">*</span>
          </div>

          <div className="post-create-steps-box">
            {recipes.map((recipe, index) => (
              <div className="post-create-step-item" key={index}>
                <div className="post-create-step-number">{index + 1}</div>

                <input
                  type="text"
                  value={recipe}
                  onChange={(e) =>
                    changeItem(setRecipes, index, e.target.value)
                  }
                  placeholder={`${index + 1}번째 조리 단계를 입력하세요.`}
                />

                {recipes.length > 1 && (
                  <button
                    type="button"
                    className="post-create-remove-step"
                    onClick={() => removeItem(setRecipes, index)}
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="post-create-add-step"
              onClick={() => addItem(setRecipes)}
            >
              + 단계 추가
            </button>
          </div>
        </div>

        {/* 조리 정보 */}
        <div className="post-create-info">
          <div className="post-create-section-title">조리 정보</div>

          <div className="post-create-info-list">
            <div className="post-create-info-item">
              <div>조리 시간 (분)</div>
              <input
                type="text"
                inputMode="numeric"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="예: 25"
              />
            </div>

            <div className="post-create-info-item">
              <div>인분</div>
              <input
                type="text"
                value={portion}
                onChange={(e) => setPortion(e.target.value)}
                placeholder="예: 2인분"
              />
            </div>
          </div>
        </div>

        {/* 카테고리 */}
        <div className="post-create-category">
          <div className="post-create-section-title">카테고리</div>

          <div className="post-create-category-list">
            {/* 조리 방식 */}
            <div className="post-create-category-item">
              <div className="post-create-category-label">
                조리 방식 <span className="post-create-asterisk">*</span>
              </div>

              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="" disabled>
                  조리 방식을 선택하세요
                </option>

                {METHOD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* 요리 종류 */}
            <div className="post-create-category-item">
              <div className="post-create-category-label">
                요리 종류 <span className="post-create-asterisk">*</span>
              </div>

              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="" disabled>
                  요리 종류를 선택하세요
                </option>

                {TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="post-create-actions">
          <button
            type="button"
            className="post-create-cancel"
            onClick={handleCancel}
          >
            취소
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="post-create-submit"
          >
            {isSubmitting ? "등록 중..." : "레시피 등록"}
          </button>
        </div>

        <div className="post-create-required">
          <span className="post-create-asterisk">*</span> 필수 입력 항목
        </div>
      </form>
    </div>
  );
};

export default PostCreate;
