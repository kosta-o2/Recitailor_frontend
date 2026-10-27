import "./App.css";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import { Outlet } from "react-router";
import Posts from "./components/posts/Posts";
function App() {
  const mockdata = {
    id: 1,
    title: "매콤달콤 제육볶음",
    content: "밥반찬과 술안주로 모두 좋은 매콤달콤한 제육볶음 레시피입니다.",
    portion: "2인분",
    author: "chef_01",
    time: 25,
    all_ingredient: {
      ingredients: [
        "돼지고기 앞다리살 300g",
        "양파 1/2개",
        "대파 1대",
        "청양고추 1개",
      ],
      sauces: [
        "고추장 2큰술",
        "고춧가루 1.5큰술",
        "간장 2큰술",
        "설탕 1큰술",
        "다진마늘 1큰술",
        "참기름 약간",
      ],
    },
    category: {
      method: "메인반찬",
      type: "볶음",
    },
    recipes: [
      "돼지고기는 먹기 좋은 크기로 썰어 준비합니다.",
      "분량의 양념장 재료를 골고루 섞어줍니다.",
      "손질한 야채(양파, 대파, 고추)를 썰어줍니다.",
      "달군 팬에 기름을 두르고 고기를 먼저 볶아줍니다.",
      "고기가 반쯤 익으면 양념장과 야채를 넣고 마저 볶아 완성합니다.",
    ],
    create_at: "2026-03-01T09:00:00Z",
    update_at: "2026-03-01T09:00:00Z",
  };
  console.log(mockdata);
  return (
    <>
      <Header />
      {/* <Posts props={mockdata} /> */}
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
