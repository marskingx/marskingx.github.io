# 📚 專案文檔目錄

此目錄包含「懶得變有錢」專案的所有文檔和非核心檔案，按類型分類整理。

## 📁 目錄結構

```
docs/
├── README.md                 # 本檔案
├── aimemory/                # AI 記憶管理系統
│   ├── claude/              # Claude 專用記憶
│   ├── codex/               # Codex 專用記憶  
│   ├── gemini/              # Gemini 專用記憶
│   └── shared/              # 三 AI 共用記憶
├── analysis/                # 分析報告
│   ├── branch-analysis-report.md
│   └── test-report.json
├── development/             # 開發配置檔案
│   ├── hugo-simple.toml
│   ├── hugo-temp.toml
│   ├── theme.toml
│   └── D:marskingx.github.io.markdownlint.json
├── deployment/              # 部署配置檔案 🆕
│   ├── amplify.yml          # AWS Amplify 部署配置
│   ├── netlify.toml         # Netlify 部署配置
│   ├── vercel.json          # Vercel 部署配置
│   └── vercel-build.sh      # Vercel 建置腳本
├── testing/                 # 測試相關檔案 🆕
│   └── test-report.json     # 系統測試報告
├── backups/                 # 備份檔案 🆕
│   └── themes.zip           # 主題備份
├── logs/                    # 日誌檔案 🆕
│   └── search_book_errors.log # 搜尋錯誤日誌
├── version-control/         # 版本控制文檔 🆕
│   ├── README.md            # 智能版控系統概述
│   ├── commands.md          # 完整指令參考
│   ├── workflow.md          # 工作流程指南
│   └── examples.md          # 使用範例和最佳實踐
├── external-tools/          # 外部工具
│   └── reindex/             # 重建索引工具
├── legacy/                  # 舊版檔案
│   ├── amplify.yml
│   ├── netlify.toml
│   ├── themes.zip
│   ├── vercel-build.sh
│   └── vercel.json
└── handover-2025-08-24.md   # AI 任務交接文件
```

## 🎯 分類說明

### 📋 aimemory/ - AI 記憶管理系統
- **用途**: AI 協作記憶檔案
- **類型**: 開發協作
- **狀態**: 活躍使用中

### 📊 analysis/ - 分析報告
- **用途**: 專案分析和測試報告
- **類型**: 參考資料
- **狀態**: 歷史記錄

### ⚙️ development/ - 開發配置
- **用途**: Hugo 和開發工具配置
- **類型**: 配置檔案
- **狀態**: 開發參考

### 🚀 deployment/ - 部署配置 🆕
- **用途**: 各平台部署設定
- **類型**: 基礎設施配置
- **狀態**: 備用配置

### 🧪 testing/ - 測試檔案 🆕
- **用途**: 測試報告和結果
- **類型**: 品質保證
- **狀態**: 持續更新

### 💾 backups/ - 備份檔案 🆕
- **用途**: 重要檔案備份
- **類型**: 安全備份
- **狀態**: 歸檔保存

### 📝 logs/ - 日誌檔案 🆕
- **用途**: 系統和工具日誌
- **類型**: 除錯資料
- **狀態**: 定期清理

### 🎯 version-control/ - 版本控制文檔 🆕
- **用途**: 智能版本控制系統說明
- **類型**: 使用指南  
- **狀態**: 完整文檔 (支援5碼版本號+AI協作+智能併版)

### 🔧 external-tools/ - 外部工具
- **用途**: 獨立的輔助工具
- **類型**: 工具腳本
- **狀態**: 需要時使用

### 🗂️ legacy/ - 舊版檔案
- **用途**: 歷史版本檔案
- **類型**: 歸檔資料
- **狀態**: 僅供參考

## 📋 整理記錄

**整理日期**: 2025-08-24  
**執行者**: Claude  
**目標**: 整理根目錄，將非核心檔案分類歸檔

### 🔄 移動檔案清單

**從根目錄移動到 `docs/deployment/`**:
- `amplify.yml` - AWS Amplify 部署配置
- `netlify.toml` - Netlify 部署配置
- `vercel.json` - Vercel 部署配置
- `vercel-build.sh` - Vercel 建置腳本

**從根目錄移動到 `docs/testing/`**:
- `test-report.json` - 系統測試報告

**從根目錄移動到 `docs/backups/`**:
- `themes.zip` - 主題備份檔案

**從根目錄移動到 `docs/logs/`**:
- `search_book_errors.log` - 搜尋錯誤日誌

**從根目錄移動到 `docs/development/`**:
- `D:marskingx.github.io.markdownlint.json` - Markdownlint 配置

**移除重複檔案**:
- `reindex/` - 與 `docs/external-tools/reindex/` 重複

### ✅ 整理效果

- **根目錄清潔**: 移除 8 個非核心檔案
- **分類明確**: 按功能和用途分類存放
- **結構清晰**: 便於查找和維護
- **版本控制**: 整理過程完整記錄

## 🔗 相關連結

- **專案主頁**: https://marskingx.github.io/
- **GitHub 倉庫**: https://github.com/marskingx/marskingx.github.io
- **技術棧**: Hugo + TailwindCSS + Hugoplate Theme

---

*此文檔會隨著專案發展持續更新*