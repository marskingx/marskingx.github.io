# 懶得變有錢 | 理解財務規劃本質 鑑定你的財務DNA

[![Hugo](https://img.shields.io/badge/Hugo-0.148.2-FF4088?style=flat&logo=hugo)](https://gohugo.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-222222?style=flat&logo=github)](https://marskingx.github.io/)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red)](https://lazytoberich.com.tw/)

> **懶．是一種思維模式**，用乘法的效率，解決加法的事情。  
> **懶．是一種生活方式**，用專注體驗當下，迎接一直來的未來。

「懶得變有錢」是由 Mars（懶大）創立的財務規劃部落格，致力於幫助讀者理解財務規劃的本質，找到自己的財務DNA。透過深入淺出的文章和實用的理財知識，讓更多人能夠建立正確的理財觀念，邁向財務自由。

## 🌟 網站特色

### 📝 內容豐富
- **140+ 原創文章**：涵蓋投資理財、財務規劃、職涯發展、閱讀心得等主題
- **分類完整**：財務規劃與心態、投資、理財、生活、閱讀等多元分類
- **定期更新**：持續分享最新的理財觀念和實務經驗

### 🎧 多媒體整合
- **Podcast 節目**：「懶得變有錢」音頻內容
- **Apple Podcast**：完整的 Podcast 訂閱和推廣功能
- **社群整合**：Facebook、Instagram、Threads、Discord 等多平台連結

### 🔍 SEO 優化
- **結構化資料**：完整的 JSON-LD Schema.org 標記
- **智慧評分系統**：書評文章自動產生星級評分結構化資料
- **搜尋引擎友善**：Google Search Console、Bing 驗證完整設定

## 🛠 技術架構

### 核心技術
- **靜態網站生成器**：Hugo 0.148.2
- **CSS 框架**：TailwindCSS 3.4
- **主題**：Hugoplate 1.15.1（高度客製化）
- **部署平台**：GitHub Pages
- **內容管理**：Git-based workflow

### 效能優化
- **圖片優化**：自動 WebP 轉換，responsive images
- **載入優化**：DNS 預解析、資源預載入、Service Worker
- **快取策略**：Hugo 內建快取 + CDN 優化
- **代碼分割**：延遲載入非關鍵資源

### 開發工具
```bash
# 本地開發
npm run dev          # 開發伺服器
npm run build        # 生產建置
npm run preview      # 預覽生產版本

# 版本管理（四位版本號系統）
npm run version:show     # 顯示當前版本
npm run version:content  # 內容更新版本
npm run version:patch    # 錯誤修正版本
npm run version:minor    # 新功能版本
npm run version:major    # 重大更新版本

# 工具
npm run format          # 代碼格式化
npm run images:analyze  # 圖片使用分析
npm run perf:analyze    # 效能分析
npm run schema:validate # 結構化資料驗證
```

## 📊 專案統計

- **部落格文章**：140+ 篇
- **圖片資源**：275 張（自動 WebP 優化）
- **靜態檔案**：3,929 個，350.38 MB
- **建置時間**：平均 3.2 秒
- **Lighthouse 分數**：效能 95+ / SEO 100

## 🚀 快速開始

### 環境需求
- Node.js 18+
- Hugo 0.148.2+
- Git

### 安裝與執行
```bash
# 複製專案
git clone https://github.com/marskingx/marskingx.github.io.git
cd marskingx.github.io

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 瀏覽網站
open http://localhost:1313
```

### 新增文章
```bash
# 創建新文章
hugo new content/blog/YYYY-MM-DD-文章標題.md

# 編輯文章內容
# 確保 front matter 設定完整

# 本地預覽
npm run dev

# 建置發布
npm run build
```

## 📁 專案結構

```
marskingx.github.io/
├── content/
│   ├── blog/           # 部落格文章（140+ 篇）
│   ├── podcast/        # Podcast 內容
│   ├── authors/        # 作者資訊
│   ├── pages/          # 靜態頁面
│   └── sections/       # 頁面區塊
├── assets/
│   └── images/         # 圖片資源
├── layouts/
│   ├── partials/       # 自定義模板
│   └── structured-data/ # JSON-LD 結構化資料
├── static/             # 靜態檔案
├── config/_default/    # Hugo 配置
├── themes/hugoplate/   # 主題檔案
└── package.json        # 專案依賴
```

## 🤝 社群連結

- **官方網站**：[lazytoberich.com.tw](https://lazytoberich.com.tw)
- **Facebook**：[@lazytoberich](https://www.facebook.com/lazytoberich)
- **Instagram**：[@lazytoberich](https://www.instagram.com/lazytoberich/)
- **Threads**：[@lazytoberich](https://www.threads.net/@lazytoberich/)
- **Discord**：[懶得變有錢社群](https://discord.gg/xeYCvQWBPx)
- **Podcast**：[瑪斯理財兩三事](https://podcasts.apple.com/tw/podcast/id1548637718)

## 📞 聯絡方式

- **信箱**：[shamangels@gmail.com](mailto:shamangels@gmail.com)
- **聯絡表單**：[網站聯絡頁面](https://lazytoberich.com.tw/contact/)

## 📝 內容政策

### 版權聲明
- 本網站所有文章內容均為原創，受著作權法保護
- 未經同意禁止轉載或商業使用
- 引用請註明出處並附上原文連結

### 免責聲明
- 本網站內容僅供參考，不構成投資建議
- 投資有風險，請務必評估自身風險承受能力
- 任何投資決策請諮詢專業理財顧問

## 🔧 技術支援

如有技術問題或建議，歡迎：
1. 透過 [Issues](https://github.com/marskingx/marskingx.github.io/issues) 回報問題
2. 加入 [Discord 社群](https://discord.gg/xeYCvQWBPx) 討論
3. 透過網站聯絡表單聯繫

## 📈 更新日誌

查看最新更新請參考：
- [CLAUDE.md](./CLAUDE.md) - 詳細開發記錄
- [Git Commits](https://github.com/marskingx/marskingx.github.io/commits/main) - 提交歷史

---

**© 2018-2024 懶得變有錢 | 理解財務規劃本質 鑑定你的財務DNA**

*Built with ❤️ by Mars（懶大）*
