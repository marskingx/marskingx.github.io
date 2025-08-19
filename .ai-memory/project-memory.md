# 專案記憶 - 懶得變有錢部落格

## 專案概述
- **專案名稱**: 懶得變有錢 (Lazytoberich)
- **完整標題**: 懶得變有錢 | 帶你了解財務規劃本質 鑑定自己的財務DNA
- **技術棧**: Hugo + TailwindCSS + Hugoplate Theme
- **目標**: 財務規劃教育部落格
- **語言**: 繁體中文 (zh-tw)
- **版本**: Hugoplate 1.15.1

## 重要決策記錄

### [2025-01-18] 選擇 Hugoplate 主題
**背景**: 需要一個現代化、響應式的 Hugo 主題來建立財務教育部落格
**選項**: 
- 自建主題
- 使用現有的 Hugo 主題
- 選擇 Hugoplate 主題
**決定**: 選擇 Hugoplate 主題
**理由**: 
- 內建 TailwindCSS 支援
- 現代化設計和響應式佈局
- 豐富的插件和功能支援
- 良好的 SEO 優化
**影響**: 加速開發進程，提供專業的視覺呈現

### [2025-01-18] 建立外部記憶系統
**背景**: 需要一個持久化的知識管理系統來保存專案開發過程中的重要資訊
**選項**:
- 使用外部文件管理工具
- 建立基於 Markdown 的記憶系統
- 依賴 Git 提交訊息記錄
**決定**: 建立基於 Markdown 的外部記憶系統
**理由**:
- 與 Kiro steering 機制完美整合
- 人類和 AI 都能輕鬆讀寫
- 版本控制友好
- 結構化且可搜尋
**影響**: 提供持續的專案上下文，改善開發效率和知識累積

### [2025-01-18] 完成外部記憶系統實作
**背景**: 外部記憶系統設計完成，需要進行完整實作
**選項**:
- 分階段逐步實作
- 一次性完整實作
- 先建立最小可行版本
**決定**: 一次性完整實作所有核心功能
**理由**:
- 確保系統完整性和一致性
- 避免後續整合問題
- 立即可用，提供完整功能
**影響**: 
- 建立了完整的記憶管理系統
- 提供了便捷的更新和維護工具
- 實現了自動載入和持久化記憶功能

## 技術配置

### Hugo 配置
- **基礎 URL**: https://marskingx.github.io/
- **時區**: Asia/Taipei
- **預設語言**: zh-tw (繁體中文)
- **分頁**: 120 篇文章
- **主題**: hugoplate
- **CJK 語言支援**: 啟用
- **語法高亮**: monokai 風格

### 重要檔案位置
- **主題**: themes/hugoplate
- **內容**: content/
- **配置**: hugo.toml
- **樣式**: assets/scss/
- **靜態檔案**: static/
- **佈局**: layouts/
- **資料**: data/

### 服務整合
- **Google Analytics**: G-03PSTN4ES1
- **Disqus**: themefisher-template (評論系統)
- **搜尋**: 內建搜尋索引功能

### 建置配置
- **開發命令**: `npm run dev` (hugo server)
- **建置命令**: `npm run build` (hugo --gc --minify)
- **預覽命令**: `npm run preview` (生產環境預覽)
- **格式化**: `npm run format` (prettier)

## 學習筆記

