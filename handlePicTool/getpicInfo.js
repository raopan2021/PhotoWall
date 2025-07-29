/**
 * 获取图片信息工具 - 优化版
 * 使用 sharp 和 exifr 库提取图片元数据和EXIF信息
 */
import { existsSync, promises as fsPromises } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import exifr from "exifr";
import fse from "fs-extra";
import sharp from "sharp";

// 获取当前模块路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 目录配置
const ORIGIN_DIR = path.join(__dirname, "../public/photos/origin");
const INFO_FILE = path.join(__dirname, "../src/assets/info.json");
// 检查原始目录是否存在
if (!existsSync(ORIGIN_DIR)) {
  throw new Error(`原始目录不存在: ${ORIGIN_DIR}`);
}

/**
 * 提取图片主色
 * @param {string} filePath 图片路径
 * @param {number} count 要提取的颜色数量
 * @returns {Promise<string[]>} RGB颜色数组
 */
async function extractDominantColors(filePath, count = 3) {
  try {
    const { dominant } = await sharp(filePath)
      .resize(200, { fit: "inside" }) // 保持比例缩小
      .raw()
      .toBuffer({ resolveWithObject: true });

    return Array.from(
      { length: count },
      (_, i) => `rgb(${dominant.r[i]}, ${dominant.g[i]}, ${dominant.b[i]})`,
    );
  }
  catch (err) {
    console.error(`提取主色失败 [${path.basename(filePath)}]:`, err.message);
    return [];
  }
}

/**
 * 模拟位置信息转换
 * @param {object} gps GPS数据
 * @returns {Promise<object>} 位置信息对象
 */
async function getLocationInfo(gps) {
  if (!gps)
    return {};

  // 实际应用中应调用地理编码API
  return {
    coordinates: {
      latitude: gps.latitude,
      longitude: gps.longitude,
    },
    country: "中国",
    province: "北京市",
    city: "北京市",
    district: "朝阳区",
    street: "建国路88号",
    formattedAddress: "中国北京市朝阳区建国路88号",
  };
}

/**
 * 处理单张图片
 * @param {string} file 图片文件名
 * @returns {Promise<object|null>} 图片信息对象或null(失败时)
 */
async function processImage(file) {
  const filePath = path.join(ORIGIN_DIR, file);
  const fileExt = path.extname(file).toLowerCase();
  const fileName = path.basename(file, fileExt);

  try {
    const [stats, metadata, exif] = await Promise.all([
      fse.stat(filePath),
      sharp(filePath).metadata(),
      exifr
        .parse(filePath, {
          tiff: true,
          exif: true,
          gps: true,
          xmp: true,
        })
        .catch(() => ({})), // 忽略EXIF解析错误
    ]);

    const [dominantColors, locationInfo] = await Promise.all([
      extractDominantColors(filePath),
      exif?.gps ? getLocationInfo(exif.gps) : {},
    ]);

    return {
      fileName,
      fileExt: fileExt.replace(".", ""),
      fullName: file,
      dimensions: {
        width: metadata.width,
        height: metadata.height,
      },
      fileSize: stats.size,
      camera: {
        make: exif?.Make || "",
        model: exif?.Model || "",
        lens: exif?.LensModel || "",
      },
      exposure: {
        exposureTime: exif?.ExposureTime,
        fNumber: exif?.FNumber,
        iso: exif?.ISO,
        focalLength: exif?.FocalLength,
      },
      dateTime: exif?.DateTimeOriginal || exif?.CreateDate,
      gps: exif?.gps || null,
      location: locationInfo,
      colors: dominantColors,
      metadata: {
        orientation: metadata.orientation,
        format: metadata.format,
      },
    };
  }
  catch (err) {
    console.error(`处理图片失败 [${file}]:`, err.message);
    return null;
  }
}

/**
 * 获取目录下所有图片文件
 * @param {string} dir - 目录路径
 * @returns {Promise<string[]>} 图片文件名数组
 */
async function getImageFiles(dir) {
  try {
    console.log(dir);

    const files = await fsPromises.readdir(dir);
    return files.filter(file =>
      /\.(jpg|jpeg|png|webp|gif|tiff)$/i.test(file),
    );
  }
  catch (err) {
    console.error("读取目录失败:", dir, err);
    return [];
  }
}

/**
 * 主函数 - 提取图片信息
 */
export async function extractImageInfo() {
  try {
    // 获取所有图片文件
    const files = await getImageFiles(ORIGIN_DIR);
    if (!files.length) {
      console.log("原始目录中没有找到支持的图片文件");
      return;
    }

    console.log(`开始处理 ${files.length} 张图片...`);

    const results = (await Promise.all(files.map(processImage)))
      .filter(Boolean) // 过滤失败项
      .sort((a, b) => new Date(b.dateTime || 0) - new Date(a.dateTime || 0)); // 按时间排序

    await fse.writeJson(INFO_FILE, results, { spaces: 2 });
    console.log(`图片信息已保存至: ${INFO_FILE}`);
    return results;
  }
  catch (err) {
    console.error("处理图片信息时出错:", err);
    throw err;
  }
}

// 直接执行（当作为脚本运行时）
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  extractImageInfo().catch(console.error);
}
