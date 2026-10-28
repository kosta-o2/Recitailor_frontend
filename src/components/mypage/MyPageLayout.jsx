import { NavLink, Outlet, useLocation } from "react-router";
import styles from "./MyPageLayout.module.css";

const menus = [
  { to: "/mypage", label: "회원정보 조회", end: true },
  { to: "/mypage/edit", label: "회원정보 수정" },
  { to: "/mypage/posts", label: "내가 작성한 게시글" },
  { to: "/mypage/likes", label: "좋아요한 게시글" },
];

// 사이드 메뉴 + 내용(Outlet). 회원탈퇴 화면에서는 "회원정보 수정"이 선택 상태다.
function MyPageLayout() {
  const { pathname } = useLocation();

  function getClassName(to, isActive) {
    const active =
      to === "/mypage/edit"
        ? pathname === "/mypage/edit" || pathname === "/mypage/withdraw"
        : isActive;

    return active ? `${styles.menu} ${styles.menu_active}` : styles.menu;
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.side}>
        <span className={styles.side_title}>마이페이지</span>
        <nav aria-label="마이페이지 메뉴" className={styles.menus}>
          {menus.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => getClassName(to, isActive)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className={styles.content}>
        <Outlet />
      </section>
    </div>
  );
}

export default MyPageLayout;
