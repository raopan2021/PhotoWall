import FlipIcon from "@mui/icons-material/Flip";
import RawOnIcon from "@mui/icons-material/RawOn";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Drawer, Popover, Switch } from "@mui/material";

import dayjs from "dayjs";
import Fraction from "fraction.js";
import React, { useEffect, useState } from "react";
import usePicStore from "@/stores/image";

import { getContrastColor } from "@/utils/contrastColor";

const App: React.FC = () => {
  const { showPicDrawer, exchangeShowPicDrawer, clearMidPic, imageInfo, setImageInfo, dates, datephotos }
    = usePicStore();
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  // 在 img 的 onLoad 中确保尺寸只设置一次
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (imgSize.width !== 0)
      return; // 避免重复设置
    const img = e.currentTarget;
    const width = imageInfo?.dimensions?.width || img.naturalWidth + 200;
    const height = imageInfo?.dimensions?.height || img.naturalHeight;
    setImgSize({ width, height });
    handleTextColor(e);
  };

  const onClose = () => {
    exchangeShowPicDrawer();
    clearMidPic();
    setImgSize({ width: 0, height: 0 }); // 关闭时重置尺寸
  };

  // 计算抽屉宽度（不超过视口的80%）
  const drawerWidth = Math.min(imgSize.width * (window.innerHeight / imgSize.height), window.innerWidth * 0.8);

  // #region 照片具体信息 是否显示 popover 按钮
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  // #endregion

  // #region 图片切换，上一张 / 下一张
  // 获取指定日期的照片数组
  const getPhotosByDate = (date: string) => datephotos[date] || [];
  // 查找当前照片在数组中的索引
  const findCurrentIndex = (photos: Image.Info[], fullName: string) =>
    photos.findIndex(photo => photo.fullName === fullName);
  const prev = () => {
    const currentDate = dayjs(imageInfo?.dateTime).format("YYYY-MM-DD");
    const currentPhotos = getPhotosByDate(currentDate);
    const currentIndex = findCurrentIndex(currentPhotos, imageInfo?.fullName);
    if (currentIndex === -1)
      return;
    // 如果不是第一张
    if (currentIndex > 0) {
      setImageInfoWithTransition(currentPhotos[currentIndex - 1]);
      return;
    }
    // 处理跨日期情况
    const currentDateIndex = dates.indexOf(currentDate);
    const prevDateIndex = currentDateIndex > 0 ? currentDateIndex - 1 : dates.length - 1;
    const prevDate = dates[prevDateIndex];
    const prevPhotos = getPhotosByDate(prevDate);
    if (prevPhotos.length > 0)
      setImageInfoWithTransition(prevPhotos[prevPhotos.length - 1]);
  };
  const next = () => {
    const currentDate = dayjs(imageInfo?.dateTime).format("YYYY-MM-DD");
    const currentPhotos = getPhotosByDate(currentDate);
    const currentIndex = findCurrentIndex(currentPhotos, imageInfo?.fullName);
    if (currentIndex === -1)
      return;
    // 如果不是最后一张
    if (currentIndex < currentPhotos.length - 1) {
      setImageInfoWithTransition(currentPhotos[currentIndex + 1]);
      return;
    }
    // 处理跨日期情况
    const currentDateIndex = dates.indexOf(currentDate);
    const nextDateIndex = currentDateIndex < dates.length - 1 ? currentDateIndex + 1 : 0;
    const nextDate = dates[nextDateIndex];
    const nextPhotos = getPhotosByDate(nextDate);
    if (nextPhotos.length > 0)
      setImageInfoWithTransition(nextPhotos[0]);
  };
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft")
        prev();
      if (e.key === "ArrowRight")
        next();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageInfo]);
  // #endregion

  const [textColor, setTextColor] = useState("white");
  const handleTextColor = async (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    // 确保图片已完全加载
    if (!img.complete || img.naturalWidth === 0) {
      await new Promise((resolve) => {
        img.onload = resolve;
      });
    }
    try {
      const color = getContrastColor(img);

      setTextColor(color);
    }
    catch (error) {
      console.error("颜色计算失败:", error);
      setTextColor("white"); // 降级方案
    }
  };

  // 显示原图
  const [isOriginPic, setIsOriginPic] = useState(false);
  // 左右翻转
  const [flip, setFlip] = useState(false);
  // 上下切换图片添加动画
  const [transition, setTransition] = useState("");
  const setImageInfoWithTransition = (newImageInfo: Image.Info) => {
    setTransition("fade-out");
    setTimeout(() => {
      setImageInfo(newImageInfo);
      setTransition("fade-in");
      // 重置尺寸以触发重新计算
      setImgSize({ width: 0, height: 0 });
    }, 500);
  };

  return (
    <Drawer
      open={showPicDrawer}
      onClose={onClose}
      anchor="right"
      sx={{
        "height": "100vh",
        "width": imgSize.width ? `min(${drawerWidth}px, 80vw)` : "auto",
        "transition": "width 0.3s ease-out", // 添加平滑过渡效果
        "overflow": "visible",
        "& .MuiDrawer-paper": {
          overflow: "visible",
          transition: "width 0.3s ease-out",
          width: "inherit", // 继承父级宽度
        },
      }}
      className="bg-transparent"
    >
      <Box
        className="relative flex justify-center items-start bg-transparent h-full"
        role="presentation"
        sx={{
          overflow: "visible",
          transition: "opacity 0.5s ease",
          willChange: "opacity",
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}/photos/${isOriginPic ? "origin" : "mid"}/${imageInfo?.fullName}`}
          alt={imageInfo?.fullName}
          width={imgSize.width}
          height={imgSize.height}
          onLoad={handleImageLoad}
          crossOrigin="anonymous"
          style={{
            maxHeight: "100vh",
            maxWidth: "100%",
            objectFit: "contain",
            transform: flip ? "scaleX(-1)" : "none", // 水平翻转
            opacity: transition === "fade-out" ? 0 : 1,
            transition: "opacity 0.5s ease, transform 0.3s ease",
          }}
          className={`image-transition ${transition}`}
        />

        <SettingsIcon
          className="absolute right-[10px] top-[10px] text-[30px]"
          style={{ color: textColor }}
          aria-describedby={id}
          onClick={handleClick}
        />
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          sx={{
            // 透明背景核心设置
            "& .MuiPaper-root": {
              backgroundColor: "transparent",
              boxShadow: "none",
              backgroundImage: "none", // 清除可能存在的渐变背景
            },
          }}
        >
          <div
            className="flex flex-col text-right py-[20px] text-[18px] gap-[30px] justify-start items-end"
            style={{
              color: textColor,
              textShadow: textColor === "white" ? "0 2px 4px rgba(0,0,0,0.8)" : "0 2px 4px rgba(255,255,255,0.8)",
            }}
          >
            <div className="flex gap-[10px] justify-start items-end">
              <span className="cursor-pointer" onClick={() => prev()}>
                PREV
              </span>
              /
              <span className="cursor-pointer" onClick={() => next()}>
                NEXT
              </span>
            </div>

            <span className="flex gap-[10px] justify-center items-center">
              <RawOnIcon />
              {" "}
              原图
              <Switch checked={isOriginPic} onChange={() => setIsOriginPic(!isOriginPic)} />
            </span>

            <span className="flex gap-[10px] justify-center items-center">
              <FlipIcon
                style={{
                  transform: flip ? "scaleX(-1)" : "none", // 水平翻转
                  transition: "transform 0.3s ease", // 可选：添加翻转动画
                }}
              />
              {" "}
              镜像
              <Switch checked={flip} onChange={() => setFlip(!flip)} />
            </span>

            <div className="flex flex-col gap-[10px] justify-start items-end">{imageInfo?.fullName}</div>

            <div className="flex flex-col gap-[10px] justify-start items-end">
              {[imageInfo?.camera?.make, imageInfo?.camera?.model, imageInfo?.camera?.lens].map(item => (
                <span className="block" key={item}>
                  {item}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-[10px] justify-start items-end">
              {[
                `${new Fraction(imageInfo?.exposure?.exposureTime).toFraction(true)}s`,
                `ƒ/${imageInfo?.exposure?.fNumber}`,
                `ISO ${imageInfo?.exposure?.iso}`,
                `${imageInfo?.exposure?.focalLength}mm`,
              ].map(item => (
                <span className="block" key={item}>
                  {item}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-[10px] justify-start items-end">
              {dayjs(imageInfo?.dateTime).format("YYYY-MM-DD A h:mm:ss")}
            </div>
          </div>
        </Popover>
      </Box>
    </Drawer>
  );
};

export default App;
