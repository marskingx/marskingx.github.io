#!/usr/bin/env node

/**
 * 結構化資料驗證工具
 * 驗證網站的 JSON-LD 結構化資料是否正確
 */

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

class StructuredDataValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.publicDir = path.join(this.projectRoot, "public");
    this.errors = [];
    this.warnings = [];
    this.validPages = 0;
    this.totalPages = 0;
  }

  // 主要驗證方法
  async validate() {
    console.log("🔍 結構化資料驗證工具\n");
    console.log("======================================\n");

    if (!fs.existsSync(this.publicDir)) {
      console.log("❌ 請先執行 npm run build 建置網站");
      return;
    }

    const htmlFiles = this.findHtmlFiles(this.publicDir);
    this.totalPages = htmlFiles.length;

    console.log(`📊 找到 ${htmlFiles.length} 個 HTML 檔案\n`);

    for (const filePath of htmlFiles) {
      await this.validateFile(filePath);
    }

    this.generateReport();
  }

  // 驗證單一檔案
  async validateFile(filePath) {
    try {
      const html = fs.readFileSync(filePath, "utf8");
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const jsonLdScripts = document.querySelectorAll(
        'script[type="application/ld+json"]',
      );

      if (jsonLdScripts.length === 0) {
        this.warnings.push({
          file: this.getRelativePath(filePath),
          type: "missing",
          message: "未找到結構化資料",
        });
        return;
      }

      let hasValidStructuredData = false;

      jsonLdScripts.forEach((script, index) => {
        try {
          const jsonData = JSON.parse(script.textContent);
          const validation = this.validateJsonLd(jsonData);

          if (validation.isValid) {
            hasValidStructuredData = true;
          } else {
            this.errors.push({
              file: this.getRelativePath(filePath),
              scriptIndex: index + 1,
              type: "validation",
              message: validation.errors.join(", "),
            });
          }
        } catch (error) {
          this.errors.push({
            file: this.getRelativePath(filePath),
            scriptIndex: index + 1,
            type: "parse",
            message: `JSON 解析錯誤: ${error.message}`,
          });
        }
      });

      if (hasValidStructuredData) {
        this.validPages++;
      }
    } catch (error) {
      this.errors.push({
        file: this.getRelativePath(filePath),
        type: "file",
        message: `檔案讀取錯誤: ${error.message}`,
      });
    }
  }

  // 驗證 JSON-LD 結構
  validateJsonLd(jsonData) {
    const errors = [];

    // 檢查基本結構
    if (!jsonData["@context"]) {
      errors.push("缺少 @context");
    } else if (jsonData["@context"] !== "https://schema.org") {
      errors.push("@context 應該是 https://schema.org");
    }

    if (!jsonData["@type"]) {
      errors.push("缺少 @type");
    }

    // 根據不同類型檢查必要欄位
    const type = jsonData["@type"];

    switch (type) {
      case "WebSite":
        this.validateWebSite(jsonData, errors);
        break;
      case "Organization":
        this.validateOrganization(jsonData, errors);
        break;
      case "BlogPosting":
      case "Article":
        this.validateArticle(jsonData, errors);
        break;
      case "Review":
        this.validateReview(jsonData, errors);
        break;
      case "BreadcrumbList":
        this.validateBreadcrumb(jsonData, errors);
        break;
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  // 驗證 WebSite 類型
  validateWebSite(data, errors) {
    const required = ["url", "name"];
    required.forEach((field) => {
      if (!data[field]) {
        errors.push(`WebSite 缺少必要欄位: ${field}`);
      }
    });
  }

  // 驗證 Organization 類型
  validateOrganization(data, errors) {
    const required = ["name", "url"];
    required.forEach((field) => {
      if (!data[field]) {
        errors.push(`Organization 缺少必要欄位: ${field}`);
      }
    });

    if (data.logo && !data.logo.url) {
      errors.push("Organization logo 應包含 url");
    }
  }

  // 驗證文章類型
  validateArticle(data, errors) {
    const required = ["headline", "author", "publisher", "datePublished"];
    required.forEach((field) => {
      if (!data[field]) {
        errors.push(`${data["@type"]} 缺少必要欄位: ${field}`);
      }
    });

    // 檢查作者結構
    if (data.author && data.author["@type"] !== "Person") {
      errors.push("author 應該是 Person 類型");
    }

    // 檢查發布者結構
    if (data.publisher && data.publisher["@type"] !== "Organization") {
      errors.push("publisher 應該是 Organization 類型");
    }
  }

  // 驗證評論類型
  validateReview(data, errors) {
    this.validateArticle(data, errors); // 繼承文章驗證

    if (data.itemReviewed && !data.itemReviewed["@type"]) {
      errors.push("Review 的 itemReviewed 缺少 @type");
    }

    if (data.reviewRating && !data.reviewRating.ratingValue) {
      errors.push("Review 的 reviewRating 缺少 ratingValue");
    }
  }

  // 驗證麵包屑
  validateBreadcrumb(data, errors) {
    if (!data.itemListElement || !Array.isArray(data.itemListElement)) {
      errors.push("BreadcrumbList 缺少 itemListElement 陣列");
      return;
    }

    data.itemListElement.forEach((item, index) => {
      if (!item["@type"] || item["@type"] !== "ListItem") {
        errors.push(`麵包屑項目 ${index + 1} 應該是 ListItem 類型`);
      }
      if (!item.position) {
        errors.push(`麵包屑項目 ${index + 1} 缺少 position`);
      }
      if (!item.name) {
        errors.push(`麵包屑項目 ${index + 1} 缺少 name`);
      }
    });
  }

  // 生成驗證報告
  generateReport() {
    console.log("📊 驗證結果:\n");

    const successRate = ((this.validPages / this.totalPages) * 100).toFixed(1);
    console.log(
      `✅ 有效頁面: ${this.validPages}/${this.totalPages} (${successRate}%)`,
    );
    console.log(`⚠️  警告數量: ${this.warnings.length}`);
    console.log(`❌ 錯誤數量: ${this.errors.length}\n`);

    if (this.warnings.length > 0) {
      console.log("⚠️  警告列表:\n");
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.file}`);
        console.log(`   ${warning.message}\n`);
      });
    }

    if (this.errors.length > 0) {
      console.log("❌ 錯誤列表:\n");
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.file}`);
        if (error.scriptIndex) {
          console.log(`   Script ${error.scriptIndex}: ${error.message}`);
        } else {
          console.log(`   ${error.message}`);
        }
        console.log();
      });
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log("🎉 所有結構化資料驗證通過！\n");
    }

    console.log("💡 建議使用以下工具進一步測試:");
    console.log("   • Google Rich Results Test");
    console.log("   • Schema.org Validator");
    console.log("   • JSON-LD Playground");
  }

  // 輔助方法
  findHtmlFiles(dir) {
    const files = [];

    const walk = (currentDir) => {
      if (!fs.existsSync(currentDir)) return;

      fs.readdirSync(currentDir).forEach((file) => {
        const fullPath = path.join(currentDir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (path.extname(file) === ".html") {
          files.push(fullPath);
        }
      });
    };

    walk(dir);
    return files;
  }

  getRelativePath(filePath) {
    return path.relative(this.publicDir, filePath);
  }

  // 主要執行方法
  run() {
    this.validate();
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  const validator = new StructuredDataValidator();
  validator.run();
}

module.exports = StructuredDataValidator;
