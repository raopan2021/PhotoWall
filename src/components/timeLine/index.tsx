import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import { Grid, ImageList, ImageListItem, Skeleton } from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

import photoDataUrl from "@/assets/info.json?url";
import usePicStore from "@/stores/image";

// 判断是否为横向图片
function isLandscape(photo: Image.Info) {
  if (!photo.dimensions)
    return false;
  return photo.dimensions.width > photo.dimensions.height;
}

// 获取图片布局参数
function getPhotoLayout(photo: Image.Info) {
  const landscape = isLandscape(photo);
  // 放大状态下的布局
  if (photo.featured) {
    return landscape ? { cols: 4, rows: 3 } : { cols: 3, rows: 2 };
  }
  // 默认布局
  return landscape ? { cols: 2, rows: 1 } : { cols: 1, rows: 1 };
}

function groupByDate(items: any[]) {
  return items.reduce((groups, item) => {
    const date = dayjs(item.dateTime).format("YYYY-MM-DD");
    groups[date] = groups[date] || [];
    groups[date].push(item);
    return groups;
  }, {} as Record<string, Image.Info[]>);
}

function srcset(image: string, size: number, rows = 1, cols = 1, originalWidth?: number, originalHeight?: number) {
  // 如果有原始尺寸，按比例计算
  if (originalWidth && originalHeight) {
    const originalRatio = originalWidth / originalHeight;
    // 以高度为准
    if (originalRatio <= 1) {
      return {
        src: `${image}?h=${rows * size}&auto=format`,
        srcSet: `${image}?h=${rows * size}&auto=format&dpr=2 2x`,
      };
    }
    else {
      return {
        src: `${image}?w=${cols * size}&auto=format`,
        srcSet: `${image}?w=${cols * size}&auto=format&dpr=2 2x`,
      };
    }
  }
  // 默认情况
  return {
    src: `${image}?w=${cols * size}&auto=format`,
    srcSet: `${image}?w=${cols * size}&auto=format&dpr=2 2x`,
  };
}

const App: React.FC = () => {
  const { dates, initDates, datephotos, initDatesPhotos, setDatePhotoFeatured, exchangeShowPicDrawer, setImageInfo }
    = usePicStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(photoDataUrl);
        const photoData = await response.json();
        const groupedData = groupByDate(photoData);

        initDates(Object.keys(groupedData));
        initDatesPhotos(groupedData);
      }
      catch (error) {
        console.error("Error loading photo data:", error);
      }
      finally {
        setLoading(false);
      }
    };
    loadData();
  }, [initDates, initDatesPhotos]);

  const showPhotoDrawer = (photo: Image.Info) => {
    exchangeShowPicDrawer(true);
    setImageInfo(photo);
  };

  if (loading) {
    return (
      <div className="flex items-start justify-center px-[300px] py-[10px] h-[100vh]">
        <Grid container wrap="wrap" spacing={2}>
          {Array.from(Array.from({ length: 30 })).map((_, index) => (
            <Skeleton key={index} variant="rectangular" width={150} height={200} />
          ))}
        </Grid>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {dates.map(date => (
        <div
          className="flex gap-[10px] w-full my-[20px] box-border 2xl:px-[300px] lg:px-[150px] md:px-[100px] sm:px-[50px] xl:px-[200px]"
          key={date}
        >
          <div className="text-right w-auto pr-[30px]">{dayjs(date).format("YYYY-MM-DD")}</div>

          <ImageList className="flex-1" variant="quilted" cols={8} sx={{ transform: "translateZ(0)" }}>
            {datephotos[date]?.map((photo: Image.Info) => {
              const { cols, rows } = getPhotoLayout(photo);
              const imageSize = photo.featured ? "mid" : "min";

              return (
                <ImageListItem key={photo.fullName} cols={cols} rows={rows} className="relative group">
                  <img
                    {...srcset(
                      `${import.meta.env.BASE_URL}/photos/${imageSize}/${photo.fileName}.webp`,
                      100,
                      rows,
                      cols,
                      photo?.dimensions?.width,
                      photo?.dimensions?.height,
                    )}
                    alt={photo.fileName}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      cursor: "pointer",
                    }}
                    onClick={() => setDatePhotoFeatured(photo, date)}
                  />

                  <ZoomOutMapIcon
                    className="absolute right-[10px] top-[10px] cursor-pointer text-black opacity-0 transition-opacity duration-600 group-hover:opacity-100"
                    style={{
                      color: "#fff",
                      textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                    }}
                    onClick={() => showPhotoDrawer(photo)}
                  />
                </ImageListItem>
              );
            })}
          </ImageList>
        </div>
      ))}
    </div>
  );
};

export default App;
