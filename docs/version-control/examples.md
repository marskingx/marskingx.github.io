# 智能版控使用範例

實際操作範例和最佳實踐，幫助理解智能版本控制系統的日常使用。

## 🎯 日常開發範例

### 範例1: 新功能開發 (Claude)
```bash
# 1. 開始工作前的準備
cd D:/marskingx.github.io
npm run 下拉                    # 拉取最新更新
npm run ai:memory               # 檢查 AI 記憶狀態

# 輸出範例:
# ✅ 記憶檔案同步正常
# ✅ 共用記憶最後更新: 2025-08-24
# ⚠️  Codex 分支有新提交，建議同步

# 2. 檢查衝突風險
npm run conflict:check

# 輸出範例:  
# 📋 衝突風險分析
# ✅ 無高風險檔案變更
# ✅ 工作目錄乾淨
# 🟢 安全等級: 綠色 - 可以開始工作

# 3. 進行開發工作
# ... 編輯檔案、新增功能 ...

# 4. 提交前檢查
npm run test:system

# 輸出範例:
# 🧪 系統測試報告
# ✅ 核心檔案存在性檢查 - 通過
# ✅ npm scripts 可用性檢查 - 通過  
# ✅ 代碼品質工具測試 - 通過
# ⚠️  Git Hooks 設定檢查 - 失敗 (缺少 hooks 檔案)

# 5. AI上版
npm run 上版

# 輸出範例:
# 🤖 智能 Git 管理器 v2.0
# 📊 檔案分析完成
# 📁 公有檔案: 15 個 (content/, layouts/, static/)
# 🔒 私有檔案: 3 個 (.idea/, docs/aimemory/)  
# 📝 提交訊息: feat: 新增智能搜尋功能
# ✅ AI上版完成

# 6. 發布部署
npm run 上版&佈署

# 輸出範例:
# 🚀 智能發布開始
# 📊 分析檔案變更...
# 🔄 推送到公有儲存庫...
# 🎯 觸發 GitHub Pages 部署...
# ✅ 發布完成: https://marskingx.github.io

# 7. 記錄協作日誌
npm run 記憶

# 輸出範例:
# 🧠 AI 協作日誌更新
# 📝 任務: 新增智能搜尋功能  
# 📊 變更檔案: layouts/search.html, content/search.md
# 🏷️  版本更新: 3.4.1.1 -> 3.4.1.2 (第5碼自動遞增)
# ✅ 日誌記錄完成
```

### 範例2: 緊急修復 (任何 AI)
```bash
# 1. 發現緊急問題，立即處理
npm run conflict:lock layouts/critical-file.html

# 輸出範例:
# 🔒 檔案鎖定: layouts/critical-file.html
# ⚠️  其他 AI 將收到通知，避免同時編輯

# 2. 修復問題
# ... 編輯修復 ...

# 3. 快速測試
npm run test:system

# 4. 緊急提交
npm run 上版                   # 先提交修復
npm run version:patch          # 升級 patch 版本
npm run 上版&佈署              # 立即部署

# 5. 解鎖檔案
npm run conflict:unlock layouts/critical-file.html

# 6. 通知其他 AI
npm run 記憶
```

## 🤖 多 AI 協作範例

### 範例3: Codex 自動化腳本開發
```bash
# Codex 工作環境
cd D:/marskingx-worktrees/codex-dev

# 1. 同步主分支
git fetch origin main
git rebase origin/main

# 輸出範例:
# Successfully rebased and updated refs/heads/codex-dev.

# 2. 檢查 AI 狀態  
npm run ai:status

# 輸出範例:
# 🤖 多 AI 協作狀態
# 👤 Claude (main): ✅ 最新
# 🤖 Codex (codex-dev): 🔄 開發中
# 🧠 Gemini (gemini-dev): ⚠️ 需要同步 (2 commits behind)

# 3. 開發自動化腳本
# ... 建立新的自動化工具 ...

# 4. 測試腳本功能
npm run test:system:verbose

# 5. 提交到分支
git add scripts/new-automation.js
git commit -m "feat: 新增自動化部署腳本

🤖 Codex 開發
- 新增 CI/CD 自動化
- 支援多環境部署
- 整合測試流程"

git push --force-with-lease origin codex-dev

# 6. 記錄到協作日誌
npm run 記憶
```

