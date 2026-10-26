import React from "react";
import "./Cooking_info.css";

function Cooking_info({ title, info }) {
  return (
    <div className="info">
      <div className="title">{title}</div>
      <div className="info">{info}</div>
    </div>
  );
}

export default Cooking_info;
