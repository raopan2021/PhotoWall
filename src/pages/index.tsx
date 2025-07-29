import React from "react";
import ImageDrawer from "@/components/imageDrawer/index.tsx";
import TimeLine from "@/components/timeLine/index.tsx";

const Home: React.FC = () => (
  <>
    <TimeLine />

    {/* 大图抽屉 */}
    <ImageDrawer />
  </>
);

export default Home;
