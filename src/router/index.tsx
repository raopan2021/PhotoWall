import { createBrowserRouter } from "react-router";
import LayoutView from "@/layouts/index";
import HomePage from "@/pages/index";

const router = createBrowserRouter(
  [
    {
      element: <LayoutView />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
      ],
    },
  ],
  {
    basename: "/PhotoWall", // 所有路由自动添加 /PhotoWall 前缀
  }
);

export default router;
