import React, { useRef } from "react";

function SortButton({ cln, value, index, fun }) {
  const buttonRef = useRef();
  return (
    <button
      className={cln}
      key={index}
      onClick={() => {
        fun();
        console.log(buttonRef.current.style);
      }}
      ref={buttonRef}
    >
      {value}
    </button>
  );
}

export default SortButton;
