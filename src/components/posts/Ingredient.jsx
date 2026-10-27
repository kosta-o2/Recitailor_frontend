import React from "react";
import "./Ingredient.css";

function Ingredient({ ingredients, sauces }) {
  // ingredients,sauces'

  const data = ingredients ? ingredients : sauces;
  return (
    <div>
      {data === ingredients ? "재료" : "소스"}
      <ul>
        {data.map((value, key) => (
          <li key={key}>
            <p>{value}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Ingredient;
