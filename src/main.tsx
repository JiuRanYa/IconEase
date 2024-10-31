import React from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import "./global.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useImageStore } from "./stores/imageStore";

useImageStore.getState().initImages().catch(console.error);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
