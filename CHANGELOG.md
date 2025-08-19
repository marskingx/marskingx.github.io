# 更新日誌

所有重要的專案更改都會記錄在此文件中。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
此專案遵循 [語義化版本](https://semver.org/lang/zh-TW/)。

## [2.0.0] - 2025-08-19

### ✨ 新增
- **圖片優化系統**: 建立完整的自動化圖片優化流程
- **批量圖片轉換**: 新增 `scripts/optimize-large-images.js` 工具
- **WebP 自動轉換**: Hugo shortcode 自動生成 WebP 和原格式的響應式圖片
- **SVG 處理支援**: 修改 `layouts/shortcodes/img.html` 支援 SVG 圖片檢測
- **效能監控工具**: 新增 `scripts/performance-analyzer.js` 
- **結構化資料系統**: 完整的 JSON-LD schema 支援
- **npm 腳本**: 新增 `images:optimize`、`images:preview`、`perf:analyze` 等指令

### 🔧 改進
- **圖片載入效能**: 155 個圖片引用轉換為 Hugo shortcode 格式
- **響應式圖片**: 全面啟用 lazy loading 和多格式支援
- **建置優化**: 成功生成 1570 個 WebP 圖片，處理 2454 個圖片資源
- **SEO 優化**: 完整的結構化資料和 meta 標籤系統

### 🐛 修正
- **SVG 處理錯誤**: 修復 Hugo resize 嘗試處理 SVG 檔案的問題
- **建置失敗**: 解決圖片處理導致的建置中斷問題
- **路徑處理**: 優化圖片資源的路徑解析和載入

### 📊 效能數據
- **WebP 轉換率**: 147% (1,570 個 WebP 檔案)
- **處理檔案**: 126 個 Markdown 檔案
- **圖片替換**: 155 個圖片引用
- **大型圖片**: 識別並優化 65 個 >500KB 的圖片

### 🛠️ 技術細節
- Hugo shortcode 格式: `{{< img src="/images/blog/xxx.png" alt="描述" >}}`
- 自動 WebP/原格式 Picture 元素生成
- SVG 檔案直接渲染，不進行 resize 處理
- 批量處理支援預覽模式 (`--dry-run`)

---

## [1.x.x] - 歷史版本

基於 Hugoplate 1.15.1 主題的初始版本，包含：
- Hugo + TailwindCSS 基礎架構
- 繁體中文部落格內容系統
- 基本的 SEO 和社群整合
- Google Analytics 和 AdSense 設定

---

## 版本規劃

### 🔮 v2.1.0 - SEO 與內容優化 (計劃中)
- [ ] 內容 SEO 優化和內部連結改善
- [ ] 社群分享功能增強
- [ ] 搜尋功能優化
- [ ] 閱讀體驗提升

### 🔮 v2.2.0 - 使用者體驗優化 (計劃中)
- [ ] 文章閱讀進度條
- [ ] 更好的行動裝置體驗
- [ ] 評論系統改進
- [ ] 載入效能進一步優化

### 🔮 v3.0.0 - 功能擴展版 (計劃中)
- [ ] 財務計算工具整合
- [ ] 進階內容管理系統
- [ ] 多語言支援擴展
- [ ] API 整合功能

---

## 貢獻者

- **懶大** - 專案創建者和主要維護者
- **Claude Code** - AI 協作開發助手

## 授權

MIT License - 詳見 [LICENSE](LICENSE) 檔案