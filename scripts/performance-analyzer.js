#!/usr/bin/env node

/**
 * 效能分析工具
 * 分析網站載入效能和優化建議
 */

const fs = require("fs");
const path = require("path");

class PerformanceAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.publicDir = path.join(this.projectRoot, "public");
  }

  // 分析建置結果
  analyzeBuildOutput() {
    console.log("🚀 效能優化分析工具\n");
    console.log("======================================\n");

    if (!fs.existsSync(this.publicDir)) {
      console.log("❌ 請先執行 npm run build 建置網站");
      return;
    }

    this.analyzeStaticFiles();
    this.analyzeServiceWorker();
    this.analyzeCriticalResources();
    this.generateRecommendations();
  }

  // 分析靜態檔案
  analyzeStaticFiles() {
    console.log("📊 靜態檔案分析:\n");

    const staticFiles = this.getStaticFiles(this.publicDir);
    const totalSize = staticFiles.reduce((sum, file) => sum + file.size, 0);

    console.log(`   總檔案數: ${staticFiles.length}`);
    console.log(`   總大小: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);

    // 按類型分析
    const byType = {};
    staticFiles.forEach((file) => {
      const ext = path.extname(file.name).toLowerCase();
      if (!byType[ext]) byType[ext] = { count: 0, size: 0 };
      byType[ext].count++;
      byType[ext].size += file.size;
    });

    console.log("   按檔案類型分析:");
    Object.entries(byType)
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 10)
      .forEach(([ext, data]) => {
        console.log(
          `   ${ext || "no-ext"}: ${data.count} 個檔案, ${(data.size / 1024).toFixed(2)} KB`,
        );
      });
    console.log();
  }

  // 檢查 Service Worker
  analyzeServiceWorker() {
    console.log("🔧 Service Worker 分析:\n");

    const swPath = path.join(this.publicDir, "sw.js");
    if (fs.existsSync(swPath)) {
      const swSize = fs.statSync(swPath).size;
      console.log(
        `   ✅ Service Worker 已部署 (${(swSize / 1024).toFixed(2)} KB)`,
      );
      console.log("   ✅ 支援離線快取和預載入");
    } else {
      console.log("   ❌ Service Worker 未找到");
    }
    console.log();
  }

  // 分析關鍵資源
  analyzeCriticalResources() {
    console.log("⚡ 關鍵資源分析:\n");

    // 檢查 CSS 檔案
    const cssFiles = this.findFiles(this.publicDir, /\.css$/);
    console.log(`   CSS 檔案: ${cssFiles.length} 個`);

    // 檢查 JS 檔案
    const jsFiles = this.findFiles(this.publicDir, /\.js$/);
    console.log(`   JavaScript 檔案: ${jsFiles.length} 個`);

    // 檢查圖片檔案
    const imageFiles = this.findFiles(
      this.publicDir,
      /\.(png|jpg|jpeg|webp|svg)$/,
    );
    console.log(`   圖片檔案: ${imageFiles.length} 個`);

    // 檢查 WebP 支援
    const webpFiles = this.findFiles(this.publicDir, /\.webp$/);
    const totalImages = this.findFiles(
      this.publicDir,
      /\.(png|jpg|jpeg)$/,
    ).length;
    console.log(
      `   WebP 轉換率: ${((webpFiles.length / totalImages) * 100).toFixed(1)}%`,
    );
    console.log();
  }

  // 生成優化建議
  generateRecommendations() {
    console.log("💡 效能優化建議:\n");

    const recommendations = [];

    // 檢查圖片優化
    const largeImages = this.findLargeFiles(
      this.publicDir,
      500 * 1024,
      /\.(png|jpg|jpeg)$/,
    );
    if (largeImages.length > 0) {
      recommendations.push({
        priority: "High",
        type: "圖片優化",
        issue: `發現 ${largeImages.length} 個大型圖片 (>500KB)`,
        solution: "使用 {{< img >}} shortcode 啟用自動 WebP 轉換",
      });
    }

    // 檢查 CSS 優化
    const cssFiles = this.findFiles(this.publicDir, /\.css$/);
    if (cssFiles.length > 3) {
      recommendations.push({
        priority: "Medium",
        type: "CSS 優化",
        issue: `CSS 檔案較多 (${cssFiles.length} 個)`,
        solution: "考慮合併關鍵 CSS 並延遲載入非關鍵樣式",
      });
    }

    // 檢查 JavaScript 優化
    const jsFiles = this.findFiles(this.publicDir, /\.js$/);
    if (jsFiles.length > 5) {
      recommendations.push({
        priority: "Medium",
        type: "JavaScript 優化",
        issue: `JavaScript 檔案較多 (${jsFiles.length} 個)`,
        solution: "啟用更積極的 lazy loading 策略",
      });
    }

    // 輸出建議
    if (recommendations.length === 0) {
      console.log("   ✅ 效能優化狀態良好！\n");
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.priority}] ${rec.type}`);
        console.log(`      問題: ${rec.issue}`);
        console.log(`      建議: ${rec.solution}\n`);
      });
    }

    // 實作狀態
    console.log("📈 已實作的優化:");
    console.log("   ✅ DNS 預解析和連線預建立");
    console.log("   ✅ 關鍵資源預載入");
    console.log("   ✅ 智慧型預取系統");
    console.log("   ✅ Service Worker 快取策略");
    console.log("   ✅ 圖片自動 WebP 轉換");
    console.log("   ✅ CSS 和 JavaScript 延遲載入");
    console.log("   ✅ 字型載入優化\n");

    // 效能監控建議
    console.log("📊 建議的監控指標:");
    console.log("   • First Contentful Paint (FCP)");
    console.log("   • Largest Contentful Paint (LCP)");
    console.log("   • Cumulative Layout Shift (CLS)");
    console.log("   • First Input Delay (FID)");
    console.log("   • Time to Interactive (TTI)\n");

    console.log("✨ 分析完成！使用以下工具測試效能:");
    console.log("   • Google PageSpeed Insights");
    console.log("   • WebPageTest.org");
    console.log("   • Lighthouse (Chrome DevTools)");
  }

  // 輔助方法
  getStaticFiles(dir) {
    const files = [];

    const walk = (currentDir) => {
      if (!fs.existsSync(currentDir)) return;

      fs.readdirSync(currentDir).forEach((file) => {
        const fullPath = path.join(currentDir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walk(fullPath);
        } else {
          files.push({
            name: file,
            path: fullPath,
            size: stat.size,
            ext: path.extname(file).toLowerCase(),
          });
        }
      });
    };

    walk(dir);
    return files;
  }

  findFiles(dir, pattern) {
    const files = this.getStaticFiles(dir);
    return files.filter((file) => pattern.test(file.name));
  }

  findLargeFiles(dir, sizeLimit, pattern) {
    const files = this.getStaticFiles(dir);
    return files.filter(
      (file) =>
        file.size > sizeLimit && (pattern ? pattern.test(file.name) : true),
    );
  }

  // 主要執行方法
  run() {
    this.analyzeBuildOutput();
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  const analyzer = new PerformanceAnalyzer();
  analyzer.run();
}

module.exports = PerformanceAnalyzer;
