import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "../layout/main";
import Main from "../pages/main";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Navigate to="/home" replace />,
            },
            {
                path: "home",
                element: <Main />,
            },
            {
                path: "favorites",
                element: <Main showUpload={false} />,
            },
        ],
    },
]);
