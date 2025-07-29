import { createBrowserRouter } from "react-router";
import LayoutView from "@/layouts/index";
import HomePage from "@/pages/index";

const router = createBrowserRouter([
  {
    element: <LayoutView />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
    ],
  },
]);

export default router;
