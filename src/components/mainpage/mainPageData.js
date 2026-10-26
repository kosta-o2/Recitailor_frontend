import bruno from "../../assets/images/bruno.png";
import sage from "../../assets/images/sage.png";
import brio from "../../assets/images/brio.png";
import rouxla from "../../assets/images/rouxla.png";
import meringue from "../../assets/images/meringue.png";

export const weatherRecipes = [
  {
    id: "tofu-egg-soup",
    name: "두부 계란국",
    description: "가볍게 즐기는 따뜻한 국물",
    ingredients: ["두부", "계란", "대파"],
    minutes: 15,
  },
  {
    id: "mushroom-perilla-soup",
    name: "버섯 들깨 수프",
    description: "고소하게 데워주는 한 그릇",
    ingredients: ["버섯", "들깨", "우유"],
    minutes: 20,
  },
  {
    id: "chicken-vegetable-porridge",
    name: "닭고기 채소죽",
    description: "부드럽고 든든한 한 끼",
    ingredients: ["닭고기", "쌀", "당근"],
    minutes: 30,
  },
];

export const usageSteps = [
  {
    number: "01",
    title: "원하는 요리 입력",
    lines: ["재료나 먹고 싶은 요리를 적고", "검색 또는 생성을 선택해요."],
  },
  {
    number: "02",
    title: "세 가지 결과 비교",
    lines: ["마음에 드는 레시피를 골라", "상세한 조리법을 확인해요."],
  },
  {
    number: "03",
    title: "조건을 바꿔 재요청",
    lines: ["다른 결과가 필요하면", "피드백으로 조건을 바꿔요."],
  },
];

export const chefs = [
  {
    id: "bruno",
    name: "브루노",
    role: "총괄 셰프",
    specialty: "기본과 핵심 팁",
    image: bruno,
    alt: "냄비를 든 슈나우저 셰프 브루노",
  },
  {
    id: "sage",
    name: "세이지",
    role: "헤드 셰프",
    specialty: "순서와 타이밍",
    image: sage,
    alt: "초록 두건을 쓴 보더콜리 셰프 세이지",
  },
  {
    id: "brio",
    name: "브리오",
    role: "수 셰프",
    specialty: "빠르고 활기찬 요리",
    image: brio,
    alt: "빨간 스카프를 두른 시바견 셰프 브리오",
  },
  {
    id: "rouxla",
    name: "루플라",
    role: "파트 셰프",
    specialty: "재료 활용과 대체",
    image: rouxla,
    alt: "노란 리본을 단 스패니얼 셰프 루플라",
  },
  {
    id: "meringue",
    name: "머랭",
    role: "코미 셰프",
    specialty: "쉬운 용어와 계량",
    image: meringue,
    alt: "보라색 모자를 쓴 비숑 셰프 머랭",
  },
];
