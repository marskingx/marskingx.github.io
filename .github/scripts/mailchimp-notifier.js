#!/usr/bin/env node

/**
 * Mailchimp Newsletter Auto-Notification Script
 * 
 * 此腳本用於自動檢測新文章並發送 Mailchimp 電子報通知
 * 功能：
 * 1. 檢測 Git commit 中是否有新增的部落格文章
 * 2. 解析文章的 front matter 取得標題、摘要等資訊
 * 3. 透過 Mailchimp API 創建並發送電子報
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const axios = require('axios');
const matter = require('front-matter');

// 配置設定
const CONFIG = {
  // Mailchimp API 設定
  MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY,
  MAILCHIMP_SERVER_PREFIX: process.env.MAILCHIMP_SERVER_PREFIX || 'us14',
  MAILCHIMP_AUDIENCE_ID: process.env.MAILCHIMP_AUDIENCE_ID,
  
  // 網站設定
  SITE_BASE_URL: process.env.SITE_BASE_URL || 'https://marskingx.github.io',
  
  // 內容路徑設定
  CONTENT_PATHS: ['content/blog/', 'content/posts/'],
  
  // 電子報模板設定
  TEMPLATE: {
    FROM_NAME: '懶得變有錢',
    FROM_EMAIL: 'noreply@lazytoberich.com',
    SUBJECT_PREFIX: '【懶得變有錢】新文章通知：',
    CAMPAIGN_TYPE: 'regular'
  }
};

// 日誌函數
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  console.log(logMessage);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// 錯誤處理函數
function handleError(message, error) {
  log('error', message, { error: error.message, stack: error.stack });
  process.exit(1);
}

// 檢查必要的環境變數
function validateEnvironment() {
  const required = ['MAILCHIMP_API_KEY', 'MAILCHIMP_AUDIENCE_ID'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    handleError(`缺少必要的環境變數: ${missing.join(', ')}`);
  }
  
  log('info', '環境變數驗證通過');
}

// 取得 Git 變更的檔案列表
function getChangedFiles() {
  try {
    // 取得本次 commit 與上一個 commit 的差異
    const output = execSync('git diff --name-status HEAD~1 HEAD', { encoding: 'utf8' });
    
    if (!output.trim()) {
      log('info', '沒有檔案變更');
      return [];
    }
    
    const files = output
      .trim()
      .split('\n')
      .map(line => {
        const [status, ...fileParts] = line.split('\t');
        const filePath = fileParts.join('\t');
        return { status, path: filePath };
      });
    
    log('info', '檢測到檔案變更', { files });
    return files;
    
  } catch (error) {
    handleError('無法取得 Git 變更檔案', error);
  }
}

// 檢查是否為新增的部落格文章
function findNewArticles(changedFiles) {
  const newArticles = changedFiles
    .filter(file => {
      // 只處理新增的檔案 (A = Added)
      if (file.status !== 'A') return false;
      
      // 檢查是否為 Markdown 檔案且在指定的內容路徑中
      if (!file.path.endsWith('.md')) return false;
      
      return CONFIG.CONTENT_PATHS.some(contentPath => 
        file.path.startsWith(contentPath)
      );
    })
    .map(file => file.path);
  
  log('info', `發現 ${newArticles.length} 篇新文章`, { articles: newArticles });
  return newArticles;
}

// 解析文章的 front matter 和內容
function parseArticle(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`檔案不存在: ${filePath}`);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    
    // 提取基本資訊
    const frontMatter = parsed.attributes;
    const body = parsed.body;
    
    // 生成文章 URL
    const slug = frontMatter.slug || path.basename(filePath, '.md');
    const permalink = `${CONFIG.SITE_BASE_URL}/blog/${slug}/`;
    
    // 生成摘要（如果沒有描述的話）
    let summary = frontMatter.description || frontMatter.summary || '';
    if (!summary && body) {
      // 從文章內容中提取前 200 個字作為摘要
      summary = body
        .replace(/[#*_`]/g, '') // 移除 Markdown 標記
        .replace(/\n/g, ' ') // 換行符替換為空格
        .trim()
        .substring(0, 200) + '...';
    }
    
    const article = {
      title: frontMatter.title || '未命名文章',
      description: summary,
      permalink,
      author: frontMatter.author || '懶大',
      date: frontMatter.date || new Date().toISOString(),
      categories: frontMatter.categories || [],
      tags: frontMatter.tags || [],
      image: frontMatter.image || null,
      filePath
    };
    
    log('info', '文章解析完成', { article });
    return article;
    
  } catch (error) {
    handleError(`解析文章失敗: ${filePath}`, error);
  }
}

// 創建 Mailchimp 電子報內容
function createEmailContent(article) {
  const imageSection = article.image 
    ? `<img src="${CONFIG.SITE_BASE_URL}${article.image}" alt="${article.title}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;">` 
    : '';
  
  const categoriesText = article.categories.length > 0 
    ? `<p style="color: #666; font-size: 14px; margin: 0;">分類: ${article.categories.join(', ')}</p>` 
    : '';
  
  const tagsText = article.tags.length > 0 
    ? `<p style="color: #666; font-size: 14px; margin: 0;">標籤: ${article.tags.join(', ')}</p>` 
    : '';
  
  return `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Arial', 'Microsoft JhengHei', sans-serif; line-height: 1.6;">
      <header style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
        <h1 style="color: #121212; margin: 0; font-size: 24px;">懶得變有錢</h1>
        <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">理財 · 投資 · 生活</p>
      </header>
      
      <main style="padding: 30px 20px;">
        ${imageSection}
        
        <h2 style="color: #121212; margin: 0 0 15px 0; font-size: 22px; line-height: 1.3;">
          ${article.title}
        </h2>
        
        <div style="margin-bottom: 15px;">
          ${categoriesText}
          ${tagsText}
        </div>
        
        <p style="color: #444; margin: 0 0 25px 0; font-size: 16px;">
          ${article.description}
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${article.permalink}" 
             style="display: inline-block; background-color: #121212; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 16px;">
            閱讀完整文章 →
          </a>
        </div>
      </main>
      
      <footer style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
          感謝您訂閱懶得變有錢電子報！
        </p>
        <p style="margin: 0; font-size: 12px; color: #999;">
          如果不想再收到這些郵件，您可以 
          <a href="*|UNSUB|*" style="color: #666;">取消訂閱</a>
        </p>
      </footer>
    </div>
  `;
}

// 透過 Mailchimp API 創建電子報活動
async function createMailchimpCampaign(article) {
  try {
    const apiUrl = `https://${CONFIG.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/campaigns`;
    
    const campaignData = {
      type: CONFIG.TEMPLATE.CAMPAIGN_TYPE,
      recipients: {
        list_id: CONFIG.MAILCHIMP_AUDIENCE_ID
      },
      settings: {
        subject_line: `${CONFIG.TEMPLATE.SUBJECT_PREFIX}${article.title}`,
        title: `Blog Post: ${article.title}`,
        from_name: CONFIG.TEMPLATE.FROM_NAME,
        reply_to: CONFIG.TEMPLATE.FROM_EMAIL,
        to_name: '*|FNAME|*',
        auto_footer: false,
        inline_css: true
      }
    };
    
    log('info', '正在創建 Mailchimp 活動...', { campaignData });
    
    const response = await axios.post(apiUrl, campaignData, {
      headers: {
        'Authorization': `Bearer ${CONFIG.MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const campaignId = response.data.id;
    log('info', '活動創建成功', { campaignId });
    
    return campaignId;
    
  } catch (error) {
    if (error.response) {
      log('error', 'Mailchimp API 錯誤', {
        status: error.response.status,
        data: error.response.data
      });
    }
    handleError('創建 Mailchimp 活動失敗', error);
  }
}

// 設定電子報內容
async function setEmailContent(campaignId, article) {
  try {
    const apiUrl = `https://${CONFIG.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/campaigns/${campaignId}/content`;
    
    const emailContent = createEmailContent(article);
    
    const contentData = {
      html: emailContent,
      plain_text: `
新文章發布通知

${article.title}

${article.description}

閱讀完整文章：${article.permalink}

---
懶得變有錢
理財 · 投資 · 生活
      `.trim()
    };
    
    log('info', '正在設定電子報內容...', { campaignId });
    
    await axios.put(apiUrl, contentData, {
      headers: {
        'Authorization': `Bearer ${CONFIG.MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    log('info', '電子報內容設定成功');
    
  } catch (error) {
    if (error.response) {
      log('error', 'Mailchimp API 錯誤', {
        status: error.response.status,
        data: error.response.data
      });
    }
    handleError('設定電子報內容失敗', error);
  }
}

// 發送電子報
async function sendCampaign(campaignId) {
  try {
    const apiUrl = `https://${CONFIG.MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/send`;
    
    log('info', '正在發送電子報...', { campaignId });
    
    await axios.post(apiUrl, {}, {
      headers: {
        'Authorization': `Bearer ${CONFIG.MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    log('info', '電子報發送成功！', { campaignId });
    
  } catch (error) {
    if (error.response) {
      log('error', 'Mailchimp API 錯誤', {
        status: error.response.status,
        data: error.response.data
      });
    }
    handleError('發送電子報失敗', error);
  }
}

// 主要執行函數
async function main() {
  try {
    log('info', '開始執行 Mailchimp 通知腳本...');
    
    // 1. 驗證環境變數
    validateEnvironment();
    
    // 2. 取得變更檔案
    const changedFiles = getChangedFiles();
    
    if (changedFiles.length === 0) {
      log('info', '沒有檔案變更，結束執行');
      return;
    }
    
    // 3. 找出新文章
    const newArticles = findNewArticles(changedFiles);
    
    if (newArticles.length === 0) {
      log('info', '沒有新文章，結束執行');
      return;
    }
    
    // 4. 處理每篇新文章
    for (const articlePath of newArticles) {
      log('info', `處理文章: ${articlePath}`);
      
      // 解析文章
      const article = parseArticle(articlePath);
      
      // 創建 Mailchimp 活動
      const campaignId = await createMailchimpCampaign(article);
      
      // 設定電子報內容
      await setEmailContent(campaignId, article);
      
      // 發送電子報
      await sendCampaign(campaignId);
      
      log('info', `文章 "${article.title}" 的電子報已成功發送`);
    }
    
    log('info', `所有新文章處理完成，共發送 ${newArticles.length} 封電子報`);
    
  } catch (error) {
    handleError('腳本執行失敗', error);
  }
}

// 執行主函數
if (require.main === module) {
  main();
}

module.exports = {
  main,
  parseArticle,
  createEmailContent,
  findNewArticles
};