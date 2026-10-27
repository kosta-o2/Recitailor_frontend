import React from "react";
import { Outlet } from "react-router";

function PostLayout() {
  return (
    <div className="container">
      <Outlet />
    </div>
  );
}

export default PostLayout;
