import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import NotFound from "./pages/NotFound.jsx";
import Post from "./components/posts/Post.jsx";
import MainPage from "./pages/MainPage.jsx";
import PostList from "./components/posts/PostList.jsx";
import PostLayout from "./pages/PostLayout.jsx";
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
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
