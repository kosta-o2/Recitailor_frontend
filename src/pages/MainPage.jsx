import React from "react";
import HeroSection from "../components/mainpage/HeroSection";
import WeatherFoodSection from "../components/mainpage/WeatherFoodSection";
import HowToUseSection from "../components/mainpage/HowToUseSection";
import FiveChefsSection from "../components/mainpage/FiveChefsSection";
import styles from "./MainPage.module.css";

export default function MainPage() {
  return (
    <div className={styles.page}>
      <HeroSection />
      <WeatherFoodSection />
      <HowToUseSection />
      <FiveChefsSection />
    </div>
  );
}
