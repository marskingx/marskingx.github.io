# AI 協作自動化工具集手冊

本文檔詳細說明了為提升 AI 協作效率而開發的一系列自動化工具。這些工具是根據 `docs/aimemory/temp.md` 中的規劃實現的。

---

## 📖 功能索引

- [高優先級功能](#-高優先級功能)
  - [智能 Context 載入系統](#-智能-context-載入系統)
  - [協作衝突自動預警系統](#-協作衝突自動預警系統)
- [中優先級功能](#-中優先級功能)
  - [工作日誌智能分析](#-工作日誌智能分析)
- [低優先級功能](#-低優先級功能)
  - [效能監控系統](#-效能監控系統)

---

## 🚀 高優先級功能

### 🧠 智能 Context 載入系統

**目的**：根據 AI 角色和任務類型，自動載入最相關的記憶檔案和設定，減少手動查找上下文的時間。

**指令**：
```bash
npm run context:load <ai-role> <task-type>
```

**參數**：
- `<ai-role>`: AI 的角色 (`claude`, `codex`, `gemini`).
- `<task-type>`: 預定義的任務類型 (例如 `seo-optimization`, `version-control`).

**範例**：
```bash
# 模擬 Gemini 執行 SEO 優化任務
npm run context:load gemini seo-optimization
```

### 🛡️ 協作衝突自動預警系統

**目的**：透過檔案鎖定和自動通知機制，主動預防不同 AI 同時修改核心檔案造成的衝突。

**主要指令**：

1.  **鎖定檔案並通知**：當你要開始一項高風險任務時，使用此指令。
    ```bash
    # 格式：npm run conflict:lock "[你的訊息]" --notify
    npm run conflict:lock "我正在修改 hugo.toml，請暫停相關修改" --notify
    ```
    - 這會創建一個 `.ai-lock.json` 檔案，並將警告訊息寫入其他 AI 的個人記憶檔案中。

2.  **自動檢查鎖定**：在你開始工作前，檢查是否有其他人已經鎖定檔案。
    ```bash
    npm run conflict:check
    ```
    - 如果偵測到鎖定，它會顯示鎖定者的資訊和訊息，並中止後續操作。

3.  **釋放鎖定**：當你完成任務後，務必釋放鎖定。
    ```bash
    npm run conflict:unlock
    ```

### 🔀 智能併版系統 (2025-08-25 新增)

**目的**：提供完整的分支合併解決方案，支援多種合併策略和自動衝突檢測。

**主要指令**：

1.  **智能併版分析**：分析可併版分支的狀態、差異和衝突風險。
    ```bash
    npm run 併版:分析
    # 或使用英文指令
    npm run smart:merge:analyze
    ```

2.  **智能併版執行**：自動選擇最佳策略併版指定分支。
    ```bash
    # 格式：npm run 併版 <branch-name> [strategy]
    npm run 併版 codex-dev                    # 自動選擇策略
    npm run 併版 gemini-dev no-fast-forward   # 指定策略
    ```

3.  **合併策略選項**：
    - **auto**: 自動選擇最佳策略 (默認)
    - **fast-forward**: 快速合併 (適合線性歷史)
    - **no-fast-forward**: 保留分支歷史 (推薦功能合併)
    - **squash**: 壓縮多個提交為一個 (適合實驗功能)
    - **rebase**: 變基後合併 (適合解決衝突)

4.  **併版清理**：清理合併過程產生的臨時檔案。
    ```bash
    npm run 併版:清理
    ```

**智能特色**：
- 🔍 合併前自動檢測衝突
- 🧠 智能選擇最佳合併策略
- ✅ 併版前後完整驗證
- 🧹 自動清理臨時檔案

### 智能版控擴充功能 (保留參考)

**目的**：提供更進階的 Git 操作，簡化跨分支的開發流程。

**主要指令**：

1.  **合併分支**：將當前分支以 "merge commit" 的方式安全地合併到目標分支。
    ```bash
    # 格式: npm run smart:merge <target-branch>
    npm run smart:merge main
    ```

2.  **獲取單一檔案**：從其他分支拉取特定檔案的最新版本到當前分支。
    ```bash
    # 格式: npm run smart:get-file <source-branch> <file-path>
    npm run smart:get-file gemini-dev docs/aimemory/gemini.md
    ```

---

## 📊 中優先級功能

### 📝 工作日誌智能分析

**目的**：從 `docs/aimemory/shared/ai-shared.md` 的協作日誌中提取數據，提供有價值的洞見。

**主要指令**：

1.  **通用分析**：快速了解各 AI 的工作量和最新動態。
    ```bash
    npm run log:analyze
    ```

2.  **生成報告**：生成指定時間範圍內的協作報告。
    ```bash
    # 格式：npm run log:report -- --days <天數>
    npm run log:report -- --days 30
    ```
    *注意：需要額外的 `--` 將參數傳遞給腳本。*

3.  **趨勢分析**：分析日誌中的關鍵字，識別主要的工作類型分佈。
    ```bash
    npm run log:trends
    ```

---

## ⚙️ 低優先級功能

### 📈 效能監控系統

**目的**：提供一個基於協作日誌數據的效能儀表板，用於長期追蹤和評估 AI 的貢獻。

**指令**：
```bash
npm run ai:performance
```

**說明**：
此指令會掃描所有協作日誌，並統計每個 AI 的總貢獻數、變更的檔案總數以及完成的任務數。
