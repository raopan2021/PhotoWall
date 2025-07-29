// utils/contrastColor.ts
export function getContrastColor(imgElement: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  // 设置 Canvas 尺寸与图片一致
  canvas.width = imgElement.naturalWidth;
  canvas.height = imgElement.naturalHeight;

  // 解决跨域问题（关键！）
  imgElement.crossOrigin = "Anonymous";

  // 绘制图片到 Canvas
  ctx.drawImage(imgElement, 0, 0);

  // 定义采样区域（右上角）
  const sampleWidth = 200;
  const sampleHeight = 500;
  const startX = Math.max(0, canvas.width - sampleWidth); // 从右侧开始
  const startY = 0; // 从顶部开始

  // 确保采样区域不超出图片边界
  const adjustedWidth = Math.min(sampleWidth, canvas.width - startX);
  const adjustedHeight = Math.min(sampleHeight, canvas.height - startY);

  // 获取采样区域的像素数据
  const imgData = ctx.getImageData(startX, startY, adjustedWidth, adjustedHeight);
  const { data } = imgData;

  // 计算平均颜色
  let totalR = 0; let totalG = 0; let totalB = 0;
  for (let i = 0; i < data.length; i += 4) {
    totalR += data[i];
    totalG += data[i + 1];
    totalB += data[i + 2];
  }

  const pixelCount = data.length / 4;
  const avgR = Math.floor(totalR / pixelCount);
  const avgG = Math.floor(totalG / pixelCount);
  const avgB = Math.floor(totalB / pixelCount);

  // 使用 WCAG 2.0 对比度公式
  const brightness = (avgR * 299 + avgG * 587 + avgB * 114) / 1000;

  return brightness > 180 ? "black" : "white";
}