### 範例4: Gemini 實驗功能
```bash
# Gemini 工作環境
cd D:/marskingx-worktrees/gemini-dev

# 1. 建立實驗分支
git checkout -b experiment/ai-content-generator

# 2. 進行實驗開發  
# ... 實驗性功能開發 ...

# 3. 分析效能影響
npm run perf:analyze

# 輸出範例:
# 📈 效能分析報告
# 🔍 掃描完成: 127 個檔案
# 📊 平均建置時間: 2.3s (+0.4s)
# ⚠️  新功能對效能有輕微影響
# 💡 建議: 啟用圖片懶載入

# 4. 驗證實驗結果
npm run schema:validate

# 5. 實驗成功，準備合併
git add .
git commit -m "experiment: AI 內容生成器原型

🧠 Gemini 實驗功能
- 自動生成文章摘要
- 智能標籤建議
- SEO 優化建議"

# 6. 推送實驗結果
git push origin experiment/ai-content-generator

# 7. 記錄實驗過程
npm run 記憶
```

## 📊 版本管理範例

### 範例5: 版本升級決策
```bash
# 查看當前版本
npm run version:show

# 輸出範例:
# 📋 當前版本資訊
# 🏷️  版本號: v3.4.1.2
# 📅 最後更新: 2025-08-24 21:45:32
# 👤 更新者: Claude
# 📝 更新內容: AI 協作日誌記錄

# 根據變更類型選擇版本升級
# 內容更新 -> version:content
npm run version:content

# 輸出範例:
# 📈 版本更新: 3.4.1.2 -> 3.4.1.3
# 📝 更新類型: 內容更新
# 📅 更新時間: 2025-08-24 22:10:15

# 新功能 -> version:minor
npm run version:minor

# 輸出範例:  
# 📈 版本更新: 3.4.1.3 -> 3.5.0.0
# 📝 更新類型: 新功能發布
# 🎯 重置內容和日誌版本號

# 生成更新日誌
npm run version:changelog

# 輸出範例:
# 📋 版本 v3.5.0.0 更新日誌
# 
# ## 新功能
# - AI 智能搜尋系統
# - 自動化部署流程
# 
# ## 改進
# - 效能優化 15%
# - SEO 結構優化
#
# ## 修復  
# - 修復圖片載入問題
# - 解決行動版顯示異常
```

### 範例6: 協作日誌自動記錄
```bash
npm run 記憶

# 輸出範例:
# 🧠 AI 協作日誌管理器
# 📝 請描述本次任務: 新增使用者註冊功能
# 📊 自動分析變更檔案...
# 
# 📋 變更檔案分析結果:
# - content/register.md (新增)
# - layouts/auth/register.html (新增)  
# - static/js/register.js (新增)
# 
# 🏷️  版本號更新: 3.5.0.0 -> 3.5.0.1
# 
# ✅ 協作日誌已記錄:
# ### [2025-08-24 22:15] - Claude
# - 任務: 新增使用者註冊功能
# - 摘要: 完整的註冊流程，包含驗證和 UI
# - 變更檔案: content/register.md, layouts/auth/register.html, static/js/register.js
# - 狀態: completed
# - 版本: 3.5.0.1
```

## 🔧 進階功能範例

### 範例7: 圖片優化工作流程
```bash
# 1. 分析圖片優化機會
npm run images:analyze

# 輸出範例:
# 🖼️  圖片分析報告
# 📁 掃描目錄: static/images/
# 📊 總檔案: 45 個
# 📈 總大小: 15.7MB
# 
# 🎯 優化建議:
# - hero-banner.jpg: 2.3MB -> 估計可減少 65%
# - product-gallery/*.png: 8 個檔案可轉 WebP
# - icons/*.svg: 可壓縮 25%

# 2. 預覽優化效果
npm run images:preview

# 輸出範例:
# 🔍 預覽優化效果 (不實際修改檔案)
# 
# hero-banner.jpg:
#   原始: 2.3MB (1920x1080)
#   優化: 0.8MB (-65%) (1920x1080, 質量85%)
#   
# product-01.png:
#   原始: 1.2MB (800x600)  
#   優化: 0.4MB (-67%) (WebP格式)

# 3. 執行優化
npm run images:optimize

# 輸出範例:
# 🖼️  開始圖片優化...
# ✅ hero-banner.jpg: 2.3MB -> 0.8MB (-65%)
# ✅ product-01.png -> product-01.webp: 1.2MB -> 0.4MB (-67%)
# 🎯 總節省: 8.2MB (-52%)

# 4. 驗證網站建置
npm run images:rebuild
```

