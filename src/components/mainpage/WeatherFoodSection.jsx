import React from "react";
import styles from "./WeatherFoodSection.module.css";
import SectionHeading from "./SectionHeading";
import { weatherRecipes } from "./mainPageData";

function WeatherFoodSection() {
  return (
    <section className={styles.weather} aria-labelledby="weather-food-title">
      <div className={styles.weather_heading}>
        <SectionHeading
          id="weather-food-title"
          title="오늘 날씨에 어울리는 한 끼"
          description="쌀쌀한 날에는 따뜻한 한 끼 어때요?"
        />
        <p
          className={styles.weather_badge}
          aria-label="서울 날씨: 흐림, 섭씨 12도"
        >
          서울 · 흐림 · 12°C
        </p>
      </div>
      <ul className={styles.three_columns}>
        {weatherRecipes.map((recipe) => (
          <li key={recipe.id} className={styles.recipe_card}>
            <h3>{recipe.name}</h3>
            <p className={styles.recipe_description}>{recipe.description}</p>
            <p className={styles.ingredients}>
              {recipe.ingredients.join(" · ")}
            </p>
            <p className={styles.cooking_time}>약 {recipe.minutes}분</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default WeatherFoodSection;