### Hugo 靜態網站生成器
**問題**: 如何優化 Hugo 網站的建置效能
**解決方案**: 
- 啟用 `--gc` 垃圾回收
- 使用 `--minify` 壓縮輸出
- 配置 `templateMetrics` 監控效能
- 使用 `forceSyncStatic` 同步靜態檔案
**程式碼範例**:
```bash
hugo --gc --minify --templateMetrics --templateMetricsHints --forceSyncStatic
```
**參考資料**: 
- [Hugo Performance](https://gohugo.io/troubleshooting/build-performance/)
- [Hugo Build Options](https://gohugo.io/commands/hugo/)

### TailwindCSS 整合
**問題**: 如何在 Hugo 中正確配置 TailwindCSS
**解決方案**:
- 使用 PostCSS 處理 CSS
- 配置 `hugo_stats.json` 追蹤使用的類別
- 設定 cache busters 確保樣式更新
**程式碼範例**:
```toml
[[build.cachebusters]]
source = 'assets/watching/hugo_stats\.json'
target = 'style\.css'
```
**參考資料**:
- [Hugo with TailwindCSS](https://gohugo.io/hugo-pipes/tailwindcss/)

### 多語言支援配置
**問題**: 如何配置 Hugo 的中文支援
**解決方案**:
- 設定 `hasCJKLanguage = true`
- 配置 `defaultContentLanguage = 'zh-tw'`
- 停用不需要的語言 `disableLanguages = ["en"]`
**影響**: 正確處理中文字符計數和搜尋功能

## 最佳實踐

### 內容管理
- 文章放置在 `content/blog/` 目錄
- 使用完整的 front matter 設定 SEO 資訊
- 圖片優化：使用 Hugo 的 image processing
- 啟用 lazy loading 提升載入效能
- 使用 `summaryLength = 0` 手動控制摘要

### 開發流程
- 使用 `npm run dev` 進行本地開發
- 使用 `npm run build` 建置生產版本
- 使用 `npm run preview` 測試生產環境
- 定期執行 `npm run format` 保持程式碼格式一致
- Git 提交前檢查建置是否成功

### 效能優化
- 啟用 Hugo 的快取機制 (720小時)
- 使用 WebP 格式圖片
- 配置適當的圖片品質 (80%)
- 使用 lazy loading 載入非關鍵資源
- 啟用 minification 壓縮輸出

## 常見問題和解決方案

### 建置問題
**症狀**: Hugo 建置失敗或樣式不正確
**原因**: TailwindCSS 配置或快取問題
**解決方法**: 
1. 清除 Hugo 快取：`hugo mod clean --all`
2. 重新建置：`npm run build`
3. 檢查 `hugo_stats.json` 是否正確生成
**預防措施**: 定期更新依賴套件，使用版本鎖定

### 中文顯示問題
**症狀**: 中文字符顯示異常或搜尋功能失效
**原因**: CJK 語言支援未正確配置
**解決方法**: 確保 `hasCJKLanguage = true` 已設定
**預防措施**: 在配置變更後測試中文內容顯示

### 部署問題
**症狀**: GitHub Pages 部署後網站無法正常顯示
**原因**: baseURL 配置錯誤或路徑問題
**解決方法**: 
1. 檢查 `baseURL = "https://marskingx.github.io/"`
2. 確認靜態檔案路徑正確
3. 檢查 GitHub Pages 設定
**預防措施**: 使用 `npm run preview` 在本地測試生產環境

## 待辦事項和想法

### 短期目標
- [ ] 完善外部記憶系統的搜尋功能
- [ ] 建立內容創作的標準化流程
- [ ] 優化網站的 SEO 設定
- [ ] 建立自動化的內容發布流程

### 長期規劃
- [ ] 實作進階的財務計算工具
- [ ] 建立互動式的財務規劃表單
- [ ] 整合更多的分析和追蹤工具
- [ ] 考慮多語言支援擴展

## 重要連結和資源

### 官方文件
- **Hugo**: https://gohugo.io/
- **TailwindCSS**: https://tailwindcss.com/
- **Hugoplate**: https://github.com/zeon-studio/hugoplate

### 工具和服務
- **Google Analytics**: G-03PSTN4ES1
- **部署平台**: GitHub Pages (https://marskingx.github.io/)
- **版本控制**: GitLab (https://gitlab.com/lazytoberich/lazytoberich)
- **CDN**: GitHub Pages 內建

### 開發資源
- **Node.js**: 用於建置工具和依賴管理
- **PostCSS**: CSS 處理和優化
- **Prettier**: 程式碼格式化
- **Font Awesome**: 圖示庫

## 專案結構說明

### 核心目錄
```
├── content/          # 內容檔案 (Markdown)
├── layouts/          # 模板檔案
├── static/           # 靜態資源
├── assets/           # 需要處理的資源 (SCSS, JS)
├── data/             # 資料檔案 (YAML, JSON)
├── themes/hugoplate/ # 主題檔案
├── public/           # 建置輸出 (自動生成)
└── .kiro/            # Kiro 配置和記憶系統
```

### 配置檔案
- `hugo.toml`: Hugo 主要配置
- `package.json`: Node.js 依賴和腳本
- `tailwind.config.js`: TailwindCSS 配置
- `postcss.config.js`: PostCSS 配置

## 記憶系統使用說明

### 更新記憶檔案
當有重要的決策、學習或配置變更時，請更新此檔案的相應區段：
1. **決策記錄**: 記錄重要的技術選擇和原因
2. **學習筆記**: 保存解決問題的方法和知識
3. **配置記錄**: 追蹤系統配置的變更
4. **最佳實踐**: 累積開發經驗和慣例

### 搜尋和檢索
使用 Kiro 的搜尋功能或直接瀏覽此檔案來找到相關資訊：
- 使用關鍵字搜尋特定主題
- 瀏覽分類區段找到相關內容
- 參考連結和資源獲得更多資訊

---

*此記憶檔案會隨著專案發展持續更新，確保 AI 助手始終擁有最新的專案上下文。*