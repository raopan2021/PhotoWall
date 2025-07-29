import { promises } from "node:fs";
// utils/image-worker.js
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
  const outputPath = join(outputDir, file);

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
      await sharp(inputPath).resize({ width: 320 }).toFile(outputPath);
    }
    else {
      // 中等质量压缩 (保持原尺寸)
      const fileExt = extname(file).toLowerCase();
      const processor = sharp(inputPath);

      switch (fileExt) {
        case ".png":
          await processor
            .png({ quality: 80, compressionLevel: 9 })
            .toFile(outputPath);
          break;
        case ".jpg":
        case ".jpeg":
          await processor
            .jpeg({ quality: 80, mozjpeg: true })
            .toFile(outputPath);
          break;
        case ".webp":
          await processor.webp({ quality: 80 }).toFile(outputPath);
          break;
        default:
          await processor.toFile(outputPath);
      }
    }

    return { success: true, file };
  }
  catch (error) {
    return { success: false, file, error: error.message };
  }
}
