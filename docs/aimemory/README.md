# 🤖 AI 記憶管理系統

## 📁 目錄結構

```text
docs/aimemory/
├── shared/                      # 三 AI 共用記憶
│   ├── ai-shared.md             # 協作日誌所在
│   ├── ai-collaboration-announcement.md
│   ├── SEO/                     # SEO 任務與計畫
│   ├── hugo/                    # Hugo 升級/整合報告
│   └── mission/                 # 協作規範與流程
├── claude/                      # Claude 專用記憶
│   └── claude.md
├── gemini/                      # Gemini 專用記憶
│   └── gemini.md
├── codex/                       # Codex 專用記憶
│   └── codex.md
└── README.md                    # 本檔案
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

### 記憶與日誌指令

```bash
# 檢視記憶結構與狀態（建議）
npm run memory:structure

# 同步共用記憶到各 worktree，並寫入最後同步時間 .last-sync
npm run memory:sync

# 追加協作日誌到 shared/ai-shared.md（手動）
npm run 記憶 -- --agent Codex --task "任務" --summary "摘要" --status done

# 上版（AI版控）→ 會自動追加一筆協作日誌
npm run 上版 -- "feat: 說明訊息"

# 上版&佈署（AI版控+推送）→ 會自動追加一筆協作日誌
npm run 上版&佈署 -- "feat: 說明訊息"
```

### 檔案位置參考

各 AI 可以透過以下方式讀取記憶：

#### Claude (主目錄)

```bash
cd D:/marskingx.github.io
cat docs/aimemory/shared/ai-shared.md     # 共用記憶
cat docs/aimemory/claude/claude.md        # 個人記憶
```

#### Codex (worktree)

```bash
cd D:/marskingx-worktrees/codex-dev
cat docs/aimemory/shared/ai-shared.md     # 共用記憶
cat docs/aimemory/codex/codex.md          # 個人記憶
```

#### Gemini (worktree)

```bash
cd D:/marskingx-worktrees/gemini-dev
cat docs/aimemory/shared/ai-shared.md     # 共用記憶
cat docs/aimemory/gemini/gemini.md        # 個人記憶
```

## 🚫 隱私保護

### 管理策略（現況）

- 記憶與內部文件不再依賴大量 `.gitignore` 規則；改由「智能上版系統」自動分流：
  - 公開檔案 → 推送至公開儲存庫
  - 私有/內部檔案（含 `docs/aimemory/`）→ 由規則自動歸類為私有
- `.gitignore` 維持極簡（僅必要系統/建置項目），詳細分流規則定義在 `scripts/smart-git-manager.js`。
私有
### 本地開發原則

- ✅ **本地使用** - AI 記憶檔案僅在本地環境使用
- ✅ **隱私保護** - 不會意外推送到公開 GitHub 倉庫
- ✅ **分類管理** - 清晰的目錄結構便於管理維護

## 💡 最佳實踐

### 記憶維護原則

1. **共用資訊** 放在 `shared/` 目錄
2. **專業內容** 放在各自的專用目錄
3. **定期檢查** 使用 `npm run memory:structure` 檢視結構與狀態
4. **重要變更** 及時更新到共用記憶

### 協作規範

- 修改共用記憶前先檢查其他 AI 狀態
- 重要決策與協作紀錄寫入 `shared/ai-shared.md`（協作日誌）
- 個人經驗記錄到專用記憶檔案
- 使用工具檢查記憶一致性

---

_AI 記憶管理系統 v1.0_  
_建立日期: 2025-08-22_  
_專案版本: v3.4.0.0.1_  
_版本格式: major.minor.patch.content.log (5碼)_

### 📝 協作日誌（自動/手動）補充

- 自動日誌：執行 `npm run 上版` 或 `npm run 上版&佈署` 時，系統會於 `shared/ai-shared.md` 追加一筆協作日誌，標題含「日期+時間」避免同日多次混淆。
- 手動日誌：使用 `npm run 記憶 -- --agent ... --task ... --summary ...` 追加。
- 同步時間：執行 `npm run memory:sync` 會在 `docs/aimemory/.last-sync`（及各 worktree 對應路徑）寫入 ISO 時間戳。
