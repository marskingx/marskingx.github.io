# 多 AI Agent 協作系統完整指南

## 🎯 系統概述

本專案建立了完整的三 AI Agent 協作系統，支援 **Claude (克勞德)**、**Codex** 和 **Gemini** 同時開發，使用 rebase 工作流程和混合式記憶管理。

### 🤖 AI Agent 分工

| AI Agent | 主要職責 | Worktree 路徑 | 分支名稱 |
|----------|----------|---------------|----------|
| **Claude (克勞德)** | 主要開發、版本管理、專案協調 | `D:/marskingx.github.io` | `claude-dev` |
| **Codex** | 程式碼生成、自動化腳本、效能優化 | `D:/marskingx-worktrees/codex-dev` | `codex-dev` |
| **Gemini** | 實驗功能、內容創新、分析報告 | `D:/marskingx-worktrees/gemini-dev` | `gemini-dev` |

## 📂 記憶系統架構

### 混合式記憶管理
- **共用記憶**: `AI_SHARED.md` - 專案核心資訊、協作規則
- **個人記憶**: `CLAUDE.md`, `GEMINI.md`, `CODEX.md` - 各 AI 專業設定

### 記憶同步策略
```bash
# 檢查記憶檔案狀態
npm run ai:memory

# 手動同步重要資訊到 AI_SHARED.md
# 各 AI 定期檢查並更新個人記憶檔案
```

## 🔧 管理工具

### 🤖 多 AI 狀態管理
```bash
npm run ai:status         # 檢查所有 AI 工作狀態
npm run ai:sync           # 同步所有分支到 main
npm run ai:conflicts      # 檢查潛在檔案衝突
npm run ai:memory         # 檢查記憶檔案同步
npm run ai:help           # 顯示所有可用指令
```

### 🛡️ 衝突防止系統
```bash
npm run conflict:check      # 檢查當前變更風險
npm run conflict:precommit  # 提交前完整安全檢查
npm run conflict:rules      # 顯示協作規則
npm run conflict:lock       # 創建檔案鎖定標記
npm run conflict:unlock     # 釋放檔案鎖定
```

## 📋 檔案責任區域

### 🎯 明確分工
```yaml
/content/blog/:        內容創建者優先, Gemini 協助
/layouts/:            Claude 主導, Codex 協助
/scripts/:            Codex 主導, Claude 協助  
/themes/hugoplate/:   需三 AI 協議才能修改
/static/:             共同維護
/assets/:             共同維護
配置檔案:              Claude 統一管理
```

### ⚠️ 高風險檔案 (需協調)
- `hugo.toml` - Hugo 主要配置
- `package.json` - 套件和腳本管理
- `.version` - 版本資訊
- `CLAUDE.md`, `GEMINI.md`, `CODEX.md` - AI 記憶檔案
- `AI_SHARED.md` - 共用記憶
- `/themes/hugoplate/layouts/` - 主題核心模板

## 🔄 Rebase 工作流程

### 標準開發流程
```bash
# 1. 開發前檢查
npm run ai:status

# 2. 同步最新 main 分支
git fetch origin main
git rebase origin/main

# 3. 開發階段
# ... 進行開發工作 ...

# 4. 提交前檢查
npm run conflict:precommit

# 5. 提交變更
git add .
git commit -m "feat: 功能描述"

# 6. 推送到遠端 (需要時使用 force-with-lease)
git push --force-with-lease origin [branch-name]
```

### 衝突解決流程
```bash
# 如果 rebase 過程中遇到衝突
git add .                    # 解決衝突後添加檔案
git rebase --continue        # 繼續 rebase

# 如果需要中止 rebase
git rebase --abort           # 回到 rebase 前狀態
```

## 🚀 版本管理策略

### 四位版本號系統
- **major.minor.patch.content** (例如: 3.1.2.5)
- **主版本** (3.x.x.x): Claude 負責重大更新
- **次版本** (x.1.x.x): 新功能開發 (各 AI 協作)
- **修正版** (x.x.1.x): Bug 修復 (發現者負責)
- **內容版** (x.x.x.1): 內容更新 (內容創建者)

### 版本發布指令
```bash
npm run version:show       # 查看當前版本
npm run version:content    # 內容更新版本
npm run version:patch      # 錯誤修復版本
npm run version:minor      # 新功能版本  
npm run version:major      # 重大更新版本
```

## 💡 協作最佳實踐

### 開發前檢查清單
- [ ] 檢查 `npm run ai:status` 了解其他 AI 狀態
- [ ] 閱讀最新的 `AI_SHARED.md` 內容
- [ ] 確認要修改的檔案不在其他 AI 的責任區域
- [ ] 檢查是否有檔案鎖定 (`.ai-lock.json`)

### 開發中注意事項
- [ ] 專注於自己的責任區域
- [ ] 重要決策記錄到共用記憶
- [ ] 避免修改高風險檔案
- [ ] 定期執行 `npm run build` 確保建置成功

### 提交前檢查清單
- [ ] 執行 `npm run conflict:precommit` 完整檢查
- [ ] 確保建置成功且無錯誤
- [ ] 檢查結構化資料驗證通過
- [ ] 更新相關記憶檔案
- [ ] 撰寫清晰的提交訊息

### 合併後維護
- [ ] 更新 `AI_SHARED.md` 記錄重要變更
- [ ] 通知其他 AI 重要更新
- [ ] 檢查 GitHub Pages 部署狀態
- [ ] 驗證線上功能正常

## 🔍 故障排除

### 常見問題與解決方案

#### 1. Rebase 衝突
```bash
# 檢查衝突檔案
git status

# 手動解決衝突後
git add .
git rebase --continue
```

#### 2. Worktree 同步問題
```bash
# 重新同步所有分支
npm run ai:sync

# 手動檢查特定分支
cd D:/marskingx-worktrees/codex-dev
git status
```

#### 3. 記憶檔案衝突
```bash
# 檢查記憶檔案狀態
npm run ai:memory

# 手動合併記憶檔案內容
# 更新最後修改時間
```

#### 4. 建置失敗
```bash
# 清除快取重新建置
hugo mod clean --all
npm run build

# 檢查結構化資料
npm run schema:validate
```

## 📊 監控與分析

### 定期檢查項目
- **每日**: `npm run ai:status` 檢查協作狀態
- **每週**: `npm run ai:memory` 同步記憶檔案
- **每月**: 檢視協作效率，調整分工策略

### 效能指標
- 分支衝突頻率
- 建置成功率
- 記憶檔案同步狀態
- 版本發布週期

## 🎉 系統優勢

### ✅ 已實現功能
1. **並行開發**: 三 AI 可同時開發不同功能
2. **衝突預防**: 自動檢測潛在衝突並提供建議
3. **記憶共享**: 混合式記憶系統確保資訊同步
4. **自動化工具**: 完整的管理和監控工具集
5. **版本控制**: 標準化的版本管理流程

### 🚀 未來擴展
- 更智能的衝突預測算法
- 自動化測試整合
- 效能監控儀表板
- AI 協作效率分析報告

---

## 🆘 緊急聯絡

如遇到無法解決的協作問題：

1. 創建緊急鎖定: `npm run conflict:lock`
2. 記錄問題到 `AI_SHARED.md`
3. 使用 `git rebase --abort` 回到安全狀態
4. 與其他 AI 協調解決方案

---

*本系統由 Claude (克勞德) 設計並與 Codex、Gemini 協作建立*  
*最後更新: 2025-08-22*  
*版本: v3.0.0.0*