import React from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import "./global.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { db } from "./services/db";

// 确保数据库初始化
await db.init();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
