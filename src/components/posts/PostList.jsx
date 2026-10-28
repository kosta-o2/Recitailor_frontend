import React, { useEffect, useRef, useState } from "react";
import "./PostList.css";
import db from "../../../db.json";
import search from "../../assets/images/search.svg";
import SortButton from "./postUtil/sortButton";
import ViewList from "./ViewList";
import Image from "./postUtil/Image";
import { getPostbyPage } from "../../api/recipePostApi";
function PostList() {
  const [inputBox, setInputBox] = useState("");
  const sortList = ["기본", "최신 순", "좋아요 순"];
  const inputRef = useRef();

  const [response, setResponse] = useState();

  const PAGE_GROUP_SIZE = 5;
  const [currentPageGroup, setCurrentPageGroup] = useState(1); //현재  페이지 그룹
  const lastPage = response?.last;
  const pageGroup = Math.ceil(lastPage / PAGE_GROUP_SIZE); //페이지 그룹의 수
  const [view, SetView] = useState(1); // 현재 페이지
  //페이지 이동
  const ViewNumber = () => {
    const minPage = (currentPageGroup - 1) * PAGE_GROUP_SIZE + 1;
    const maxPage =
      currentPageGroup * PAGE_GROUP_SIZE < lastPage
        ? currentPageGroup * PAGE_GROUP_SIZE
        : lastPage;
    const re = [];

    re.push(
      <button
        key="first"
        onClick={() => {
          setCurrentPageGroup(1);
        }}
      >
        〈〈
      </button>,
    );
    re.push(
      <button
        key="pre"
        onClick={() => {
          setCurrentPageGroup(
            currentPageGroup === 1 ? 1 : currentPageGroup - 1,
          );
        }}
      >
        〈
      </button>,
    );
    for (let index = minPage; index <= maxPage; index++) {
      re.push(
        <button
          key={index}
          onClick={() => {
            SetView(index);
          }}
        >
          {index}
        </button>,
      );
    }
    re.push(
      <button
        key="next"
        onClick={() => {
          setCurrentPageGroup(
            currentPageGroup === pageGroup ? pageGroup : currentPageGroup + 1,
          );
        }}
      >
        〉
      </button>,
    );
    re.push(
      <button
        key="end"
        onClick={() => {
          setCurrentPageGroup(pageGroup);
        }}
      >
        〉〉
      </button>,
    );
    return re;
  };

  //해당하는 페이지에 맞게 데이터 호출
  useEffect(() => {
    const callPageDate = async (view) => {
      // data, first, items, last, next, pages, prev
      const res = await getPostbyPage(view);
      setResponse(res);
    };
    callPageDate(view);
  }, [view]);

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
        {sortList.map((value, index) => {
          <button className="sortList" onClick={() => {}} key={value}>
            {value}
          </button>;
        })}
      </div>
      {ViewNumber()}
      <ViewList data={response?.data} />
      <div></div>
    </div>
  );
}

export default PostList;
