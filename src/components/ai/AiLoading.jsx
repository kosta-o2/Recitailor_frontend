import bruno from "../../assets/images/bruno.png";
import sage from "../../assets/images/sage.png";
import brio from "../../assets/images/brio.png";
import rouxla from "../../assets/images/rouxla.png";
import meringue from "../../assets/images/meringue.png";
import styles from "./AiLoading.module.css";

const CHEFS = [bruno, sage, brio, rouxla, meringue];

// 셰프 5명이 차례로 움직이는 로딩 화면. 결과 3개 자리에 스켈레톤을 보여준다.
function AiLoading({ mode, query, onCancel }) {
  const isSearch = mode === "search";

  return (
    <div className={styles.wrap}>
      <div className={styles.chefs} aria-hidden="true">
        {CHEFS.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            className={styles.chef}
            style={{ animationDelay: `${index * 0.15}s` }}
          />
        ))}
      </div>

      <div className={styles.message} role="status" aria-live="polite">
        <div className={styles.bar} aria-hidden="true" />
        <h1 className={styles.title}>
          {isSearch
            ? "셰프들이 레시피를 찾는 중이에요"
            : "셰프들이 레시피를 만드는 중이에요"}
        </h1>
        <p className={styles.description}>
          잠시만 기다려주세요. <strong>{query}</strong> 조건에 맞춰 준비하고
          있어요.
        </p>
      </div>

      <div className={styles.cards} aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={styles.card}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className={styles.tags}>
              <div className={styles.tag} />
              <div className={styles.tag} />
            </div>
            <div className={styles.line_title} />
            <div className={styles.line} style={{ width: "90%" }} />
            <div className={styles.line} style={{ width: "70%" }} />
            <div className={styles.divider} />
            <div className={styles.line} style={{ width: "40%" }} />
          </div>
        ))}
      </div>

      <button type="button" className={styles.cancel} onClick={onCancel}>
        취소하고 처음으로
      </button>
    </div>
  );
}

export default AiLoading;
