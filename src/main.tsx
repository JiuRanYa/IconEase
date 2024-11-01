import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useImageStore } from "./stores/imageStore";
import { getContainer } from "./components/Message/MessageContainer";

getContainer();
useImageStore.getState().initImages().catch(console.error);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
