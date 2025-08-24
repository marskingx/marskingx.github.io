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
