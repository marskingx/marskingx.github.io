#!/usr/bin/env node
/**
 * 懶得變有錢 - 內容發布自動化工具
 * 功能：從 Notion 匯出 → 格式化 → 發布
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// 配置設定
const CONFIG = {
  contentDir: path.join(__dirname, '../content/blog'),
  imageDir: path.join(__dirname, '../assets/images/blog'),
  backupDir: path.join(__dirname, '../.content-backups'),
  templateFile: path.join(__dirname, 'post-template.md')
};

// 確保目錄存在
function ensureDirectories() {
  [CONFIG.contentDir, CONFIG.imageDir, CONFIG.backupDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// 生成標準化的 front matter
function generateFrontMatter(options) {
  const {
    title,
    description,
    date,
    category = '財務規劃與心態',
    tags = ['理財觀念'],
    author = '懶大'
  } = options;

  // 從標題提取分類
  const categoryMap = {
    '理財': '財務規劃與心態',
    '投資': '投資管理',
    '保險': '財務工具與金融商品',
    '嗑書': '閱讀心得',
    '書單': '閱讀心得',
    '生活': '生活感悟',
    '職涯': '職涯心得',
    'EP': 'Podcast'
  };

  const titleMatch = title.match(/【(.+?)】/);
  const detectedCategory = titleMatch ? categoryMap[titleMatch[1]] || category : category;

  // 生成 SEO 友善的 slug
  const slug = generateSlug(title, date);

  // 生成圖片檔名
  const imageDate = date.replace(/-/g, '');
  const imagePath = `/images/blog/${imageDate}.png`;

  return `---
title: ${title}
description: ${description}
author: ${author}
release: ${date}
date: ${date}
image: ${imagePath}
categories: [${detectedCategory}]
tags: [${tags.join(', ')}]
draft: false
slug: ${slug}
---`;
}

// 生成 SEO 友善的 URL slug
function generateSlug(title, date) {
  // 移除【】標籤
  let slug = title.replace(/【.*?】/g, '').trim();
  
  // 轉換中文關鍵字到英文
  const translations = {
    '理財': 'finance',
    '投資': 'investment',
    '保險': 'insurance',
    '存錢': 'saving',
    '財務規劃': 'financial-planning',
    '退休': 'retirement',
    'ETF': 'etf',
    '股票': 'stock',
    '基金': 'fund'
  };

  // 替換中文關鍵字
  Object.entries(translations).forEach(([chinese, english]) => {
    slug = slug.replace(new RegExp(chinese, 'g'), english);
  });

  // 轉換為 URL 友善格式
  slug = slug
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-')     // 空格轉破折號
    .replace(/-+/g, '-')      // 多個破折號合併
    .replace(/^-|-$/g, '');   // 移除開頭結尾破折號

  return slug || `post-${date}`;
}

// 處理內容格式化
function formatContent(content) {
  let formatted = content;

  // 確保圖片使用正確的 shortcode
  formatted = formatted.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, alt, src) => {
      if (src.startsWith('/images/blog/')) {
        return `{{< img src="${src}" alt="${alt}" >}}`;
      }
      return match;
    }
  );

  // 處理 Unsplash 圖片
  formatted = formatted.replace(
    /!\[([^\]]*)\]\((https:\/\/images\.unsplash\.com[^)]+)\)/g,
    '{{< img src="$2" alt="$1" >}}'
  );

  // 確保推薦閱讀使用 notice shortcode
  formatted = formatted.replace(
    /## 推薦閱讀[\s\S]*?(?=##|$)/g,
    (match) => {
      if (!match.includes('{{< notice')) {
        return match.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
          '{{< notice "note" >}}\n**推薦閱讀**: [$1]($2)\n{{< /notice >}}');
      }
      return match;
    }
  );

  return formatted;
}

// 驗證文章完整性
function validatePost(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // 檢查 front matter
  if (!content.startsWith('---')) {
    issues.push('缺少 front matter');
  }

  // 檢查必要欄位
  const requiredFields = ['title', 'description', 'author', 'date', 'image', 'categories', 'tags'];
  requiredFields.forEach(field => {
    if (!content.includes(`${field}:`)) {
      issues.push(`缺少 ${field} 欄位`);
    }
  });

  // 檢查圖片路徑
  const imageMatches = content.match(/image: (.+)/);
  if (imageMatches) {
    const imagePath = path.join(__dirname, '..', 'assets', imageMatches[1]);
    if (!fs.existsSync(imagePath)) {
      issues.push(`圖片檔案不存在: ${imageMatches[1]}`);
    }
  }

  // 檢查內容長度
  const contentWithoutFrontMatter = content.split('---').slice(2).join('---');
  if (contentWithoutFrontMatter.length < 500) {
    issues.push('內容長度過短（少於 500 字）');
  }

  return issues;
}

// 備份現有檔案
function backupFile(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = path.join(
      CONFIG.backupDir, 
      `${path.basename(filePath)}.${Date.now()}.backup`
    );
    fs.copyFileSync(filePath, backupPath);
    console.log(`📁 已備份: ${backupPath}`);
  }
}

// 主要處理函數
async function processNotionExport(notionFilePath, options = {}) {
  try {
    console.log('🚀 開始處理 Notion 匯出檔案...');
    
    // 確保目錄存在
    ensureDirectories();

    // 讀取 Notion 匯出內容
    const notionContent = fs.readFileSync(notionFilePath, 'utf8');
    
    // 提取標題和日期
    const titleMatch = notionContent.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : options.title || '未命名文章';
    
    const date = options.date || new Date().toISOString().split('T')[0];
    
    // 生成檔案名稱
    const fileName = `${date}${title}.md`;
    const filePath = path.join(CONFIG.contentDir, fileName);
    
    // 備份現有檔案
    backupFile(filePath);
    
    // 生成 front matter
    const frontMatter = generateFrontMatter({
      title,
      description: options.description || '請填寫文章描述',
      date,
      category: options.category,
      tags: options.tags || ['理財觀念']
    });
    
    // 格式化內容
    const contentBody = notionContent.replace(/^# .+$/m, '').trim();
    const formattedContent = formatContent(contentBody);
    
    // 組合最終內容
    const finalContent = `${frontMatter}\n\n${formattedContent}`;
    
    // 寫入檔案
    fs.writeFileSync(filePath, finalContent, 'utf8');
    console.log(`✅ 文章已處理: ${fileName}`);
    
    // 驗證文章
    const issues = validatePost(filePath);
    if (issues.length > 0) {
      console.log('⚠️  發現問題:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log('✅ 文章驗證通過');
    }
    
    return {
      success: true,
      filePath,
      issues
    };
    
  } catch (error) {
    console.error('❌ 處理失敗:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// 批量處理多個檔案
async function processBatch(notionDir) {
  const files = fs.readdirSync(notionDir).filter(f => f.endsWith('.md'));
  const results = [];
  
  for (const file of files) {
    const filePath = path.join(notionDir, file);
    const result = await processNotionExport(filePath);
    results.push({ file, result });
  }
  
  return results;
}

// 一鍵發布流程
async function quickPublish(filePath) {
  try {
    console.log('🚀 開始一鍵發布流程...');
    
    // 1. 建置網站
    console.log('📦 建置網站...');
    await execAsync('npm run build');
    
    // 2. 提交到 Git
    console.log('📤 提交變更...');
    await execAsync('git add .');
    
    const commitMessage = `feat: 新增文章 - ${path.basename(filePath, '.md')}
    
🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;
    
    await execAsync(`git commit -m "${commitMessage}"`);
    
    // 3. 推送到遠端
    console.log('🚀 推送到 GitHub...');
    await execAsync('git push origin main');
    
    console.log('✅ 發布完成！');
    
  } catch (error) {
    console.error('❌ 發布失敗:', error.message);
  }
}

// CLI 介面
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'process':
      const filePath = args[1];
      if (!filePath) {
        console.error('請提供 Notion 匯出檔案路徑');
        process.exit(1);
      }
      processNotionExport(filePath);
      break;
      
    case 'batch':
      const dirPath = args[1];
      if (!dirPath) {
        console.error('請提供 Notion 匯出目錄路徑');
        process.exit(1);
      }
      processBatch(dirPath);
      break;
      
    case 'publish':
      const postPath = args[1];
      if (!postPath) {
        console.error('請提供文章檔案路徑');
        process.exit(1);
      }
      quickPublish(postPath);
      break;
      
    default:
      console.log(`
懶得變有錢 - 內容發布自動化工具

使用方法:
  node content-workflow.js process <notion-export.md>  # 處理單一 Notion 匯出檔案
  node content-workflow.js batch <notion-export-dir>   # 批量處理 Notion 匯出檔案
  node content-workflow.js publish <post-file.md>      # 一鍵發布文章

範例:
  node content-workflow.js process ./notion-export.md
  node content-workflow.js batch ./notion-exports/
  node content-workflow.js publish ./content/blog/2024-08-20文章.md
      `);
  }
}

module.exports = {
  processNotionExport,
  processBatch,
  quickPublish,
  generateFrontMatter,
  formatContent,
  validatePost
};