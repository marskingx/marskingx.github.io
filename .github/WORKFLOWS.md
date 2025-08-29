# 🔄 GitHub Actions Workflows 說明

## 📋 Workflow 概覽

### 1. 🚀 Hugo Deploy (`hugo-deploy.yml`)
**用途**: 手動觸發部署到 GitHub Pages  
**觸發方式**: 手動點擊 GitHub Actions 頁面的 "Run workflow" 按鈕

**特色功能**:
- ✅ **手動觸發** - 節省 CI/CD 資源
- ⚙️ **環境選擇** - Production / Staging
- 📝 **部署說明** - 可自訂部署訊息
- 📊 **詳細報告** - 建置統計 + 部署摘要
- 🔒 **安全部署** - 正確的權限設定

### 2. 🔍 Hugo Check (`hugo-check.yml`) 
**用途**: PR 建置檢查 + 手動測試建置  
**觸發方式**: PR 自動觸發 或 手動觸發

**特色功能**:
- 🔄 **輕量檢查** - 只測試建置，不實際部署
- ⚡ **快速反饋** - PR 中即時顯示建置狀態
- 📋 **建置報告** - 頁面數、檔案數統計

## 🎮 如何使用

### 手動部署網站
1. 進入 GitHub 專案頁面
2. 點擊 **Actions** 選項卡
3. 選擇 **🚀 Hugo Deploy to GitHub Pages**
4. 點擊 **Run workflow** 按鈕
5. 選擇部署環境和填寫說明（選填）
6. 點擊綠色 **Run workflow** 按鈕開始部署

### 檢查建置狀態
- **自動**: 建立 PR 時自動檢查
- **手動**: Actions → **🔍 Hugo Build Check** → **Run workflow**

## ⚙️ 技術規格

### 環境配置
- **Hugo 版本**: 0.148.2 (Extended)
- **Node.js 版本**: 20.x (LTS)
- **運行環境**: Ubuntu Latest

### 依賴處理
- 自動安裝 npm 依賴項
- 自動處理 Hugo 模組 (`hugo mod get` + `hugo mod tidy`)
- 使用 npm 和 Hugo 模組快取加速建置

### 部署設定
- **目標**: GitHub Pages
- **權限**: 最小化安全權限
- **並行控制**: 同時只允許一個部署

## 🎯 效益

### 資源節省
- ✅ **不會每次 push 都執行** - 節省 GitHub Actions 分鐘數
- ✅ **可控制部署時機** - 避免頻繁無意義的部署
- ✅ **輕量 PR 檢查** - 只檢查建置，不執行部署

### 使用體驗  
- ✅ **靈活部署** - 想部署時才部署
- ✅ **環境選擇** - Production/Staging 區分
- ✅ **詳細回饋** - 豐富的建置和部署報告
- ✅ **快速檢查** - PR 中快速確認建置狀態

## 🔧 自訂選項

### 部署環境
- **Production**: 正式環境，使用 production 設定
- **Staging**: 測試環境，用於預覽

### 部署訊息
可以填寫自訂訊息說明這次部署的內容，如：
- "新增文章：投資理財入門指南"
- "修復 CSS 樣式問題"
- "更新網站設定"

---

**💡 小提示**: 第一次設定完成後，記得到 GitHub 專案設定中啟用 GitHub Pages，並設定來源為 "GitHub Actions"。