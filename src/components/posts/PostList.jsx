import React, { useEffect, useReducer, useRef, useState } from "react";
import "./PostList.css";
import search from "../../assets/images/search.svg";
import ViewList from "./ViewList";
import Image from "./postUtil/Image";
import { getPostbyPage } from "../../api/recipePostApi";
import { useDispatch, useSelector } from "react-redux";
import { setPage, setSort } from "../../features/postSlice";

function PostList() {
  const [inputBox, setInputBox] = useState("");
  const inputRef = useRef();
  const [response, setResponse] = useState();
  const sortList = [
    { label: "기본", sortBy: null, sortOrder: null },
    { label: "최신 순", sortBy: "create_at", sortOrder: "desc" },
    { label: "좋아요 순", sortBy: "likes", sortOrder: "desc" },
  ];
  const PAGE_GROUP_SIZE = 5;
  const [currentPageGroup, setCurrentPageGroup] = useState(1); //현재  페이지 그룹
  const lastPage = response?.last;
  const pageGroup = Math.ceil(lastPage / PAGE_GROUP_SIZE); //페이지 그룹의 수
  const [view, SetView] = useState(1); // 현재 페이지

  const dispatch = useDispatch();
  const { sortBy, sortOrder, page, limit } = useSelector(
    (state) => state.posts,
  );
  //해당하는 페이지에 맞게 데이터 호출
  // useEffect(() => {
  //   const callPageDate = async (view) => {
  //     // data, first, items, last, next, pages, prev
  //     const res = await getPostbyPage(view);
  //     setResponse(res);
  //   };
  //   callPageDate(view);
  // }, [view]);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPostbyPage({
          page,
          limit,
          sortBy,
          sortOrder,
        });

        setResponse(data);
      } catch (error) {
        console.error("게시글 조회 실패:", error);
      }
    };

    fetchPosts();
  }, [page, limit, sortBy, sortOrder]);

  const sortEvent = (sort) => {
    dispatch(
      setSort({
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
      }),
    );
  };

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
        disabled={currentPageGroup === 1}
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
        disabled={currentPageGroup === 1}
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
            dispatch(setPage(index));
          }}
        >
          {index}
        </button>,
      );
    }
    re.push(
      <button
        key="next"
        disabled={currentPageGroup >= 4}
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
        disabled={currentPageGroup >= 4}
        onClick={() => {
          setCurrentPageGroup(pageGroup);
        }}
      >
        〉〉
      </button>,
    );
    return re;
  };

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
          return (
            <button
              className="sortList"
              onClick={() => {
                sortEvent(value);
              }}
              key={value.label}
            >
              {value.label}
            </button>
          );
        })}
      </div>
      {ViewNumber()}
      <ViewList data={response?.data} />
      <div></div>
    </div>
  );
}

export default PostList;
