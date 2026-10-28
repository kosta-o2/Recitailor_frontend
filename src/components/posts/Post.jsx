import { useEffect, useState } from "react";
import Cooking_info from "./Cooking_info";
import Ingredient from "./Ingredient";
import "./Post.css";
import Recipe from "./Recipe";
import like from "../../assets/images/like.svg";
import empty_heart from "../../assets/images/empty_heart.svg";
import Image from "./postUtil/Image";
import { useParams } from "react-router";
import { getPostbyId } from "../../api/recipePostApi";

function Post() {
  const paramsId = useParams().id;
  const [ingreVisible, setIngreVisible] = useState(false);
  const [recipeVisible, setRecipeVisible] = useState(false);
  const [post, setPost] = useState([]);
  const [isLike, setLike] = useState(false);

  useEffect(() => {
    const getDetail = async (params) => {
      const res = await getPostbyId(params);
      // console.log(res);
      setPost(res);
    };
    getDetail(paramsId);
  }, [paramsId]);
  const {
    id,
    img_url,
    title,
    content,
    portion,
    author,
    time,
    all_ingredient,
    category,
    recipes,
    create_at,
    update_at,
  } = post;
  const visible = (isVisible) => {
    return isVisible ? <p>△</p> : <p>▽</p>;
  };
  const ToggleLikeView = () => {
    return (
      <img
        src={isLike ? like : empty_heart}
        alt="좋아요 토글"
        className="toggleLike"
        onClick={() => {
          toggleLike();
          console.log(isLike);
        }}
      />
    );
  };
  const toggleLike = () => {
    //TODO 좋아요 기능 구현
    setLike(!isLike);
  };
  return (
    <>
      {post ? (
        <div className="posts">
          <div>게시글생성</div>
          <div className="header">
            <div>
              <Image src={img_url} alt="대표이미지" />
            </div>
            <div className="head">
              <div className="titles">
                <div className="title">{title}</div>
                {ToggleLikeView()}
              </div>
              <div className="titles">
                <div className="author">by {author}</div>
                <div className="create_at">
                  작성일: {create_at?.slice(0, 10)}
                </div>
              </div>
              <div className="content">{content}</div>
              <div className="info">
                <Cooking_info title="조리 시간" info={time + "분"} />
                <Cooking_info title="인원 수" info={portion} />
                {category ? (
                  <>
                    <Cooking_info title="조리 방법" info={category?.method} />
                    <Cooking_info title="조리 종류" info={category?.type} />
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>

          <hr />
          {/* 재료 */}
          <div
            className="ingredient"
            onClick={() => {
              setIngreVisible(!ingreVisible);
            }}
          >
            {all_ingredient ? (
              <>
                <div className="postInfoHeader">
                  <div className="postInfoCon">
                    <p>재료</p>
                    {"  "}
                    <p className="postInfoCount">
                      {all_ingredient.ingredients.length +
                        all_ingredient.sauces.length}
                      개
                    </p>
                  </div>
                  {visible(ingreVisible)}
                </div>
                {ingreVisible ? (
                  <div className="ingredients">
                    <Ingredient ingredients={all_ingredient.ingredients} />
                    <Ingredient sauces={all_ingredient.sauces} />
                  </div>
                ) : (
                  ""
                )}
              </>
            ) : (
              ""
            )}
          </div>

          <hr />
          {/* 레시피 */}
          <div
            className="recipe"
            onClick={() => {
              setRecipeVisible(!recipeVisible);
            }}
          >
            {recipes ? (
              <>
                <div className="postInfoHeader">
                  <div className="postInfoCon">
                    <p>레시피</p>
                    <p className="postInfoCount">{recipes.length}단계</p>
                  </div>
                  {visible(recipeVisible)}
                </div>
                {recipeVisible ? <Recipe recipe={recipes} /> : ""}
              </>
            ) : (
              ""
            )}
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
}

export default Post;
