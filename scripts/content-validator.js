#!/usr/bin/env node
/**
 * 內容驗證器 - 檢查文章完整性和SEO優化
 */

const fs = require('fs');
const path = require('path');

class ContentValidator {
  constructor() {
    this.rules = {
      frontMatter: {
        required: ['title', 'description', 'author', 'date', 'image', 'categories', 'tags', 'slug'],
        optional: ['draft', 'release']
      },
      content: {
        minLength: 500,
        maxLength: 10000,
        requiredSections: []
      },
      seo: {
        titleLength: { min: 30, max: 60 },
        descriptionLength: { min: 120, max: 160 },
        slugFormat: /^[a-z0-9-]+$/
      }
    };
  }

  validateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const results = {
        file: path.basename(filePath),
        errors: [],
        warnings: [],
        suggestions: []
      };

      // 解析 front matter
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontMatterMatch) {
        results.errors.push('❌ 缺少 front matter');
        return results;
      }

      const frontMatterText = frontMatterMatch[1];
      const frontMatter = this.parseFrontMatter(frontMatterText);
      const contentBody = content.replace(/^---\n[\s\S]*?\n---\n/, '');

      // 驗證 front matter
      this.validateFrontMatter(frontMatter, results);
      
      // 驗證內容
      this.validateContent(contentBody, results);
      
      // SEO 檢查
      this.validateSEO(frontMatter, contentBody, results);
      
      // 圖片檢查
      this.validateImages(frontMatter, contentBody, results);

      return results;
      
    } catch (error) {
      return {
        file: path.basename(filePath),
        errors: [`❌ 檔案讀取錯誤: ${error.message}`],
        warnings: [],
        suggestions: []
      };
    }
  }

  parseFrontMatter(text) {
    const frontMatter = {};
    const lines = text.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        frontMatter[key] = value.trim();
      }
    }
    
    return frontMatter;
  }

  validateFrontMatter(frontMatter, results) {
    // 檢查必要欄位
    for (const field of this.rules.frontMatter.required) {
      if (!frontMatter[field]) {
        results.errors.push(`❌ 缺少必要欄位: ${field}`);
      }
    }

    // 檢查分類格式
    if (frontMatter.categories) {
      if (!frontMatter.categories.startsWith('[') || !frontMatter.categories.endsWith(']')) {
        results.warnings.push('⚠️ 分類格式建議使用陣列格式: [分類名稱]');
      }
    }

    // 檢查標籤格式
    if (frontMatter.tags) {
      if (!frontMatter.tags.startsWith('[') || !frontMatter.tags.endsWith(']')) {
        results.warnings.push('⚠️ 標籤格式建議使用陣列格式: [標籤1, 標籤2]');
      }
    }

    // 檢查日期格式
    if (frontMatter.date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(frontMatter.date)) {
        results.errors.push('❌ 日期格式錯誤，應為 YYYY-MM-DD');
      }
    }
  }

  validateContent(content, results) {
    const textLength = content.replace(/[#\s\n\r\[\](){}]/g, '').length;
    
    // 檢查內容長度
    if (textLength < this.rules.content.minLength) {
      results.warnings.push(`⚠️ 內容較短 (${textLength} 字)，建議至少 ${this.rules.content.minLength} 字`);
    }

    if (textLength > this.rules.content.maxLength) {
      results.warnings.push(`⚠️ 內容較長 (${textLength} 字)，考慮分割成多篇文章`);
    }

    // 檢查結構
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    if (headings.length < 3) {
      results.suggestions.push('💡 建議增加更多小標題以改善文章結構');
    }

    // 檢查是否有結論
    if (!content.includes('{{< quote') && !content.includes('## 懶得有結論') && !content.includes('## 結論')) {
      results.suggestions.push('💡 建議添加結論區塊');
    }

    // 檢查推薦閱讀
    if (!content.includes('{{< notice') && !content.includes('推薦閱讀')) {
      results.suggestions.push('💡 建議添加推薦閱讀區塊以增加內部連結');
    }
  }

  validateSEO(frontMatter, content, results) {
    // 檢查標題長度
    if (frontMatter.title) {
      const titleLength = frontMatter.title.length;
      if (titleLength < this.rules.seo.titleLength.min) {
        results.warnings.push(`⚠️ 標題過短 (${titleLength} 字)，建議 ${this.rules.seo.titleLength.min}-${this.rules.seo.titleLength.max} 字`);
      } else if (titleLength > this.rules.seo.titleLength.max) {
        results.warnings.push(`⚠️ 標題過長 (${titleLength} 字)，建議 ${this.rules.seo.titleLength.min}-${this.rules.seo.titleLength.max} 字`);
      }
    }

    // 檢查描述長度
    if (frontMatter.description) {
      const descLength = frontMatter.description.length;
      if (descLength < this.rules.seo.descriptionLength.min) {
        results.warnings.push(`⚠️ 描述過短 (${descLength} 字)，建議 ${this.rules.seo.descriptionLength.min}-${this.rules.seo.descriptionLength.max} 字`);
      } else if (descLength > this.rules.seo.descriptionLength.max) {
        results.warnings.push(`⚠️ 描述過長 (${descLength} 字)，建議 ${this.rules.seo.descriptionLength.min}-${this.rules.seo.descriptionLength.max} 字`);
      }
    }

    // 檢查 slug 格式
    if (frontMatter.slug) {
      if (!this.rules.seo.slugFormat.test(frontMatter.slug)) {
        results.errors.push('❌ slug 格式錯誤，只能包含小寫字母、數字和破折號');
      }
    }

    // 檢查關鍵字密度
    if (frontMatter.title && content) {
      const titleKeywords = this.extractKeywords(frontMatter.title);
      const contentLower = content.toLowerCase();
      const keywordDensity = titleKeywords.filter(keyword => 
        contentLower.includes(keyword.toLowerCase())
      ).length / titleKeywords.length;

      if (keywordDensity < 0.5) {
        results.suggestions.push('💡 建議在內容中更多使用標題關鍵字');
      }
    }
  }

  validateImages(frontMatter, content, results) {
    // 檢查封面圖片
    if (frontMatter.image) {
      const imagePath = path.join(__dirname, '..', 'assets', frontMatter.image);
      if (!fs.existsSync(imagePath)) {
        results.errors.push(`❌ 封面圖片不存在: ${frontMatter.image}`);
      }
    }

    // 檢查內容中的圖片
    const imageMatches = content.match(/{{<\s*img\s+src="([^"]+)"/g) || [];
    for (const match of imageMatches) {
      const srcMatch = match.match(/src="([^"]+)"/);
      if (srcMatch) {
        const imagePath = path.join(__dirname, '..', 'assets', srcMatch[1]);
        if (!fs.existsSync(imagePath)) {
          results.errors.push(`❌ 內容圖片不存在: ${srcMatch[1]}`);
        }
      }
    }

    // 檢查 alt 標籤
    const missingAltImages = content.match(/{{<\s*img\s+src="[^"]+"\s*>}}/g) || [];
    if (missingAltImages.length > 0) {
      results.warnings.push(`⚠️ 有 ${missingAltImages.length} 張圖片缺少 alt 標籤`);
    }
  }

  extractKeywords(title) {
    return title
      .replace(/【.*?】/g, '')
      .split(/[\s\-\|,，、]+/)
      .filter(word => word.length > 1);
  }

  validateDirectory(dirPath) {
    const files = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.md') && file !== '_index.md')
      .map(file => path.join(dirPath, file));

    const results = [];
    let totalErrors = 0;
    let totalWarnings = 0;

    for (const file of files) {
      const result = this.validateFile(file);
      results.push(result);
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
    }

    // 生成報告
    console.log('\n📊 內容驗證報告');
    console.log('='.repeat(50));
    console.log(`📁 檢查檔案: ${files.length} 個`);
    console.log(`❌ 總錯誤: ${totalErrors}`);
    console.log(`⚠️  總警告: ${totalWarnings}`);
    console.log('');

    // 顯示詳細結果
    for (const result of results) {
      if (result.errors.length > 0 || result.warnings.length > 0 || result.suggestions.length > 0) {
        console.log(`📄 ${result.file}`);
        result.errors.forEach(error => console.log(`  ${error}`));
        result.warnings.forEach(warning => console.log(`  ${warning}`));
        result.suggestions.forEach(suggestion => console.log(`  ${suggestion}`));
        console.log('');
      }
    }

    return {
      totalFiles: files.length,
      totalErrors,
      totalWarnings,
      results
    };
  }
}

// CLI 介面
if (require.main === module) {
  const args = process.argv.slice(2);
  const validator = new ContentValidator();

  if (args.length === 0) {
    console.log(`
內容驗證器

使用方法:
  node content-validator.js <file>     # 驗證單一檔案
  node content-validator.js --dir      # 驗證整個 blog 目錄

範例:
  node content-validator.js ../content/blog/2024-08-20文章.md
  node content-validator.js --dir
    `);
    process.exit(0);
  }

  if (args[0] === '--dir') {
    const blogDir = path.join(__dirname, '../content/blog');
    validator.validateDirectory(blogDir);
  } else {
    const filePath = args[0];
    const result = validator.validateFile(filePath);
    
    console.log(`\n📄 ${result.file}`);
    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log('✅ 驗證通過！');
    } else {
      result.errors.forEach(error => console.log(`  ${error}`));
      result.warnings.forEach(warning => console.log(`  ${warning}`));
      result.suggestions.forEach(suggestion => console.log(`  ${suggestion}`));
    }
  }
}

module.exports = ContentValidator;