### 範例8: 效能分析與優化
```bash
# 1. 建置並分析效能
npm run perf:build

# 輸出範例:
# 🏗️  建置完成
# 📊 開始效能分析...
#
# 📈 效能報告:
# ⏱️  建置時間: 3.2s (+0.7s 比上次)
# 📁 輸出大小: 45.2MB
# 🖼️  圖片: 25.1MB (55%)
# 📝 HTML: 12.3MB (27%)  
# 🎨 CSS: 4.8MB (11%)
# 📄 JS: 3.0MB (7%)
#
# 🎯 優化建議:
# - 啟用圖片懶載入可節省 40% 初始載入
# - CSS 未使用的類別可移除 15%
# - JS 程式碼分割可減少首屏載入時間

# 2. 根據建議進行優化
# ... 套用優化建議 ...

# 3. 重新分析驗證  
npm run perf:analyze

# 輸出範例:
# 📈 效能改善報告:
# ⏱️  建置時間: 2.5s (-0.7s, -22%)
# 📁 輸出大小: 38.1MB (-7.1MB, -16%)
# 🚀 首屏載入改善: 35%
```

### 範例9: 結構化資料驗證
```bash
npm run schema:validate

# 輸出範例:
# 🔍 結構化資料驗證開始...
# 
# ✅ BlogPosting Schema: 25 篇文章
#    - 所有必要欄位完整
#    - 圖片 Schema 正確
#    
# ⚠️  BreadcrumbList Schema: 發現問題
#    - 5 個頁面缺少 @type 屬性
#    - 建議修復: layouts/breadcrumb.html:15
#    
# ✅ Organization Schema: 正確
# ✅ WebSite Schema: 正確
#
# 📊 總計: 125 個結構化資料項目
# 🎯 通過率: 96%
# 💡 建議修復 BreadcrumbList 問題以達到 100%
```

## 🆘 問題排除範例

### 範例10: 衝突解決
```bash
# 1. 發現合併衝突
git rebase origin/main

# 輸出範例:
# Auto-merging layouts/header.html
# CONFLICT (content): Merge conflict in layouts/header.html
# error: could not apply abc1234... feat: 更新導航選單

# 2. 檢查衝突詳情
npm run conflict:check

# 輸出範例:
# ⚠️  發現合併衝突
# 📁 衝突檔案: layouts/header.html
# 👥 衝突來源: Claude vs Gemini  
# 🔍 衝突區域: 導航選單結構
# 
# 💡 解決建議:
# - 檢查兩個版本的差異
# - 保留較新的導航結構
# - 測試響應式設計

# 3. 手動解決衝突
# ... 編輯 layouts/header.html 解決衝突 ...

# 4. 標記解決並繼續
git add layouts/header.html
git rebase --continue

# 5. 驗證解決結果
npm run test:system
npm run schema:validate

# 6. 記錄解決過程
npm run 記憶
```

### 範例11: 系統健康檢查
```bash
npm run test:system:verbose

# 輸出範例:
# 🧪 詳細系統診斷
# 
# ✅ 核心檔案檢查
#    - hugo.toml: 存在且有效
#    - package.json: 版本 3.4.0
#    - themes/hugoplate: 正常載入
#
# ❌ Git Hooks 檢查  
#    - pre-commit: 缺少
#    - post-merge: 缺少
#    - 建議執行: npm run setup:hooks
#
# ✅ npm scripts 檢查
#    - 所有智能指令可用
#    - 依賴套件完整安裝
#
# ⚠️  私有儲存庫連接
#    - 連接正常但有未推送的變更
#    - 建議執行: npm run memory:push
#
# 📊 整體健康度: 85%
# 💡 執行建議的修復命令可達到 100%
```

---

## 🔀 智能併版範例

