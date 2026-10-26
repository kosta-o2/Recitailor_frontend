import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import NotFound from "./pages/NotFound.jsx";
import Posts from "./components/posts/Posts.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [{ index: true, element: <Posts /> }],
  },
]);
createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
