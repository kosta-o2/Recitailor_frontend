import React from "react";
import styles from "./FiveChefsSection.module.css";
import SectionHeading from "./SectionHeading";
import { chefs } from "./mainPageData";

function FiveChefsSection() {
  return (
    <section className={styles.chefs} aria-labelledby="five-chefs-title">
      <SectionHeading
        id="five-chefs-title"
        title="함께하는 다섯 셰프"
        description="각자의 장점을 가진 셰프들을 소개해요."
      />
      <ul className={styles.chef_grid}>
        {chefs.map((chef) => (
          <li key={chef.id} className={styles.chef_card}>
            <div className={styles.chef_portrait}>
              <img
                src={chef.image}
                width="432"
                height="404"
                loading="lazy"
                alt={chef.alt}
              />
            </div>
            <h3>{chef.name}</h3>
            <p className={styles.chef_role}>{chef.role}</p>
            <p className={styles.chef_specialty}>{chef.specialty}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default FiveChefsSection;