### 範例12: 智能併版操作 (新功能)
```bash
# 情境：codex-dev 分支有新功能需要併版到 main

# 1. 分析併版情況  
npm run 併版:分析

# 輸出範例:
# 📋 可併版分支分析:
# 
# 1. codex-dev
#    📈 領先: 5 個提交
#    📉 落後: 2 個提交  
#    🎯 建議策略: no-fast-forward
#    ✅ 無衝突
#
# 2. gemini-dev
#    📈 領先: 3 個提交
#    📉 落後: 2 個提交
#    🎯 建議策略: squash
#    ⚠️  衝突檔案: 1 個
#       - layouts/seo.html
#
# 💡 使用方式:
#   npm run 併版 <branch-name>     # 智能併版指定分支
#   npm run 併版 <branch> <strategy> # 指定合併策略

# 2. 執行智能併版 (自動策略)
npm run 併版 codex-dev

# 輸出範例:
# 🔀 開始智能併版: codex-dev -> main
# 🔍 分析分支狀態...
# 🔍 分支分析: codex-dev 領先 5 個提交，落後 2 個提交
# 🔍 檢測 codex-dev -> main 合併衝突...
# ✅ 無衝突檔案
# 📝 選擇合併策略: no-fast-forward (保留分支歷史記錄)
# 🔀 執行合併...
# 🔍 執行合併後驗證...
# ✅ 合併驗證通過
# ✅ 併版成功完成! codex-dev -> main

# 3. 併版後發布
npm run 上版&佈署

# 4. 記錄協作日誌
npm run 記憶
```

### 範例13: 處理併版衝突
```bash
# 情境：gemini-dev 分支有衝突需要解決

# 1. 嘗試併版
npm run 併版 gemini-dev

# 輸出範例:
# 🔀 開始智能併版: gemini-dev -> main
# 🔍 檢測到 1 個檔案衝突:
#   - layouts/seo.html
# 📝 選擇合併策略: rebase (重新整理提交歷史)
# ❌ 併版失敗: 合併過程中發現衝突，需要手動解決

# 2. 手動解決衝突並重試
# ... 編輯 layouts/seo.html 解決衝突 ...
git add layouts/seo.html

# 3. 使用 rebase 策略重新併版
npm run 併版 gemini-dev rebase

# 輸出範例:
# 🔀 開始智能併版: gemini-dev -> main  
# 📝 選擇合併策略: rebase (重新整理提交歷史)
# 🔀 執行合併...
# ✅ 併版成功完成! gemini-dev -> main

# 4. 清理併版過程檔案
npm run 併版:清理

# 輸出範例:
# 🧹 清理合併臨時檔案...
# ✅ 清理完成
```

### 範例14: 壓縮合併實驗功能
```bash
# 情境：將實驗分支的多個提交壓縮為一個提交

# 1. 檢查實驗分支狀態
npm run 併版:分析

# 2. 使用壓縮合併策略
npm run 併版 experiment/ai-features squash

# 輸出範例:
# 🔀 開始智能併版: experiment/ai-features -> main
# 📝 選擇合併策略: squash (多個提交壓縮為一個)
# 🔀 執行合併...
# 📝 請輸入壓縮提交的訊息 (或按 Enter 使用預設訊息)
# 
# [系統會自動生成以下提交訊息]
# merge: 壓縮併版 experiment/ai-features 到 main
# 
# 🔀 智能併版操作 (壓縮模式)
# - 來源分支: experiment/ai-features
# - 目標分支: main
# - 合併策略: 多提交壓縮為單一提交
# - 執行者: Claude Code 智能併版系統

# 3. 驗證併版結果
git log --oneline -5

# 輸出範例:
# abc1234 merge: 壓縮併版 experiment/ai-features 到 main
# def5678 feat: 智能搜尋功能完成
# ghi9012 fix: 修正圖片載入問題
```

## 🎯 最佳實踐總結

### ✅ 推薦做法
1. **開工前**: 必執行 `npm run 下拉` 和 `npm run ai:memory`
2. **提交時**: 使用 `npm run 上版` 而非直接 git commit
3. **發布時**: 執行完整流程 `npm run 上版&佈署` + `npm run 記憶`
4. **併版時**: 先執行 `npm run 併版:分析` 了解分支狀況 🆕
5. **協作時**: 尊重檔案責任區域，必要時使用鎖定機制
6. **修復時**: hotfix 立即處理，然後通知其他 AI

### ❌ 避免操作
1. **跳過智能系統**: 直接使用 `git add . && git commit`
2. **忽略衝突檢查**: 不執行 `npm run conflict:check`  
3. **修改他人區域**: 未協議修改其他 AI 的專責檔案
4. **遺漏日誌記錄**: 完成工作後忘記 `npm run 記憶`
5. **不測試就發布**: 未執行 `npm run test:system`
6. **強制併版**: 忽略衝突警告強行合併分支 🆕

---

*智能版本控制系統 v5.0 - 使用範例文件*
