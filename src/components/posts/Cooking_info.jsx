import React from "react";
import "./Cooking_info.css";

function Cooking_info({ title, info }) {
  return (
    <div className="cooking_info">
      <div className="infotitle">{title}</div>
      <div className="info">{info}</div>
    </div>
  );
}

export default Cooking_info;
