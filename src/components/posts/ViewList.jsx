import React, { useEffect, useState } from "react";
import "./ViewList.css";
import Image from "./postUtil/Image";
import Time from "../../assets/images/Time.svg";
import People from "../../assets/images/People.svg";
function ViewList({ data }) {
  const VIEW_A_PAGE = 8; //한페이지에 보여질 갯 수
  const TOTAL_PAGES = parseInt(data.length / VIEW_A_PAGE) + 1; //페이지 갯수
  const [isView, SetView] = useState(0);
  //   console.log(VIEW_PAGES);
  const ViewNumber = () => {
    const result = [];
    for (let index = 0; index < TOTAL_PAGES; index++) {
      result.push(
        <div
          key={index}
          onClick={() => {
            SetView(index);
          }}
        >
          {index + 1}
        </div>,
      );
    }
    return result;
  };
  const viewData = () => {
    const result = [];
    for (
      let index = isView * VIEW_A_PAGE;
      index < (isView + 1) * VIEW_A_PAGE;
      index++
    ) {
      result.push(data[index]);
    }
    return result;
  };
  //isView가 할때마다 보여지는 데이터가 변동되어야 한다.
  useEffect(() => {
    // console.log(isView);
    viewData();
  }, [isView]);

  const gridClickEvent = (value) => {
    console.log(value); //TODO nav이동으로 /:id
  };

  return (
    <div>
      <div className="girdList">
        {viewData().map((value, index) => {
          return value ? (
            <div
              key={index}
              onClick={() => {
                gridClickEvent(value);
              }}
            >
              {/* {console.log(isView)} */}
              {/* {console.log(index, ">", value)} */}

              <Image
                src={value.img_url}
                alt="게시글 간단보기 이미지"
                name="simplePostImg"
              />
              <div className="simplePostType">{value.category.type}</div>
              <div className="simplePostTitle">{value.title}</div>
              <hr style={{ width: "95%" }} />
              <div className="simplePostInfos">
                <Image src={Time} alt="조리시간" name="simplePostInfoImg" />
                <div className="simplePostInfo">{value.time}</div>

                <Image src={People} alt="인원수" name="simplePostInfoImg" />
                <div className="simplePostInfo">{value.portion}</div>
              </div>
            </div>
          ) : (
            ""
          );
        })}
      </div>
      <div className="pageNumber"> {ViewNumber()} </div>
    </div>
  );
}

export default ViewList;
