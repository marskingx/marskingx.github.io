# 三 AI Agent 共用專案記憶

## 多 AI 協作架構

### 🤖 AI Agent 分工
- **Claude**: 主要開發、修復、版本管理
- **Codex**: 程式碼生成、重構、自動化腳本
- **Gemini**: 實驗功能、分析、內容創新

### 📂 Worktree 配置
```
D:/marskingx.github.io           - [main] 主分支
D:/marskingx-worktrees/codex-dev - [codex-dev] Codex 開發分支  
D:/marskingx-worktrees/gemini-dev - [gemini-dev] Gemini 開發分支
```

## 專案核心資訊

### 🎯 專案概述
- **名稱**: 懶得變有錢 (Lazytoberich)
- **網址**: https://marskingx.github.io/
- **技術棧**: Hugo + TailwindCSS + Hugoplate Theme
- **版本規範**: 5 碼版本號 (major.minor.patch.content.log)

### ⚡ 重要指令
```bash
# 開發
npm run dev                    # 本地開發伺服器
npm run build                  # 生產建置

# 版本管理 (5 碼版本號)
npm run version:show           # 顯示當前版本
npm run version:content        # 內容更新 (.0.0.1)
npm run version:patch          # 錯誤修復 (.0.1.0)  
npm run version:minor          # 新功能   (.1.0.0)
npm run version:major          # 重大更新 (1.0.0.0.0)
npm run version:log            # 協作日誌 (0.0.0.0.1)

# 品質檢查
npm run schema:validate        # 驗證結構化資料
npm run images:analyze         # 分析圖片優化
```

### 🔄 Rebase 工作流程
```bash
# 標準流程
git fetch origin main
git rebase origin/main
# 如有衝突，解決後
git add .
git rebase --continue
# 強制推送 (謹慎使用)
git push --force-with-lease origin [branch]
```

## 檔案責任區域

### 🎯 優先權分配
```yaml
/content/blog/:           內容創建者優先
/layouts/:               克勞德主導，其他協助
/scripts/:               Codex主導
/themes/hugoplate/:      謹慎修改，需AI間討論
配置檔案:                克勞德統一管理
/static/:                共同維護
/assets/:                共同維護
```

### ⚠️ 高風險檔案 (需三AI協議)
- `hugo.toml`
- `package.json` 
- `CLAUDE.md` / `GEMINI.md` / `CODEX.md`
- `/themes/hugoplate/layouts/`

## 版本發布規則

### 🏷️ 標籤策略
- **v3.x.x.x**: 克勞德負責主版本管理
- **hotfix**: 發現者立即修復，通知其他AI
- **feature**: 開發者負責，完成後通知
- **experiment**: Gemini 實驗分支，穩定後合併

### 🚀 部署流程
1. 分支開發完成
2. `git rebase origin/main`
3. 通過所有測試 (`npm run build`)
4. 合併到 main
5. 推送觸發 GitHub Pages 部署

### 📝 提交訊息規範（智能版控，固定啟用）
- 使用 `npm run 上版` 或 `npm run 上版&佈署` 時，系統會自動產生提交訊息「內文摘要」，包含：
  - Public/Private 變更數量與 M/A/D 統計
  - 所有重要變更檔案清單
  - 目前 5 碼版本號（major.minor.patch.content.log）
- 建議仍在標題輸入精準的變更主旨，例如：`feat: 圖片最佳化流程改良`，系統會將上述摘要附在標題後。
- 協作日誌：同時會自動寫入 `docs/aimemory/shared/ai-shared.md`（含時間戳）並遞增第 5 碼（log）。

### 🔒 私有庫鏡射（固定啟用）
- 推送到私有庫前，系統會鏡射以下路徑到私有庫工作目錄以確保追蹤：
  - `docs/aimemory/`
  - `.kiro/`
- 完成推送後會進行一致性校驗（至少校驗 `docs/aimemory/shared/ai-shared.md`），保障私有庫與主庫內容一致。

## 溝通協調

### 📋 日常檢查項目
- [ ] 檢查其他AI的分支狀態
- [ ] 確認無檔案衝突
- [ ] 驗證建置成功
- [ ] 結構化資料正常

### 🔄 同步機制
- 每次工作前檢查 `AI_SHARED.md` 更新
- 重要變更更新此共用記憶
- 定期同步個人記憶文件重點

---
*本文件由三AI共同維護，最後更新: 2025-08-22*
*詳細個人設定請參考: CLAUDE.md, GEMINI.md, CODEX.md*

---

## 協作日誌 (Collaboration Log)

### [2025-08-24 23:10] - Codex
- 任務: 智能提交
- 摘要: chore: 納入 .kiro 鏡射並驗證
- 變更檔: docs/aimemory/shared/ai-shared.md, scripts/conflict-prevention.js, scripts/smart-git-manager.js
- 版本: 3.4.0.0.9

