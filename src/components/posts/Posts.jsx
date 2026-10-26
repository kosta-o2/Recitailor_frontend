import { useState } from "react";
import Cooking_info from "./Cooking_info";
import Ingredient from "./Ingredient";
import "./Posts.css";
/*{
	id: ,//index번호로 primary key
	title:, //제목
	content:, //소개글
	portion: , //몇인분인지
	author: ,//작성자 id
	time: ,//단위 (분)
	all_ingredient: {
		ingredients: [], //재료들
		sauces: [] //소스들
	 },
	category:{
		method: "", //방법: 밑반찬, 메인반찬, 국/탕, 찌개,  디저트, 면/만두, 밥/죽/떡, 퓨젼, 김치/젓갈/장류, 양념/소스/잼, 양식, 샐러드, 스프, 빵, 과자, 차/음료/술, 기타
		type: "" //종류: 볶음, 끓이기, 부침, 조림, 무침, 비빔,찜, 절임,튀김, 삶기,굽기, 데치기, 회, 기타
	},
	recipes: [], // 배열 순서대로 레시피
	create_at: "", //생성일자
	update_at:"" //수정일자
}*/

function Posts({ props }) {
  const [visible, setVisible] = useState(false);
  const {
    id,
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
  } = props;

  return (
    <div className="posts">
      <div>게시글생성</div>
      <div className="post header">
        {/* <img src="" alt="" /> */}
        <div className="head">
          <div className="title">{title}</div>
          <div className="content">{content}</div>
          <div className="info">
            <Cooking_info title="조리 시간" info={time} />
            <Cooking_info title="인원 수" info={portion} />
          </div>
        </div>
      </div>
      <hr />
      <div className="ingredient">
        <div
          className="ingredient header"
          onClick={() => {
            setVisible(!visible);
          }}
        >
          <p>재료</p>
          {visible ? <p>▷</p> : <p>▽</p>}
        </div>
        {visible ? (
          <div>
            <Ingredient props={all_ingredient.ingredients} />
            <Ingredient props={all_ingredient.sauces} />
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export default Posts;
