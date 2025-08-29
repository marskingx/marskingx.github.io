# [CLAUDE.md](http://claude.md/)

此檔案為 Claude Code ([claude.ai/code](http://claude.ai/code)) 在處理此存儲庫的代碼時提供指導。

## 專案概述

這是 **懶得變有錢 (Lazy to be Rich)** - 一個使用 Hugo 和 Hugoplate 主題構建的台灣財務規劃部落格。該網站專注於個人理財教育、投資指導和為台灣讀者提供金融知識。

**基本網址**: [https://lazytoberich.com.tw](https://lazytoberich.com.tw/)

**語言**: 繁體中文 (zh-tw)

**時區**: 亞洲/台北

## 開發命令
一律使用**繁體中文**互動。


### 構建和開發

```bash
# Start development server
hugo server

# Build for production
hugo --gc --minify

# Install/update dependencies
npm ci
hugo mod get
hugo mod tidy

# Test build without deployment
hugo --gc --minify --environment staging --baseURL "<https://example.com>"

```

### 部署

- **手動部署**: 通過「Run workflow」按鈕使用 GitHub Actions 工作流程
- **自動檢查**: PR 構建通過 hugo-check.yml 自動測試
- **Hugo 版本**: 0.148.2 (extended)

## 架構概述

### 技術堆疊

- **靜態網站生成器**: Hugo v0.148.2 (extended)
- **主題**: Hugoplate (客製化)
- **CSS 框架**: Tailwind CSS v3.4.17 (重要：保持v3版本，不要升級至v4)
- **構建工具**: PostCSS, autoprefixer
- **託管**: GitHub Pages
- **語言**: 繁體中文 (zh-tw)

### 主要功能

- SEO 優化，含結構化數據 (JSON-LD)
- 響應式設計，支援深色/淺色主題切換
- 部落格包含 293+ 篇關於財務規劃的文章
- 搜尋功能
- PWA 支援，含服務工作器
- 圖像優化 (WebP 格式)
- 播客整合 (Apple Podcasts, Spotify, YouTube)
- Google Analytics 和 AdSense 整合
- Mermaid 圖表支援

### 目錄結構

```
├── archetypes/          # 內容模板
├── assets/              # SCSS 樣式和圖像
├── config/              # Hugo 配置文件
│   ├── _default/        # 主要配置 (選單，參數)
│   └── development/     # 開發設置
├── content/             # 部落格文章和頁面
│   ├── blog/           # 293+ 財經文章
│   ├── authors/        # 作者資料
│   ├── pages/          # 靜態頁面
│   └── podcast/        # 播客內容
├── data/               # JSON 數據文件
├── i18n/               # 國際化
├── layouts/            # 自定義模板覆蓋
└── themes/hugoplate/   # 基礎主題文件

```

### 內容管理

- **主要內容**: 繁體中文部落格文章存放於 `/content/blog/`
- **命名慣例**: `YYYY-MM-DD【category】title.md`
- **分類**: 理財, 投資, 保險, 嗑書, 生活, 職涯, 等
- **作者**: 懶大 (Mars)

### 配置文件

- `hugo.toml` - 主要 Hugo 配置
- `config/_default/params.toml` - 主題參數和功能
- `config/_default/menus.toml` - 導航結構
- `package.json` - Tailwind CSS 的 Node.js 依賴項

### 自定義功能

- 通過 Mailchimp 訂閱電子報
- Cookie 同意橫幅 (GDPR 合規)
- 多媒體內容的自定義簡碼
- 結構化數據以提升 SEO
- 社交分享功能
- 相關文章推薦

### 性能優化

- 圖像處理和 WebP 轉換
- CSS/JS 壓縮
- Gzip 壓縮
- 資源快取 (圖像/資源快取 720 小時)
- CSS 插件延遲載入

### 第三方整合

- **分析**: Google Analytics (G-03PSTN4ES1), Google Tag Manager
- **變現**: Google AdSense
- **電子郵件**: Mailchimp 用於電子報
- **搜尋**: 自定義 JSON 搜尋
- **評論**: Disqus (已配置但可能未啟用)

## 開發注意事項

- 網站使用 Hugo 模組進行組件管理，而非 Git 子模組
- 自定義 CSS 位於 `/assets/scss/custom.scss`
- 主題已通過額外的部分模板和簡碼進行定制
- 內容主要為繁體中文，著重於財經教育
- SEO 針對台灣搜尋引擎進行大量優化

### 變更時需檢查的重要文件

- `hugo.toml` - 核心網站配置
- `config/_default/params.toml` - 功能開關和設置
- `layouts/` - 自定義模板覆蓋
- `assets/scss/custom.scss` - 自定義樣式
- 內容文件使用帶有特定 SEO 和分類欄位的前置資料

### GitHub Actions 工作流程

- `hugo-deploy.yml` - 手動部署到 GitHub Pages
- `hugo-check.yml` - PR 的自動構建測試