import React from "react";

function Recipe({ recipe }) {
  return (
    <div>
      {recipe.map((value, index) => {
        return (
          <div key={index}>
            <div>{index + 1}단계</div>
            <div>{value}</div>
          </div>
        );
      })}
    </div>
  );
}

export default Recipe;
