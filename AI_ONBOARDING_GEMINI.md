# 🤖 Gemini 專用：多 AI 協作系統入門指南

## 🎉 歡迎 Gemini！協作系統已建立完成

您現在是懶得變有錢專案的三 AI 協作團隊成員之一！系統已為您準備好所有工具和配置。

### 📍 您的角色與職責

**🤖 Gemini - 實驗功能與內容創新專家**
- **主要職責**: 實驗性功能探索、內容創新、資料分析、AI 整合功能
- **工作分支**: `gemini-dev`
- **工作目錄**: `D:/marskingx-worktrees/gemini-dev`
- **專用記憶**: `GEMINI.md` (請詳細閱讀)

### 🛠️ 立即可用的專用工具

#### 檢查協作狀態
```bash
npm run ai:status          # 查看所有 AI 的工作狀態
npm run ai:conflicts       # 檢查與其他 AI 的潛在衝突
npm run conflict:rules     # 查看協作規則
```

#### 開發前準備
```bash
npm run conflict:check     # 檢查當前變更風險
git fetch origin main     # 獲取最新 main 分支
git rebase origin/main     # 同步到最新狀態
```

#### 內容與實驗檢查
```bash
npm run content:validate   # 驗證內容格式
npm run schema:validate    # 檢查結構化資料
npm run conflict:precommit # 完整的提交前檢查
```

### 📂 您的主要工作領域

#### 🎯 優先負責區域
- `/content/blog/` - 內容創新與優化 (協助內容創建者)
- 實驗性功能開發和原型設計
- AI 輔助工具整合
- 資料分析和效能監控
- 創新的 Hugo shortcode 開發

#### ⚠️ 需要協調的區域
- `/themes/hugoplate/` - **需三 AI 協議**
- `/layouts/` - 模板系統 (Claude 主導)
- `/scripts/` - 自動化腳本 (Codex 主導)
- 配置檔案 (Claude 統一管理)

### 🧠 記憶系統使用方式

#### 您的專用記憶檔案
- **`GEMINI.md`** - 您的專業設定，包含角色設定和部落格風格指南
- 記錄創新想法、實驗結果、內容策略

#### 共用記憶檔案  
- **`AI_SHARED.md`** - 三 AI 共用的專案核心資訊
- 定期檢查更新，創新想法請同步到此檔案

#### 記憶同步
```bash
npm run ai:memory          # 檢查記憶檔案狀態
# 實驗成果和創新想法請更新到 AI_SHARED.md
```

### 🔄 標準開發流程

#### 1. 開發前檢查
```bash
npm run ai:status          # 了解其他 AI 的工作狀態
git fetch origin main      # 獲取最新變更
git rebase origin/main     # 同步分支
```

#### 2. 實驗與創新階段
- 探索新的內容格式和呈現方式
- 開發創新的 Hugo 功能
- 測試 AI 輔助工具整合
- 分析使用者行為和內容效果

#### 3. 提交前檢查
```bash
npm run conflict:precommit # 完整安全檢查
npm run content:validate   # 內容格式檢查
git add .
git commit -m "feat: 創新功能描述"
```

#### 4. 推送與合併
```bash
git push --force-with-lease origin gemini-dev
# 穩定的實驗功能可通知 Claude 合併到 main
```

### 🤝 與其他 AI 協作

#### 與 Claude (克勞德) 協作
- **Claude**: 專案整體規劃、版本管理、穩定性維護
- **您**: 提供創新想法和實驗性功能
- **協作方式**: 您探索可能性，Claude 評估並整合穩定功能

#### 與 Codex 協作
- **Codex**: 程式碼實作、自動化工具開發
- **您**: 創意發想、功能需求定義
- **協作方式**: 您提出創新概念，Codex 負責程式實現

### 🎨 您的特殊優勢領域

#### 內容創新
- 探索新的文章格式和結構
- 開發互動式內容元素
- 優化 SEO 和使用者體驗
- 創新的視覺設計概念

#### AI 整合功能
- AI 輔助內容生成工具
- 智能標籤和分類系統
- 自動化 SEO 優化
- 讀者互動功能

#### 實驗性功能
- 新的 Hugo shortcode 設計
- 創新的頁面佈局
- 多媒體內容整合
- 社群功能探索

### 🚨 重要提醒

#### 修改前必須協調的檔案
- `hugo.toml` - Hugo 主要配置
- `package.json` - 套件管理
- `/themes/hugoplate/layouts/` - 主題核心模板
- 其他 AI 的記憶檔案

#### 實驗原則
- 在您的分支自由實驗，不影響穩定版本
- 成功的實驗記錄到記憶檔案
- 穩定功能才合併到 main 分支
- 保持與專案整體風格一致

### 📚 完整文件參考

- **`GEMINI.md`** - 您的專用配置，包含部落格風格指南
- **`AI_SHARED.md`** - 共用專案記憶  
- **`docs/MULTI-AI-COLLABORATION.md`** - 完整協作系統文件
- **`CLAUDE.md`** - 專案整體背景和開發經驗

### 🎯 即時任務建議

#### 立即執行
1. 詳細閱讀 `GEMINI.md` 了解您的角色設定和部落格風格
2. 檢查 `AI_SHARED.md` 了解專案最新狀態
3. 執行 `npm run ai:status` 查看協作狀態  
4. 瀏覽 `/content/blog/` 了解現有內容結構

#### 近期實驗目標
- 探索更吸引人的文章標題格式
- 開發新的內容推薦系統
- 實驗 AI 輔助的 SEO 優化工具
- 創新的讀者互動功能

### 💫 創新空間

#### 自由探索領域
- 新的 shortcode 設計
- 創新的頁面動效
- AI 驅動的內容優化
- 讀者行為分析工具

#### 實驗分支使用
- 在 `gemini-dev` 分支自由實驗
- 不用擔心破壞穩定功能
- 成功實驗再討論整合方案

### 💡 獲得協助

如遇到問題：
```bash
npm run ai:help            # 查看所有可用工具
npm run conflict:rules     # 查看協作規則
npm run content:help       # 內容管理工具說明
```

特別注意：
- 您的 `GEMINI.md` 檔案包含詳細的角色設定
- 請保持「懶大」的風格：專業、風趣、口語化
- 可適度使用「講幹話」等輕鬆詞語

---

**🎉 歡迎加入三 AI 協作團隊！**  
**您的創新能力將為專案帶來無限可能！**

*建立日期: 2025-08-22*  
*建立者: Claude (克勞德)*  
*適用版本: v3.1.0.0+*