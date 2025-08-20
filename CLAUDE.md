# 懶得變有錢部落格 - Claude Code 專案記憶

## 專案概述
- **專案名稱**: 懶得變有錢 (Lazytoberich)  
- **完整標題**: 懶得變有錢 | 帶你了解財務規劃本質 鑑定自己的財務DNA
- **技術棧**: Hugo + TailwindCSS + Hugoplate Theme
- **語言**: 繁體中文 (zh-tw)
- **版本**: Hugoplate 1.15.1
- **部署**: GitHub Pages (https://marskingx.github.io/)

## 專案版本資訊
- **當前版本**: v2.0.0 - 圖片優化系統完成版
- **版本管理**: 語義化版本 (Semantic Versioning)
- **版本檢視**: `npm run version:show`
- **版本發布**: `npm run version:patch/minor/major`

## 重要開發指令
```bash
# 本地開發
npm run dev

# 建置生產版本
npm run build  

# 預覽生產環境
npm run preview

# 程式碼格式化
npm run format

# 清除快取
hugo mod clean --all

# 圖片優化工具
npm run images:analyze    # 分析圖片使用情況
npm run images:clean      # 清除生成的圖片快取
npm run images:rebuild    # 重新建置所有圖片

# 效能優化工具
npm run perf:analyze      # 分析載入效能
npm run perf:build        # 建置並分析效能

# 結構化資料工具
npm run schema:validate   # 驗證 JSON-LD 結構化資料
npm run schema:build      # 建置並驗證結構化資料

# 版本管理工具
npm run version:show      # 顯示當前版本資訊
npm run version:changelog # 顯示版本發布說明
npm run version:patch     # 錯誤修正版本 (自動發布)
npm run version:minor     # 新功能版本 (自動發布)
npm run version:major     # 重大更新版本 (自動發布)
```

## 專案結構
```
├── content/
│   ├── blog/            # 部落格文章 (100+ 文章)
│   ├── authors/         # 作者資訊
│   ├── pages/           # 靜態頁面 (隱私政策、閱讀清單等)
│   ├── sections/        # 頁面區塊 (CTA、推薦等)
│   ├── podcast/         # Podcast 內容
│   ├── about/           # 關於頁面
│   └── contact/         # 聯絡頁面
├── static/              # 靜態資源 (favicon, ads.txt)
├── assets/images/       # 需要處理的圖片資源
├── layouts/             # 自定義佈局模板
├── data/                # 資料檔案 (social.json)
├── config/_default/     # 配置檔案目錄
│   └── params.toml      # 詳細參數配置
├── themes/hugoplate/    # Hugoplate 主題
├── .ai-memory/          # AI 記憶檔案 (Kiro 用)
├── CLAUDE.md            # Claude Code 記憶檔案
└── hugo.toml            # Hugo 主要配置
```

## 重要配置設定

### Hugo 基本配置 (hugo.toml)
- `baseURL = "https://marskingx.github.io/"` ✅ 已修正為完整 URL
- `title = "懶得變有錢 | 帶你了解財務規劃本質 鑑定自己的財務DNA"`
- `languageCode = "zh-tw"`
- `hasCJKLanguage = true` (中文支援)
- `paginate = 120` (分頁設定)
- `summaryLength = 0` (手動控制摘要)
- `defaultContentLanguage = 'zh-tw'`
- `disableLanguages = ["en"]` (停用英文)

### 服務整合
- **Google Analytics**: G-03PSTN4ES1
- **Google Tag Manager**: GTM-WFVQPMPL
- **Google AdSense**: pub-1504939696165194
- **Disqus**: themefisher-template
- **Mailchimp**: 訂閱功能整合
- **時區**: Asia/Taipei
- **聯絡表單**: airform.io 整合

### SEO 和驗證設定
- **Google Search Console**: 6267550629
- **Bing 驗證**: B8901C747010127F0D6FABD662802BC0
- **關鍵字**: ETF, Podcast, 保險, 理財規劃等 30+ 關鍵字
- **OG 圖片**: `/images/og-lazytoberich.png`

## 常用操作與解決方案

### 建置問題排除
如果遇到建置失敗：
1. 清除快取: `hugo mod clean --all`
2. 重新建置: `npm run build`
3. 檢查 `hugo_stats.json` 是否正確生成

### 中文顯示問題
確保 `hasCJKLanguage = true` 已在 hugo.toml 中設定

### 新增文章流程
1. 在 `content/blog/` 建立新的 `.md` 檔案
2. 使用完整的 front matter 設定 SEO
3. 執行 `npm run dev` 預覽
4. 確認無誤後執行 `npm run build`

## 內容管理最佳實踐

### 文章 Front Matter 範本
```yaml
---
title: "【分類】文章標題"  # 遵循現有命名慣例
description: "文章描述 (建議 120-160 字)"
author: 懶大
release: 2025-MM-DD
date: 2025-MM-DD
image: /images/blog/YYYYMMDD.png  # 遵循命名規則
categories: [財務規劃與心態]  # 主要分類
tags: [收支管理, 理財觀念]    # 具體標籤
draft: false
slug: seo-friendly-url-slug    # SEO 友善 URL
---
```

### 內容組織規範
- **標題格式**: 【分類】主標題 - 遵循現有 100+ 文章的命名慣例
- **分類系統**: 主要包含財務規劃、投資、理財、生活、閱讀等
- **標籤使用**: 收支管理、投資理財、理財觀念、職涯心得等具體標籤
- **日期格式**: YYYY-MM-DD，同時設定 release 和 date
- **作者統一**: 懶大

### 圖片管理
- **部落格圖片**: `assets/images/blog/YYYYMMDD.png` (遵循現有命名)
- **靜態圖片**: `static/images/` (favicon, logo 等)
- **圖片格式**: 優先使用 WebP，品質 80%
- **特殊圖片**: `lazytobeconclude.svg` (結論區塊)、`lazytoberich.svg` (品牌 logo)

### 圖片優化系統 ✅
- **現況**: 275 張圖片，總大小 94.81MB，68 張大型圖片 (>500KB)
- **自動 WebP 轉換**: 使用 `{{< img src="/images/blog/xxx.png" alt="描述" >}}` shortcode
- **Hugo 處理**: 自動生成 WebP 和原格式的響應式圖片
- **瀏覽器支援**: 自動選擇最佳格式，支援 lazy loading
- **分析工具**: `npm run images:analyze` 檢查圖片使用情況

### 文章結構模板
1. **開場引言** - 吸引讀者注意
2. **主要內容** - 分段落詳細說明
3. **實用建議** - 提供具體可行的方法
4. **推薦閱讀** - 使用 notice shortcode 連結相關文章
5. **懶得有結論** - 使用固定的結論區塊和 quote shortcode

## 效能優化設定
- Hugo 快取時間: 720小時
- 啟用 minification 壓縮
- 使用 `--gc` 垃圾回收
- 配置 `hugo_stats.json` 追蹤 CSS 類別

## Git 工作流程
- 主分支: `main`
- 提交前確保建置成功
- 使用有意義的提交訊息格式
- 定期推送到 GitHub 觸發自動部署

## 故障排除清單

### 樣式不正確
- 檢查 TailwindCSS 配置
- 確認 PostCSS 處理正常
- 檢查 cache busters 設定

### 部署失敗
- 確認 baseURL 設定正確
- 檢查 GitHub Pages 設定
- 驗證靜態檔案路徑

## 重要連結和資源

### 官方文件
- **Hugo 官方文件**: https://gohugo.io/
- **TailwindCSS 文件**: https://tailwindcss.com/
- **Hugoplate 主題**: https://github.com/zeon-studio/hugoplate
- **GitHub Pages**: https://pages.github.com/

### 社群平台
- **Facebook**: https://www.facebook.com/lazytoberich
- **Instagram**: https://www.instagram.com/lazytoberich/
- **Threads**: https://www.threads.net/@lazytoberich/
- **Discord**: https://discord.gg/xeYCvQWBPx

### 服務整合
- **Google Search Console**: 搜尋引擎優化
- **Google Analytics**: 流量分析
- **Mailchimp**: 電子報訂閱
- **Airform.io**: 聯絡表單處理

## 記憶系統使用

### 管理指令
```bash
# 互動式記憶管理
npm run claude:memory

# 快速備份記憶檔案
npm run claude:backup

# 查看記憶檔案狀態
npm run claude:status
```

### 更新記憶檔案
- **即時記錄**: 重要決策和解決方案立即添加
- **定期檢視**: 每週更新待辦事項和學習內容  
- **保持精簡**: 避免冗餘資訊，確保內容相關性
- **版本控制**: 所有變更納入 Git 管理

## 專案特色功能

### Shortcodes 使用
- **quote**: 引用區塊，常用於文章結論
- **notice**: 提示區塊，用於推薦閱讀連結
- **youtube**: YouTube 影片嵌入
- **video**: 一般影片嵌入

### 自定義元件
- **podcast-player**: Podcast 播放器
- **apple-podcast**: Apple Podcast 推廣小工具
- **subscription**: 電子報訂閱功能
- **call-to-action**: 行動呼籲區塊

### 主題定制
- **顏色主題**: 支援亮色/暗色模式切換
- **導航固定**: `navbar_fixed = true`
- **Logo 設定**: 支援一般和暗色模式不同 logo
- **公告系統**: 可設定期限的網站公告
- **Cookie 同意**: GDPR 相容的 Cookie 政策

## 專案分析與優化建議

### 🎯 專案優勢
1. **內容豐富**: 100+ 優質理財文章，涵蓋完整財務規劃主題
2. **多平台整合**: Podcast、部落格、社群媒體全方位布局
3. **SEO 完善**: 詳細的 meta 資訊、結構化資料、搜尋引擎驗證
4. **技術架構穩固**: Hugo + TailwindCSS + Hugoplate 現代化技術棧
5. **使用者體驗佳**: 響應式設計、快速載入、良好的導航結構

### ✅ 已解決的問題
1. **baseURL 配置**: 已修正為 "https://marskingx.github.io/"
2. **圖片優化系統**: 已建立完整的圖片優化解決方案 (WebP 轉換率 147%)
3. **載入效能優化**: 已實作完整的資源預載入策略
4. **結構化資料 (JSON-LD)**: 已建立完整的結構化資料系統

### 🚀 效能優化系統 (完整實作)
- ✅ **DNS 預解析**: 加速外部資源連線 (Google Fonts、Analytics、CDN)
- ✅ **關鍵資源預載入**: CSS、字型、重要圖片預先載入
- ✅ **智慧型預取**: 基於使用者行為的頁面預取 (hover + intersection observer)
- ✅ **Service Worker**: 5.83KB，支援離線快取和進階快取策略
- ✅ **圖片最佳化**: 自動 WebP 轉換，響應式圖片，lazy loading
- ✅ **資源載入優化**: CSS/JS 延遲載入，字型載入優化
- ✅ **效能監控工具**: `npm run perf:analyze` 自動分析效能

### 📊 結構化資料系統 (完整實作)
- ✅ **網站基本資料**: WebSite schema 包含搜尋功能和基本資訊
- ✅ **組織資料**: Organization schema 包含聯絡資訊和社群連結
- ✅ **文章資料**: BlogPosting/Article schema 自動根據內容類型調整
- ✅ **評論資料**: Review schema 支援書評等評分內容
- ✅ **麵包屑導航**: BreadcrumbList schema 自動生成導航路徑
- ✅ **列表頁面**: CollectionPage schema 支援分類和標籤頁
- ✅ **FAQ 支援**: FAQPage schema 自動檢測 FAQ 內容
- ✅ **驗證工具**: `npm run schema:validate` 自動驗證結構化資料

### 🚀 優化建議

#### 技術優化
- [x] 檢查並修正 baseURL 設定
- [x] 實作圖片自動 WebP 轉換
- [x] 優化 CSS/JS 載入策略 (關鍵資源預載入 + 延遲載入)
- [x] 實作 Service Worker 提升離線體驗

#### 內容優化  
- [ ] 建立文章模板和寫作規範
- [ ] 實作相關文章推薦演算法
- [ ] 優化文章內部連結結構
- [ ] 建立內容日程和發布流程

#### SEO 優化
- [x] 建立結構化資料 (JSON-LD) ✅
- [ ] 優化圖片 alt 標籤和檔名
- [x] 實作麵包屑導航 ✅
- [ ] 建立 XML sitemap 和 robots.txt

#### 使用者體驗
- [ ] 實作搜尋功能優化
- [ ] 建立文章閱讀進度條
- [ ] 優化行動裝置體驗
- [ ] 實作更好的評論系統整合

### 📊 效能監控
- **Google Analytics**: 已設定 G-03PSTN4ES1
- **Google Search Console**: 已驗證 6267550629  
- **建議新增**: Core Web Vitals 監控
- **建議新增**: 使用者行為分析 (Hotjar 或類似工具)

## 📋 待辦事項 (Todos)

### 🔴 高優先級
- [x] 大型圖片優化：191個 >500KB 的圖片需要使用 {{< img >}} shortcode ✅ 已完成，修復SVG處理問題，成功生成1570個WebP圖片
- [x] 內容 SEO 優化：部分文章需要更好的內部連結和關鍵字優化
- [ ] 社群分享功能：考慮加入更多社群平台的分享按鈕

### 🟡 中優先級
- [ ] CSS 檔案合併：6個 CSS 檔案可考慮合併關鍵樣式
- [ ] JavaScript 優化：9個 JS 檔案可啟用更積極的 lazy loading
- [ ] 使用者體驗改進：考慮加入文章閱讀時間估計
- [ ] 行動版選單優化：可能需要更好的觸控體驗
- [ ] 搜尋功能增強：目前搜尋較基本，可考慮加入更多篩選選項

### 🟢 低優先級
- [x] 修正 baseURL 配置問題 ✅
- [x] 優化圖片載入和格式 ✅
- [x] 實作資源預載入策略 ✅
- [x] 建立自動化內容發布流程 ✅ 已完成，建立完整的 Notion → Hugo 自動化系統
- [ ] 實作進階財務計算工具
- [ ] 整合更多分析追蹤工具
- [ ] 建立內容模板和規範文件

### 📊 效能分析結果 (2025-08-19)
- **靜態檔案**: 3,929 個檔案，350.38 MB
- **WebP 轉換率**: 147% (1,979 個 WebP 檔案)
- **Service Worker**: 已部署 (5.83 KB)
- **需優化**: 191 個大型圖片 (>500KB)

## 開發注意事項

### 文章發布檢查清單
1. ✅ Front matter 資訊完整 (title, description, date, image, categories, tags)
2. ✅ 圖片已準備並放置在正確位置 (`assets/images/blog/`)
3. ✅ 內部連結使用相對路徑
4. ✅ SEO 友善的 slug 設定
5. ✅ 使用適當的 shortcodes (notice, quote 等)
6. ✅ 文章結構清晰 (標題層級、段落分隔)
7. ✅ 本地預覽確認格式正確 (`npm run dev`)
8. ✅ 建置測試通過 (`npm run build`)

### 主題更新注意事項
- 主題檔案位於 `themes/hugoplate/`，避免直接修改
- 自定義內容放在根目錄的 `layouts/` 中
- 主題更新前備份自定義修改
- 使用 `npm run update-theme` 更新主題

---
*此記憶檔案由 Claude Code 管理，記錄專案重要資訊與開發經驗*  
*詳細使用說明請參考：.claude-backups/README.md*  
*專案掃描完成日期：2025-08-19*
