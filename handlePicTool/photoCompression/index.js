// utils/image-compressor.js
import { existsSync, mkdirSync, readdirSync, unlinkSync } from "fs";
import { promises as fsPromises } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Piscina from "piscina";
import os from "os";

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// 目录配置
const originDir = join(__dirname, "../../public/photos/origin");
const minDir = join(__dirname, "../../public/photos/min");
const midDir = join(__dirname, "../../public/photos/mid");
// 检查原始目录是否存在
if (!existsSync(originDir)) {
  throw new Error(`原始目录不存在: ${originDir}`);
}
// 确保输出目录存在
[minDir, midDir].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// 创建线程池 (使用物理核心数)
const pool = new Piscina({
  filename: new URL("./worker.js", import.meta.url).href,
  maxThreads: os.cpus().length,
  idleTimeout: 5000, // 线程空闲5秒后关闭
});

/**
 * 获取目录下所有图片文件
 * @param {string} dir - 目录路径
 * @returns {Promise<string[]>} 图片文件名数组
 */
async function getImageFiles(dir) {
  try {
    console.log(dir);
    const files = await fsPromises.readdir(dir);
    return files.filter((file) =>
      /\.(jpg|jpeg|png|webp|gif|tiff)$/i.test(file)
    );
  } catch (err) {
    console.error("读取目录失败:", dir, err);
    return [];
  }
}

/**
 * 处理图片并显示进度条
 */
async function processImages() {
  console.log("=== 图片压缩工具开始运行 ===");

  try {
    // 获取所有图片文件
    const files = await getImageFiles(originDir);
    if (files.length === 0) {
      console.log("原始目录中没有找到图片文件");
      return;
    }
    console.log(`找到 ${files.length} 张图片需要处理`);

    // 创建任务队列 (每个文件需要两种处理)
    const tasks = [];
    files.forEach((file) => {
      tasks.push({ file, taskType: "min", originDir, outputDir: minDir });
      tasks.push({ file, taskType: "mid", originDir, outputDir: midDir });
    });

    // 进度跟踪
    let processed = 0;
    const totalTasks = tasks.length;
    let successCount = 0;
    let skippedCount = 0;
    let failCount = 0;

    // 进度条更新函数
    function updateProgress() {
      const progress = ((processed / totalTasks) * 100).toFixed(1);
      process.stdout.write(
        `\r处理进度: ${progress}% | 成功: ${successCount} | 跳过: ${skippedCount} | 失败: ${failCount}`
      );
    }

    console.log("开始处理图片...");
    updateProgress();

    // 分批处理以避免内存问题，8核心16线程，每次处理*2=32个任务
    const batchSize = pool.maxThreads * 10;
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      const results = await Promise.all(batch.map((task) => pool.run(task)));

      // 更新统计
      results.forEach((result) => {
        processed++;
        if (result.skipped) {
          skippedCount++;
        } else if (result.success) {
          successCount++;
        } else {
          failCount++;
          console.error(`\n处理失败: ${result.file} - ${result.error}`);
        }
        updateProgress();
      });
    }

    console.log("\n\n=== 处理完成 ===");
    console.log(`总计: ${totalTasks} 个任务`);
    console.log(`成功: ${successCount}`);
    console.log(`跳过: ${skippedCount}`);
    console.log(`失败: ${failCount}`);
  } catch (error) {
    console.error("\n处理过程中发生错误:", error);
  } finally {
    await pool.destroy(); // 关闭线程池
  }
}

// 启动处理
processImages();
