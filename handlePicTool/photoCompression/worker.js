import { promises } from "node:fs";
import { extname, join } from "node:path";
import sharp from "sharp";

/**
 * 图片处理工作线程
 * @param {object} task - 处理任务
 * @param {string} task.file - 文件名
 * @param {'min'|'mid'} task.taskType - 处理类型
 * @param {string} task.originDir - 原始目录
 * @param {string} task.outputDir - 输出目录
 */
export default async function processImage(task) {
  const { file, taskType, originDir, outputDir } = task;
  const inputPath = join(originDir, file);
  const outputPath = join(outputDir, file.replace(/\.png|\.jpg|\.jpeg|\.webp$/i, ".webp"));// 替换为webp格式

  try {
    // 检查输出文件是否已存在
    try {
      await promises.access(outputPath);
      return { skipped: true, file };
    }
    catch {
      // 文件不存在，继续处理
    }

    if (taskType === "min") {
      // 小尺寸压缩 (宽度320px)
      await sharp(inputPath).resize({ width: 320 }).webp({ quality: 80 }).toFile(outputPath);
    }
    else {
      // 中等质量压缩 (保持原尺寸)
      const fileExt = extname(file).toLowerCase(); // 文件扩展名
      const processor = sharp(inputPath); // sharp处理对象

      switch (fileExt) {
        case ".png":
        case ".jpg":
        case ".jpeg":
        case ".webp":
          await processor.webp({ quality: 80 }).toFile(outputPath);
          break;
        default:
          console.log(`转为webp格式失败，文件扩展名不正确: ${fileExt}`);
          await processor.toFile(outputPath);
      }
    }

    return { success: true, file };
  }
  catch (error) {
    return { success: false, file, error: error.message };
  }
}
