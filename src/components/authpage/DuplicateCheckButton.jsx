import React from "react";
import authStyles from "./Auth.module.css";

function DuplicateCheckButton({ onClick }) {
  return (
    <button type="button" className={authStyles.check_button} onClick={onClick}>
      중복 확인
    </button>
  );
}

export default DuplicateCheckButton;
