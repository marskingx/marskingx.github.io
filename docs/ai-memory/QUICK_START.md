# 通用 AI 外部記憶系統 - 快速開始指南

## 🎯 系統概述

這是一個**平台無關**的 AI 外部記憶系統，讓任何 AI 模型都能獲得專案的持久化記憶。無論你使用 ChatGPT、Claude、Kiro 或其他 AI 助手，都能享受一致的專案上下文體驗。

## 🚀 立即開始

### 1. 檢查系統狀態

```bash
# 驗證記憶系統完整性
npm run ai-memory:manage
# 選擇選項 5 進行驗證
```

### 2. 在不同 AI 平台使用

#### 🤖 ChatGPT

```markdown
請載入以下專案記憶：

===== 專案記憶開始 =====
[複製 docs/ai-memory/project-memory.md 的完整內容]
===== 專案記憶結束 =====

請確認你已經理解了專案背景。
```

#### 🧠 Claude

1. 上傳 `docs/ai-memory/project-memory.md` 檔案
2. 說明：「請參考上傳的專案記憶檔案」

#### 🤖 Gemini

- **檔案上傳**: 上傳 `docs/ai-memory/gemini-memory.md` (自動生成)
- **API 自動載入**: 使用 `npm run gemini:auto-load` (需設定 API Key)
- **一鍵設定**: 執行 `npm run gemini:setup` 生成所有需要的檔案

#### ⚡ Kiro

- 自動載入！無需額外操作
- 記憶已透過 steering 機制載入

#### 🔧 其他 AI 平台

- 將記憶檔案內容貼入對話
- 或使用平台特定的檔案載入功能

## 📝 日常使用

### 記錄新決策

```bash
npm run ai-memory:manage
# 選擇選項 1: 添加決策記錄
```

### 保存學習筆記

```bash
npm run ai-memory:manage
# 選擇選項 2: 添加學習筆記
```

### 搜尋記憶內容

```bash
npm run ai-memory:manage
# 選擇選項 4: 搜尋記憶內容
```

### 建立備份

```bash
npm run ai-memory:backup
```

## 📁 檔案結構

```
docs/ai-memory/
├── project-memory.md           # 🧠 核心記憶檔案
├── README.md                   # 📖 完整說明文件
├── QUICK_START.md             # 🚀 快速開始指南
├── templates/                  # 📋 記憶模板
│   ├── decision-record.md     # 決策記錄模板
│   └── learning-note.md       # 學習筆記模板
├── tools/                     # 🛠️ 管理工具
│   └── memory-manager.js      # 記憶管理腳本
└── examples/                  # 💡 整合範例
    └── chatgpt-integration.md # ChatGPT 整合範例
```

## 🎨 核心特色

### ✅ 平台無關

- 支援任何 AI 模型
- 標準 Markdown 格式
- 無平台綁定

### ✅ 人機共讀

- 開發者可直接閱讀編輯
- AI 模型易於理解
- 結構化組織

### ✅ 版本控制友好

- 完全相容 Git
- 可追蹤變更歷史
- 支援團隊協作

### ✅ 易於維護

- 提供管理工具
- 標準化模板
- 自動備份機制

## 🔄 工作流程

### 開發時

1. **開啟 AI 對話** → 載入專案記憶
2. **進行開發工作** → AI 基於記憶提供協助
3. **遇到新問題** → 查詢記憶中的解決方案
4. **學到新知識** → 記錄到記憶檔案

### 決策時

1. **面臨技術選擇** → 參考記憶中的歷史決策
2. **做出決定** → 記錄決策過程和原因
3. **實施決策** → 更新相關配置記錄
4. **評估影響** → 更新決策記錄的影響部分

### 維護時

- **每週**: 檢查待辦事項，更新學習筆記
- **每月**: 整理記憶內容，歸檔過時資訊
- **每季**: 全面檢視專案方向，更新目標

## 🛠️ 可用命令

```bash
# 通用記憶管理
npm run ai-memory:manage        # 互動式記憶管理工具
npm run ai-memory:backup        # 建立記憶備份

# Gemini 專用
npm run gemini:setup            # 生成 Gemini 整合檔案
npm run gemini:install          # 安裝 Gemini API 依賴
npm run gemini:auto-load        # API 自動載入 (需 API Key)

# Kiro 專用 (向後相容)
npm run memory:update           # Kiro 專用更新工具
npm run memory:backup           # Kiro 專用備份
npm run memory:validate         # Kiro 專用驗證
```

## 💡 使用技巧

### 1. 記憶載入確認

載入記憶後，詢問 AI：

```
請簡要總結我的專案的技術棧和最近的重要決策。
```

### 2. 上下文維持

在長對話中提醒：

```
請參考我的專案記憶來回答這個問題。
```

### 3. 記憶更新

有新資訊時：

```
我需要更新專案記憶，以下是新的決策記錄...
```

## 🚨 注意事項

1. **隱私安全**: 避免在記憶中存放敏感資訊
2. **檔案大小**: 記憶檔案過大時考慮分割
3. **格式一致**: 遵循標準化的 Markdown 格式
4. **定期備份**: 重要更新前建立備份
5. **版本控制**: 將記憶檔案納入 Git 管理

## 🎉 開始使用

1. **立即測試**: 在你慣用的 AI 平台載入記憶檔案
2. **記錄第一個決策**: 使用管理工具添加決策記錄
3. **建立學習筆記**: 記錄今天學到的新知識
4. **設定定期維護**: 建立記憶維護的習慣

---

**🧠 記住**: 這個記憶系統的價值在於持續使用和維護。每次與 AI 的互動都是在累積專案知識，讓未來的開發更加高效！

**📞 需要幫助?** 查看 `docs/ai-memory/README.md` 獲得完整文件，或使用 `npm run ai-memory:manage` 開始管理你的專案記憶。
