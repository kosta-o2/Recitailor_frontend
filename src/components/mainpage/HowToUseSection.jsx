import React from "react";
import styles from "./HowToUseSection.module.css";
import SectionHeading from "./SectionHeading";
import { usageSteps } from "./mainPageData";

function HowToUseSection() {
  return (
    <section className={styles.how_to} aria-labelledby="how-to-title">
      <SectionHeading
        id="how-to-title"
        title="recitailor 이렇게 사용해요"
        description="입력부터 조리법 확인까지, 세 단계로 시작해요."
      />
      <ol className={styles.three_columns}>
        {usageSteps.map((step) => (
          <li key={step.number} className={styles.step_card}>
            <span className={styles.step_number} aria-hidden="true">
              {step.number}
            </span>
            <h3>{step.title}</h3>
            <p>
              {step.lines.map((line, index) => (
                <span key={line}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default HowToUseSection;
