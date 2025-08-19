#!/usr/bin/env node

/**
 * 圖片優化工具
 * 分析圖片使用情況並提供優化建議
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class ImageOptimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.assetsDir = path.join(this.projectRoot, "assets", "images");
    this.staticDir = path.join(this.projectRoot, "static");
    this.contentDir = path.join(this.projectRoot, "content");
  }

  // 掃描圖片檔案
  scanImages() {
    console.log("🔍 掃描圖片檔案...\n");

    const images = {
      assets: this.getImageFiles(this.assetsDir),
      static: this.getImageFiles(this.staticDir),
      total: 0,
      sizes: {},
    };

    images.total = images.assets.length + images.static.length;

    console.log(`📊 圖片統計:`);
    console.log(`   Assets 目錄: ${images.assets.length} 個檔案`);
    console.log(`   Static 目錄: ${images.static.length} 個檔案`);
    console.log(`   總計: ${images.total} 個檔案\n`);

    return images;
  }

  // 取得指定目錄的圖片檔案
  getImageFiles(dir) {
    const images = [];
    if (!fs.existsSync(dir)) return images;

    const walk = (currentDir) => {
      const files = fs.readdirSync(currentDir);
      files.forEach((file) => {
        const fullPath = path.join(currentDir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (this.isImageFile(file)) {
          const size = stat.size;
          const relativePath = path.relative(this.projectRoot, fullPath);
          images.push({
            path: relativePath,
            fullPath,
            size,
            ext: path.extname(file).toLowerCase(),
            name: file,
          });
        }
      });
    };

    walk(dir);
    return images;
  }

  // 檢查是否為圖片檔案
  isImageFile(filename) {
    const imageExts = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];
    return imageExts.includes(path.extname(filename).toLowerCase());
  }

  // 分析圖片使用情況
  analyzeUsage() {
    console.log("🔍 分析圖片使用情況...\n");

    const images = this.scanImages();
    const largeImages = [];
    let totalSize = 0;
    let pngCount = 0;
    let jpgCount = 0;
    let webpCount = 0;

    [...images.assets, ...images.static].forEach((img) => {
      totalSize += img.size;

      if (img.ext === ".png") pngCount++;
      else if (img.ext === ".jpg" || img.ext === ".jpeg") jpgCount++;
      else if (img.ext === ".webp") webpCount++;

      // 標記大於 500KB 的圖片
      if (img.size > 500 * 1024) {
        largeImages.push({
          ...img,
          sizeKB: Math.round(img.size / 1024),
        });
      }
    });

    console.log(`📈 格式分析:`);
    console.log(`   PNG: ${pngCount} 個檔案`);
    console.log(`   JPG/JPEG: ${jpgCount} 個檔案`);
    console.log(`   WebP: ${webpCount} 個檔案`);
    console.log(`   總大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);

    if (largeImages.length > 0) {
      console.log(`⚠️  大型圖片 (>500KB):`);
      largeImages
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .forEach((img) => {
          console.log(`   ${img.path} (${img.sizeKB} KB)`);
        });
      console.log();
    }

    return {
      total: images.total,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      pngCount,
      jpgCount,
      webpCount,
      largeImages: largeImages.length,
    };
  }

  // 檢查 Hugo 配置
  checkHugoConfig() {
    console.log("⚙️  檢查 Hugo 圖片配置...\n");

    const hugoTomlPath = path.join(this.projectRoot, "hugo.toml");
    if (!fs.existsSync(hugoTomlPath)) {
      console.log("❌ hugo.toml 檔案不存在");
      return;
    }

    const config = fs.readFileSync(hugoTomlPath, "utf8");

    const hasImaging = config.includes("[imaging]");
    const hasQuality = config.includes("quality =");
    const hasWebpLogo = config.includes("logo_webp = true");

    console.log(`   [imaging] 區段: ${hasImaging ? "✅" : "❌"}`);
    console.log(`   quality 設定: ${hasQuality ? "✅" : "❌"}`);
    console.log(`   logo_webp 啟用: ${hasWebpLogo ? "✅" : "❌"}`);

    if (hasImaging && hasQuality) {
      console.log("   ✅ Hugo 圖片處理已正確配置\n");
    } else {
      console.log("   ⚠️  建議檢查 Hugo 圖片處理配置\n");
    }
  }

  // 生成優化建議
  generateRecommendations() {
    const analysis = this.analyzeUsage();

    console.log("💡 優化建議:\n");

    // WebP 轉換建議
    if (
      analysis.webpCount === 0 &&
      (analysis.pngCount > 0 || analysis.jpgCount > 0)
    ) {
      console.log("1. 🎯 WebP 轉換 (高優先級)");
      console.log("   - 使用 {{< img >}} shortcode 自動生成 WebP");
      console.log("   - 可節省約 25-35% 的檔案大小");
      console.log("   - 支援所有現代瀏覽器\n");
    }

    // 大型圖片優化建議
    if (analysis.largeImages > 0) {
      console.log("2. 📦 大型圖片優化");
      console.log(`   - 發現 ${analysis.largeImages} 個大型圖片 (>500KB)`);
      console.log("   - 建議調整圖片尺寸和品質");
      console.log("   - 考慮使用響應式圖片\n");
    }

    // lazy loading 建議
    console.log("3. 🚀 載入優化");
    console.log('   - 確認所有圖片使用 loading="lazy"');
    console.log("   - 使用 {{< img >}} shortcode 自動啟用");
    console.log("   - 提升頁面載入速度\n");

    // 總結
    console.log("📝 實作步驟:");
    console.log(
      '   1. 在文章中使用 {{< img src="/images/blog/xxx.png" alt="描述" >}}',
    );
    console.log("   2. Hugo 會自動生成 WebP 和原格式的響應式圖片");
    console.log("   3. 瀏覽器會自動選擇最佳格式");
    console.log("   4. 定期檢查和清理未使用的圖片\n");
  }

  // 主要執行方法
  run() {
    console.log("🖼️  圖片優化分析工具\n");
    console.log("======================================\n");

    this.checkHugoConfig();
    this.generateRecommendations();

    console.log("✨ 分析完成！\n");
    console.log("💡 提示: 執行 npm run build 後檢查 public/_gen 目錄");
    console.log("    可以看到 Hugo 自動生成的優化圖片");
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  const optimizer = new ImageOptimizer();
  optimizer.run();
}

module.exports = ImageOptimizer;
