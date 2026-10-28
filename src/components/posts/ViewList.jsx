import React, { useEffect, useState } from "react";
import "./ViewList.css";
import Image from "./postUtil/Image";
import Time from "../../assets/images/Time.svg";
import People from "../../assets/images/People.svg";
import like from "../../assets/images/like.svg";
import { useNavigate } from "react-router";
function ViewList({ data }) {
  const nav = useNavigate();
  const gridClickEvent = (value) => {
    console.log(value); //TODO nav이동으로 /:id
    nav(`/post/${value.id}`);
  };

  return (
    <>
      {data ? (
        <div className="girdList">
          {data.map((value, index) => {
            return value ? (
              <div
                key={index}
                onClick={() => {
                  gridClickEvent(value);
                }}
              >
                <Image
                  src={value.img_url}
                  alt="게시글 간단보기 이미지"
                  name="simplePostImg"
                />
                <div className="simplePostCategorys">
                  <div className="simplePostCategory">
                    {value.category.type}
                  </div>
                  <div className="simplePostCategory">
                    {value.category.method}
                  </div>
                </div>
                <div className="simplePostTitle">{value.title}</div>
                <hr style={{ width: "95%" }} />
                <div className="simplePostInfosAuthor">
                  <div className="simplePostInfos">
                    <Image src={Time} alt="조리시간" name="simplePostInfoImg" />
                    <div className="simplePostInfo">{value.time}분</div>

                    <Image src={People} alt="인원수" name="simplePostInfoImg" />
                    <div className="simplePostInfo">{value.portion}</div>
                  </div>
                  <div className="simplePostInfos">
                    <Image
                      src={like}
                      alt="좋아요 수"
                      name="simplePostInfoImg"
                    />
                    <div className="simplePostLike">{value.likes}</div>
                  </div>
                </div>
                <div className="simplePostInfosAuthor">
                  <div className="simplePostInfo"> by {value.author} </div>
                  <div className="simplePostInfo">
                    게시일: {value?.create_at?.slice(0, 10)}
                  </div>
                </div>
              </div>
            ) : (
              ""
            );
          })}
        </div>
      ) : (
        ""
      )}
    </>
  );
}

export default ViewList;
