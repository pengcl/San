#!/usr/bin/env node
/**
 * 图片批量优化脚本
 * 支持转换为WebP格式，生成多种尺寸的响应式图片
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 配置
const config = {
  // 源文件夹
  inputDir: path.join(__dirname, '../public/images'),
  // 输出文件夹
  outputDir: path.join(__dirname, '../public/images/optimized'),
  // 支持的图片格式
  supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  // 响应式图片断点
  breakpoints: [320, 640, 768, 1024, 1280, 1920],
  // 图片质量设置
  quality: {
    jpeg: 85,
    webp: 85,
    png: 90,
  },
  // 并发处理数量
  concurrency: 4,
};

// 确保输出目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 获取所有图片文件
function getImageFiles(dir) {
  const files = [];

  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (
        config.supportedFormats.includes(path.extname(item).toLowerCase())
      ) {
        files.push(fullPath);
      }
    }
  }

  scanDir(dir);
  return files;
}

// 生成文件名
function generateFileName(originalPath, width, format, suffix = '') {
  const parsed = path.parse(originalPath);
  const relativePath = path.relative(config.inputDir, parsed.dir);
  const outputDir = path.join(config.outputDir, relativePath);

  ensureDir(outputDir);

  const name = `${parsed.name}${suffix}_${width}w.${format}`;
  return path.join(outputDir, name);
}

// 处理单个图片
async function processImage(inputPath) {
  console.log(`Processing: ${path.relative(config.inputDir, inputPath)}`);

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    const originalWidth = metadata.width;
    const originalHeight = metadata.height;

    // 生成不同尺寸的图片
    const tasks = [];

    for (const width of config.breakpoints) {
      // 跳过比原图更大的尺寸
      if (width > originalWidth) continue;

      const height = Math.round((originalHeight / originalWidth) * width);

      // 生成JPEG版本
      if (metadata.format !== 'png' || metadata.hasAlpha === false) {
        tasks.push(
          image
            .clone()
            .resize(width, height, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .jpeg({
              quality: config.quality.jpeg,
              progressive: true,
              mozjpeg: true,
            })
            .toFile(generateFileName(inputPath, width, 'jpg'))
        );
      }

      // 生成WebP版本
      tasks.push(
        image
          .clone()
          .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({
            quality: config.quality.webp,
            effort: 6,
          })
          .toFile(generateFileName(inputPath, width, 'webp'))
      );

      // 如果是PNG且有透明度，也生成PNG版本
      if (metadata.format === 'png' && metadata.hasAlpha) {
        tasks.push(
          image
            .clone()
            .resize(width, height, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .png({
              quality: config.quality.png,
              compressionLevel: 9,
              adaptiveFiltering: true,
            })
            .toFile(generateFileName(inputPath, width, 'png'))
        );
      }
    }

    // 生成缩略图（用于占位符）
    const thumbnailSize = 20;
    const thumbnailHeight = Math.round(
      (originalHeight / originalWidth) * thumbnailSize
    );

    tasks.push(
      image
        .clone()
        .resize(thumbnailSize, thumbnailHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .blur(2)
        .jpeg({ quality: 40 })
        .toFile(generateFileName(inputPath, thumbnailSize, 'jpg', '_thumb'))
    );

    await Promise.all(tasks);
    console.log(`✓ Completed: ${path.relative(config.inputDir, inputPath)}`);
  } catch (error) {
    console.error(`✗ Error processing ${inputPath}:`, error.message);
  }
}

// 批量处理图片（带并发控制）
async function processImagesWithConcurrency(files) {
  const total = files.length;
  let completed = 0;

  console.log(`Starting optimization of ${total} images...`);

  // 创建并发池
  const pool = [];
  let index = 0;

  async function worker() {
    while (index < files.length) {
      const currentIndex = index++;
      const file = files[currentIndex];

      try {
        await processImage(file);
        completed++;

        const progress = ((completed / total) * 100).toFixed(1);
        console.log(`Progress: ${progress}% (${completed}/${total})`);
      } catch (error) {
        console.error(`Worker error:`, error);
        completed++;
      }
    }
  }

  // 启动worker
  for (let i = 0; i < config.concurrency; i++) {
    pool.push(worker());
  }

  await Promise.all(pool);
}

// 生成图片清单文件
function generateManifest(files) {
  const manifest = {};

  files.forEach(file => {
    const relativePath = path.relative(config.inputDir, file);
    const parsed = path.parse(relativePath);
    const key = path.join(parsed.dir, parsed.name).replace(/\\/g, '/');

    if (!manifest[key]) {
      manifest[key] = {
        original: relativePath.replace(/\\/g, '/'),
        responsive: {},
        formats: [],
      };
    }

    // 记录支持的格式和尺寸
    config.breakpoints.forEach(width => {
      manifest[key].responsive[width] = {
        jpg: `optimized/${key}_${width}w.jpg`,
        webp: `optimized/${key}_${width}w.webp`,
      };
    });

    manifest[key].thumbnail = `optimized/${key}_thumb_20w.jpg`;
  });

  const manifestPath = path.join(config.outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Image manifest generated: ${manifestPath}`);
}

// 主函数
async function main() {
  try {
    // 检查sharp是否可用
    if (!require('sharp')) {
      console.error(
        'Sharp is required for image processing. Install it with: npm install sharp'
      );
      process.exit(1);
    }

    console.log('🖼️  Image Optimization Tool');
    console.log('============================');
    console.log(`Input directory: ${config.inputDir}`);
    console.log(`Output directory: ${config.outputDir}`);
    console.log(`Breakpoints: ${config.breakpoints.join(', ')}`);
    console.log(`Concurrency: ${config.concurrency}`);
    console.log('');

    // 确保输出目录存在
    ensureDir(config.outputDir);

    // 获取所有图片文件
    const files = getImageFiles(config.inputDir);

    if (files.length === 0) {
      console.log('No images found to process.');
      return;
    }

    console.log(`Found ${files.length} images to process.`);
    console.log('');

    // 处理图片
    const startTime = Date.now();
    await processImagesWithConcurrency(files);
    const endTime = Date.now();

    // 生成清单文件
    generateManifest(files);

    console.log('');
    console.log('✅ Optimization complete!');
    console.log(`Total time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
    console.log(
      `Average: ${((endTime - startTime) / files.length).toFixed(0)}ms per image`
    );
  } catch (error) {
    console.error('❌ Optimization failed:', error);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  processImage,
  generateManifest,
  config,
};
