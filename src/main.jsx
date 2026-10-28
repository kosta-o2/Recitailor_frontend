import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import NotFound from "./pages/NotFound.jsx";
import Post from "./components/posts/Post.jsx";
import MainPage from "./pages/MainPage.jsx";
import PostList from "./components/posts/PostList.jsx";
import PostLayout from "./pages/PostLayout.jsx";
import { store } from "./app/store.js";
import { Provider } from "react-redux";
import PostCreate from "./components/posts/PostCreate.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import FindIdPage from "./pages/FindIdPage.jsx";
import FindPasswordPage from "./pages/FindPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <MainPage /> },
      {
        path: "post",
        element: <PostLayout />,
        children: [
          { index: true, element: <PostList /> },
          { path: ":id", element: <Post /> },
          { path: "create", element: <PostCreate /> },
        ],
      },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "find-id", element: <FindIdPage /> },
      { path: "find-password", element: <FindPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />,
  </Provider>,
);
