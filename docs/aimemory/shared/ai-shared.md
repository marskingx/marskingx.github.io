# 三 AI Agent 共用專案記憶

## 多 AI 協作架構

### 🤖 AI Agent 分工
- **克勞德 (Claude)**: 主要開發、修復、版本管理
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
- **當前版本**: v3.4.1.0 (四位版本號系統)

### ⚡ 重要指令
```bash
# 開發
npm run dev                    # 本地開發伺服器
npm run build                  # 生產建置

# 版本管理 (四位版本號)
npm run version:show           # 顯示當前版本
npm run version:content        # 內容更新 (.0.0.1)
npm run version:patch          # 錯誤修復 (.0.1.0)  
npm run version:minor          # 新功能   (.1.0.0)
npm run version:major          # 重大更新 (1.0.0.0)

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

### 🚀 版本發布與部署流程

#### 「上版」流程 (Claude 專用暗號) - 僅版本發布
1. 用戶說「上版」→ Claude 執行版本發布 (本地)
2. 分析變更類型 (content/patch/minor/major)  
3. 執行 `npm run version:xxx` (本地提交版本)
4. 創建版本標籤
5. **🛑 停止於此** - 絕不自動部署

#### 部署確認流程 (需用戶授權)
1. 版本發布完成後，Claude 詢問: "是否要部署到 GitHub?"
2. 用戶明確同意後才執行部署
3. 部署指令: `git push origin main && git push --tags`
4. 觸發 GitHub Pages 自動部署

#### 一般開發流程
1. 分支開發完成
2. `git rebase origin/main` 
3. 通過所有測試 (`npm run build`)
4. 合併到 main
5. 部署需用戶確認

## 📝 開發規範

### 🗂️ 檔案命名規範

#### **特殊系統檔案** (保持大寫慣例)
```bash
# GitHub/開源專案標準檔案
README.md
LICENSE
CHANGELOG.md
CONTRIBUTING.md
CODE_OF_CONDUCT.md
README-NEWSLETTER-POPUP.md

# 系統配置檔案
Dockerfile
package.json
.gitignore
```

#### **一般專案檔案** (使用小寫)
- **統一小寫**: 使用小寫字母
- **連字符分隔**: 多個單字使用 `-` 分隔 (kebab-case)  
- **避免空格**: 檔案名稱不可包含空格
- **語意化命名**: 檔案名稱需清楚表達其功能用途

```bash
# 正確範例
ai-shared.md
hugo-upgrade-report.md  
seo-ctr-optimization.md
structured-data-validator.js

# 錯誤範例
AI_SHARED.md
Hugo_Upgrade_Report.md
SEO CTR Optimization.md
StructuredDataValidator.js
```

### 💻 程式碼命名慣例
```javascript
// 變數: camelCase
const imageOptimizer = new ImageOptimizer();

// 函式: camelCase，動詞開頭
function validateStructuredData() {}

// 檔案: kebab-case (全小寫)
// structured-data-validator.js
// version-manager.js
```

## 溝通協調

### 📋 日常檢查項目
- [ ] 檢查其他AI的分支狀態
- [ ] 確認無檔案衝突
- [ ] 驗證建置成功
- [ ] 結構化資料正常
- [ ] 遵循檔案命名規範

### 🔄 同步機制
- 每次工作前檢查 `ai-shared.md` 更新
- 重要變更更新此共用記憶
- 定期同步個人記憶文件重點
- 新建檔案時遵循小寫命名規範

---
*本文件由三AI共同維護，最後更新: 2025-08-23*
*詳細個人設定請參考: claude.md, gemini.md, codex.md*