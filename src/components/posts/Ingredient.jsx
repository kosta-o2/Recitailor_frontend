import React from "react";
import "./Ingredient.css";

function Ingredient({ ingredients, sauces }) {
  // ingredients,sauces'

  const data = ingredients ? ingredients : sauces;
  return (
    <div className="ingredient-group">
      {data === ingredients ? "재료" : "소스"}
      <ul className="ingredient-list">
        {data.map((value, key) => (
          <li className="ingredient-item" key={key}>
            <p className="ingredient-item-text">{value}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Ingredient;
