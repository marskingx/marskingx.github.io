# 🤖 AI 記憶管理系統

## 📁 目錄結構

```
docs/aimemory/
├── shared/           # 三 AI 共用記憶
│   ├── AI_SHARED.md
│   ├── AI_COLLABORATION_ANNOUNCEMENT.md
│   └── MULTI-AI-COLLABORATION.md
├── claude/           # Claude (克勞德) 專用記憶
│   └── CLAUDE.md
├── gemini/           # Gemini 專用記憶
│   ├── GEMINI.md
│   ├── GSC_STRUCTURED_DATA_REVIEW.md
│   └── CLAUDE_TO_GEMINI_HANDOVER.md
├── codex/            # Codex 專用記憶
│   ├── CODEX.md
│   └── AI_ONBOARDING_CODEX.md
└── README.md         # 本檔案
```

## 🎯 設計理念

### 混合式記憶架構
- **共用核心** (`shared/`) - 避免重複維護
- **專業分工** (`claude/`, `gemini/`, `codex/`) - 發揮各自優勢
- **本地管理** - 不推送到 GitHub，保護開發隱私

### 檔案分類規則

#### 📋 共用記憶 (`shared/`)
放置三 AI 都需要了解的核心資訊：
- 專案基本資訊
- 協作規則與分工
- 版本管理策略
- 工作流程規範
- 重要公告與文件

#### 👤 個人記憶 (`claude/`, `gemini/`, `codex/`)
放置各 AI 專業相關的資訊：
- 角色設定與職責
- 專業技術配置
- 個人工作記錄
- 專屬任務文件
- 學習心得與經驗

## 🔧 管理工具

### 記憶同步檢查
```bash
npm run ai:memory          # 檢查記憶檔案狀態
```

### 檔案位置參考
各 AI 可以透過以下方式讀取記憶：

#### Claude (主目錄)
```bash
cd D:/marskingx.github.io
cat docs/aimemory/shared/AI_SHARED.md     # 共用記憶
cat docs/aimemory/claude/CLAUDE.md        # 個人記憶
```

#### Codex (worktree)
```bash
cd D:/marskingx-worktrees/codex-dev
cat docs/aimemory/shared/AI_SHARED.md     # 共用記憶  
cat docs/aimemory/codex/CODEX.md          # 個人記憶
```

#### Gemini (worktree)
```bash
cd D:/marskingx-worktrees/gemini-dev
cat docs/aimemory/shared/AI_SHARED.md     # 共用記憶
cat docs/aimemory/gemini/GEMINI.md        # 個人記憶
```

## 🚫 隱私保護

### .gitignore 規則
所有 AI 記憶檔案已加入 `.gitignore`：
```gitignore
# AI 記憶管理系統
docs/aimemory/
AI_*.md
CLAUDE*.md
GEMINI*.md  
CODEX*.md
```

### 本地開發原則
- ✅ **本地使用** - AI 記憶檔案僅在本地環境使用
- ✅ **隱私保護** - 不會意外推送到公開 GitHub 倉庫
- ✅ **分類管理** - 清晰的目錄結構便於管理維護

## 💡 最佳實踐

### 記憶維護原則
1. **共用資訊** 放在 `shared/` 目錄
2. **專業內容** 放在各自的專用目錄
3. **定期檢查** 使用 `npm run ai:memory` 驗證同步
4. **重要變更** 及時更新到共用記憶

### 協作規範
- 修改共用記憶前先檢查其他 AI 狀態
- 重要決策記錄到 `AI_SHARED.md`
- 個人經驗記錄到專用記憶檔案
- 使用工具檢查記憶一致性

---

*AI 記憶管理系統 v1.0*  
*建立日期: 2025-08-22*  
*專案版本: v3.1.0.0*