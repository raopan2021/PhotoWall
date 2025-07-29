import React from "react";
import TimeLine from "@/components/timeLine/index.tsx";
import ImageDrawer from "@/components/imageDrawer/index.tsx";

const Home: React.FC = () => (
  <>
    <TimeLine />

    {/* 大图抽屉 */}
    <ImageDrawer />
  </>
);

export default Home;
