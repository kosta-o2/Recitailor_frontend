import React, { useRef, useState } from "react";
import "./PostList.css";
import db from "../../../db.json";
import search from "../../assets/images/search.svg";
import SortButton from "./postUtil/sortButton";
import ViewList from "./ViewList";
import Image from "./postUtil/Image";
function PostList() {
  const [inputBox, setInputBox] = useState("");
  const sortList = ["전체", "최신순", "좋아요 순"];
  const inputRef = useRef();
  const sortRef = useRef();
  // console.log(db.recipes);
  return (
    <div>
      <p>레시피게시판</p>
      <p>다른 사람의 레시피를 둘러보고 오늘의 메뉴를 찾아보세요.</p>
      <div className="searchBox">
        <div className="searchLine">
          <Image src={search} alt="검색" />
          <input
            type="text"
            placeholder="레시피명, 재료, 작성자로 검색  "
            onChange={(e) => {
              setInputBox(e.target.value);
            }}
            value={inputBox}
            ref={inputRef}
          />
        </div>
        <p
          onClick={() => {
            setInputBox("");
            inputRef.current.focus();
          }}
        >
          X
        </p>
      </div>

      <div className="sorts">
        <button
          className="sortList"
          onClick={() => {
            console.log(sortRef.current.ref);
          }}
          ref={sortRef}
        >
          전체
        </button>
        <button className="sortList" onClick={(e) => {}} ref={sortRef}>
          최신순
        </button>
        <button className="sortList" onClick={(e) => {}} ref={sortRef}>
          좋아요순
        </button>
      </div>
      <ViewList data={db.recipes} />
      <div></div>
    </div>
  );
}

export default PostList;
