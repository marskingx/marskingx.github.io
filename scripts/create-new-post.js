#!/usr/bin/env node
/**
 * 建立新文章工具 - 互動式創建符合部落格規範的新文章
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class PostCreator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.categories = [
      '財務規劃與心態',
      '投資管理', 
      '財務工具與金融商品',
      '閱讀心得',
      '生活感悟',
      '職涯心得',
      'Podcast'
    ];
    
    this.commonTags = [
      '理財觀念', '投資理財', '收支管理', '存錢', '退休規劃',
      'ETF', '基金', '股票', '保險', '記帳', '財務規劃',
      '美股', '台股', '複委託', '資產配置', '職涯心得'
    ];
  }

  async ask(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  async selectFromList(prompt, options) {
    console.log(prompt);
    options.forEach((option, index) => {
      console.log(`  ${index + 1}. ${option}`);
    });
    
    const answer = await this.ask('請選擇 (輸入數字): ');
    const index = parseInt(answer) - 1;
    
    if (index >= 0 && index < options.length) {
      return options[index];
    } else {
      console.log('無效選擇，請重新輸入');
      return this.selectFromList(prompt, options);
    }
  }

  generateSlug(title, date) {
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
      '基金': 'fund',
      '美股': 'us-stock',
      '台股': 'tw-stock',
      'Podcast': 'podcast',
      '閱讀': 'reading',
      '心得': 'review'
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

  async create() {
    try {
      console.log('\n🚀 建立新文章');
      console.log('='.repeat(40));

      // 1. 文章標題
      const title = await this.ask('📝 文章標題 (包含【分類】): ');
      if (!title.trim()) {
        console.log('❌ 標題不能為空');
        this.rl.close();
        return;
      }

      // 2. 文章描述
      const description = await this.ask('📄 文章描述 (120-160字，用於SEO): ');
      if (!description.trim()) {
        console.log('❌ 描述不能為空');
        this.rl.close();
        return;
      }

      // 3. 發布日期
      const defaultDate = new Date().toISOString().split('T')[0];
      const dateInput = await this.ask(`📅 發布日期 (${defaultDate}): `);
      const date = dateInput.trim() || defaultDate;

      // 4. 選擇分類
      const category = await this.selectFromList('\n📂 選擇文章分類:', this.categories);

      // 5. 選擇標籤
      console.log('\n🏷️  選擇標籤 (可多選，用逗號分隔數字):');
      this.commonTags.forEach((tag, index) => {
        console.log(`  ${index + 1}. ${tag}`);
      });
      
      const tagInput = await this.ask('請選擇標籤數字 (例: 1,3,5): ');
      const tagIndices = tagInput.split(',').map(n => parseInt(n.trim()) - 1);
      const selectedTags = tagIndices
        .filter(i => i >= 0 && i < this.commonTags.length)
        .map(i => this.commonTags[i]);

      if (selectedTags.length === 0) {
        selectedTags.push('理財觀念'); // 預設標籤
      }

      // 6. 文章類型
      const postTypes = ['一般文章', 'Podcast 逐字稿', '書評心得'];
      const postType = await this.selectFromList('\n📋 選擇文章類型:', postTypes);

      // 7. 生成檔案
      await this.generatePost({
        title,
        description,
        date,
        category,
        tags: selectedTags,
        postType
      });

      console.log('\n✅ 文章建立完成！');
      
    } catch (error) {
      console.error('❌ 建立失敗:', error.message);
    } finally {
      this.rl.close();
    }
  }

  async generatePost(data) {
    const { title, description, date, category, tags, postType } = data;
    
    // 生成檔案名稱
    const fileName = `${date}${title}.md`;
    const filePath = path.join(__dirname, '../content/blog', fileName);
    
    // 檢查檔案是否已存在
    if (fs.existsSync(filePath)) {
      const overwrite = await this.ask('📄 檔案已存在，是否覆蓋？ (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ 取消建立');
        return;
      }
    }

    // 生成 slug
    const slug = this.generateSlug(title, date);
    
    // 生成圖片檔名
    const imageDate = date.replace(/-/g, '');
    const imagePath = `/images/blog/${imageDate}.png`;

    // 生成內容模板
    let contentTemplate = '';
    
    switch (postType) {
      case 'Podcast 逐字稿':
        contentTemplate = this.getPodcastTemplate();
        break;
      case '書評心得':
        contentTemplate = this.getBookReviewTemplate();
        break;
      default:
        contentTemplate = this.getGeneralTemplate();
    }

    // 生成完整內容
    const frontMatter = `---
title: ${title}
description: ${description}
author: 懶大
release: ${date}
date: ${date}
image: ${imagePath}
categories: [${category}]
tags: [${tags.join(', ')}]
draft: false
slug: ${slug}
---`;

    const fullContent = `${frontMatter}\n\n${contentTemplate}`;

    // 寫入檔案
    fs.writeFileSync(filePath, fullContent, 'utf8');
    
    console.log(`\n📄 檔案已建立: ${fileName}`);
    console.log(`📂 路徑: ${filePath}`);
    console.log(`🔗 Slug: ${slug}`);
    console.log(`🖼️  圖片: ${imagePath}`);
    
    // 提醒需要準備的事項
    console.log('\n📋 接下來需要準備:');
    console.log(`   1. 準備封面圖片: assets${imagePath}`);
    console.log('   2. 完善文章內容');
    console.log('   3. 執行 npm run content:validate:file 驗證');
    console.log('   4. 執行 npm run content:publish 發布');
  }

  getGeneralTemplate() {
    return `## 引言

在這篇文章中，我們將探討...

## 主要內容

### 重點一

詳細說明重點一的內容...

### 重點二

詳細說明重點二的內容...

### 重點三

詳細說明重點三的內容...

## 實用建議

基於以上分析，我建議...

{{< notice "note" >}}
**推薦閱讀**: [相關文章標題](相關文章連結)
{{< /notice >}}

## 懶得有結論

{{< quote author="懶大" >}}
總結性的觀點和建議...
{{< /quote >}}

{{< img src="/images/blog/lazytobeconclude.svg" alt="懶得有結論" >}}`;
  }

  getPodcastTemplate() {
    return `> 本文是 Podcast 節目的重點整理，完整音檔請收聽：

{{< podcast-player episode="EP###" >}}

## 本集重點

- 重點一
- 重點二  
- 重點三

## 詳細內容

### 開場白

歡迎收聽懶得變有錢 Podcast...

### 主要討論

詳細的討論內容...

### 聽眾問答

回答聽眾的問題...

{{< notice "note" >}}
**推薦閱讀**: [相關文章標題](相關文章連結)
{{< /notice >}}

## 懶得有結論

{{< quote author="懶大" >}}
本集的核心觀點和建議...
{{< /quote >}}

{{< img src="/images/blog/lazytobeconclude.svg" alt="懶得有結論" >}}

---

🎧 **訂閱 Podcast**: [Apple Podcast](https://podcasts.apple.com/podcast/懶得變有錢/id1688564341) | [Spotify](https://open.spotify.com/show/7wY2wEJgBgY9Q8T8dTpJkJ)`;
  }

  getBookReviewTemplate() {
    return `## 書籍資訊

- **書名**: 《書名》
- **作者**: 作者名
- **出版社**: 出版社
- **出版年份**: 年份
- **評分**: ⭐⭐⭐⭐⭐ (5/5)

## 為什麼推薦這本書

這本書適合...的讀者，因為...

## 核心觀點

### 觀點一

書中提到的重要概念...

### 觀點二

另一個值得關注的觀點...

### 觀點三

實用的方法和建議...

## 個人心得

閱讀這本書後，我最大的收穫是...

## 理財應用

這本書的觀點如何應用到理財規劃中：

1. 應用一
2. 應用二
3. 應用三

{{< notice "note" >}}
**推薦閱讀**: [其他書評文章](相關書評連結)
{{< /notice >}}

## 懶得有結論

{{< quote author="懶大" >}}
總結這本書對理財規劃的啟發...
{{< /quote >}}

{{< img src="/images/blog/lazytobeconclude.svg" alt="懶得有結論" >}}`;
  }
}

// CLI 執行
if (require.main === module) {
  const creator = new PostCreator();
  creator.create();
}

module.exports = PostCreator;