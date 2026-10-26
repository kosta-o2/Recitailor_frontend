import React from "react";

function Ingredient({ props }) {
  // ingredients,sauces
  console.log("재료: ", props);
  return (
    <div>
      <div>
        {props === "ingredients" ? "재료" : "소스"}
        <ul>
          {props.map((value, key) => (
            <li key={key}>{value}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Ingredient;
