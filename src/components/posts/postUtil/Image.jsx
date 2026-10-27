import React from "react";
import defaultImage from "../../../assets/images/defaultImage.png";

function Image({ src, alt, name }) {
  return <img src={src ? src : defaultImage} alt={alt} className={name} />;
}

export default Image;