### [2025-08-24 23:08] - Codex
- 任務: 智能提交
- 摘要: chore: 驗證私有庫同步校驗
- 變更檔: docs/aimemory/shared/ai-shared.md, scripts/smart-git-manager.js
- 版本: 3.4.0.0.8

### [2025-08-24 23:04] - Codex
- 任務: 智能提交
- 摘要: chore: 驗證私有庫鏡射與摘要
- 變更檔: docs/aimemory/shared/ai-shared.md
- 版本: 3.4.0.0.7

### [2025-08-24 23:04] - Codex
- 任務: 智能提交
- 摘要: feat: 智能提交更新
- 變更檔: docs/aimemory/shared/ai-shared.md, package.json, scripts/smart-git-manager.js
- 版本: 3.4.0.0.6

### [2025-08-24 23:03] - Codex
- 任務: 智能提交
- 摘要: chore: 測試摘要與檔名可靠性
- 變更檔: docs/aimemory/shared/ai-shared.md, scripts/private-repo-handler.js, scripts/smart-git-manager.js
- 版本: 3.4.0.0.5

### [2025-08-24 22:58] - Codex
- 任務: 智能提交
- 摘要: feat: 佈署驗證（含摘要與日誌）
- 變更檔: ocs/aimemory/shared/ai-shared.md
- 版本: 3.4.0.0.4

### [2025-08-24 22:58] - Codex
- 任務: 智能提交
- 摘要: feat: 智能提交更新
- 變更檔: ocs/aimemory/shared/ai-shared.md, scripts/smart-git-manager.js
- 版本: 3.4.0.0.3

### [2025-08-24 22:47] - Codex
- 任務: 智能提交
- 摘要: feat: 智能提交更新
- 變更檔: ackage.json, scripts/smart-git-manager.js, scripts/smart-git-pull.js, scripts/version-manager.js, scripts/smart-context-loader.js, scripts/aimemory-log-update.js, docs/
- 版本: 3.4.0.0.2

### [2025-08-24 21:44] - Codex
- 任務: 示範上版(手動)
- 摘要: 用記憶指令追加手動日誌
- 變更檔: scripts/aimemory-log-update.js, scripts/ai-memory-sync.js, scripts/smart-git-manager.js
- 狀態: done
- 版本: 3.4.0.0

### [2025-08-24 21:43] - Codex
- 任務: 智能提交
- 摘要: chore: demo 上版與日誌整合
- 變更檔: ackage.json, scripts/ai-memory-sync.js, scripts/conflict-prevention.js, scripts/multi-ai-manager.js, scripts/optimize-images.js, scripts/performance-analyzer.js, scripts/private-repo-handler.js, scripts/smart-git-manager.js, scripts/structured-data-validator.js, scripts/system-test.js
- 版本: 3.4.0.0

### [2025-08-22] - Gemini (UPDATE)
- **任務**: GSC BreadcrumbList - **根本原因分析與最終修復**
- **摘要**: 追蹤先前部署後 GSC 驗證仍失敗的問題。
- **根本原因**: 初步修復方案（完全移除條件）不夠完整，會在列表頁面 (section/taxonomy pages) 上產生重複或空的 `ListItem`，這才是觸發 GSC 驗證失敗的根本原因。
- **最終修復**: 將 `breadcrumb-jsonld.html` 中的最後一個 `ListItem` 區塊用 `{{ if .IsPage }}` 條件包覆，確保該項目只在單一內容頁上產生，避免了在列表頁上的錯誤。
- **狀態**: **最終修復已提交至 `gemini-dev` 分支**。等待部署後由 GSC 重新驗證。

### [2025-08-22] - Gemini
- **任務**: 標籤頁面 (Taxonomy Page) SEO 優化實驗方法記錄
- **主題**: 為標籤頁面新增介紹文字與 `CollectionPage` 結構化資料的通用方法。
- **方法**:
    1.  **動態介紹文字**: 在 `themes/hugoplate/layouts/_default/taxonomy.html` 中，使用 `{{ .Description }}` 變數來顯示標籤頁面 `_index.md` 中定義的介紹文字。
    2.  **CollectionPage Schema**: 在 `themes/hugoplate/layouts/_default/taxonomy.html` 的 `{{ end }}` 之前，插入 `CollectionPage` 類型的 JSON-LD 結構化資料，其 `name` 和 `description` 亦動態抓取。
    3.  **內容準備**: 每個標籤頁面需在 `content/tags/<tag-name>/_index.md` 中定義 `description` 欄位。
- **結果**: 成功為標籤頁面提供了可擴展的 SEO 優化方案。
- **狀態**: 方法已記錄，待全面實施。
