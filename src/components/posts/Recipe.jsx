import React from "react";

function Recipe({ recipe }) {
  return (
    <div className="recipe-steps">
      {recipe.map((value, index) => {
        return (
          <div className="recipe-step" key={index}>
            <div className="recipe-step-number">{index + 1}단계</div>
            <div className="recipe-step-description">{value}</div>
          </div>
        );
      })}
    </div>
  );
}

export default Recipe;
