# 智能版控指令參考

完整的智能版本控制系統指令說明，支援中文暗號和多 AI 協作。

## 🎯 核心指令

### 版本顯示
```bash
npm run version:show           # 顯示當前版本號 (5碼格式)
```

### 智能提交 & 發布

```bash
# 中文暗號指令
npm run 上版                   # 智能提交 (本地)
npm run 上版&佈署              # 智能發布 (含部署)  
npm run 記憶                   # 記錄 AI 協作日誌
npm run 下拉                   # 智能拉取更新

# 英文等效指令
npm run smart:commit           # = 上版
npm run smart:release          # = 上版&佈署  
npm run memory:log             # = 記憶
npm run smart:pull             # = 下拉
```

## 📊 版本管理 (5碼系統)

### 版本號格式
- **格式**: `major.minor.patch.content.log`
- **第5碼**: AI 協作日誌版本號

### 版本升級指令
```bash
npm run version:content        # 內容更新 (+0.0.0.1)
npm run version:patch          # 錯誤修復 (+0.0.1.0)
npm run version:minor          # 新功能   (+0.1.0.0)  
npm run version:major          # 重大更新 (+1.0.0.0)
npm run version:changelog      # 產生更新日誌
```

## 🧠 AI 協作管理

### 記憶同步
```bash
npm run ai:memory              # 檢查記憶檔案狀態
npm run memory:sync            # 同步記憶檔案
npm run memory:structure       # 檢查記憶目錄結構
npm run memory:clean           # 清理記憶檔案
```

### 多 AI 狀態管理
```bash
npm run ai:status              # 檢查所有 AI 分支狀態
npm run ai:sync                # 同步所有 AI 分支
npm run ai:conflicts           # 檢查潛在衝突
npm run ai:rebase              # 執行 rebase 操作
```

### 衝突防護
```bash
npm run conflict:check         # 檢查當前變更風險
npm run conflict:precommit     # 提交前安全檢查
npm run conflict:rules         # 顯示協作規則
npm run conflict:lock          # 鎖定檔案避免衝突
npm run conflict:unlock        # 解鎖檔案
```

## 🚀 智能發布系統

### 公有/私有檔案分離
```bash
npm run smart:analyze          # 分析檔案分類
npm run smart:help             # 顯示智能 Git 說明
```

### 私有儲存庫管理
```bash
npm run memory:status          # 私有儲存庫狀態
npm run memory:push [msg]      # 推送到私有儲存庫
npm run memory:pull            # 從私有儲存庫拉取
npm run memory:tag <name>      # 建立並推送標籤
npm run memory:help            # 記憶管理說明
```

## 📝 內容管理

### 文章處理
```bash
npm run content:new            # 建立新文章
npm run content:process        # 處理 Notion 匯出
npm run content:batch          # 批量處理檔案
npm run content:publish        # 一鍵發布文章
npm run content:validate       # 驗證所有文章
npm run content:validate:file  # 驗證單一檔案
npm run content:help           # 內容管理說明
```

## 🔧 品質控制

### 代碼檢查
```bash
npm run lint                   # ESLint 檢查修復
npm run lint:md                # Markdown 檢查修復
npm run lint:css               # CSS/SCSS 檢查修復  
npm run lint:all               # 全部檢查修復
```

### 系統驗證
```bash
npm run schema:validate        # 結構化資料驗證
npm run schema:build          # 建置並驗證結構
npm run perf:analyze          # 效能分析
npm run perf:build            # 建置並分析效能
npm run test:system           # 系統整體測試
npm run test:system:verbose   # 詳細系統測試
```

## 🖼️ 圖片優化

```bash
npm run images:analyze         # 分析圖片優化機會
npm run images:optimize        # 最佳化大型圖片
npm run images:preview         # 預覽優化效果
npm run images:clean           # 清理生成的圖片快取
npm run images:rebuild         # 重建圖片快取
```

## 🛠️ 開發工具

### 本地開發
```bash
npm run dev                    # 開發伺服器
npm run build                  # 生產建置
npm run preview                # 預覽建置結果
```

### 專案設置
```bash
npm run project-setup          # 專案初始化
npm run theme-setup            # 主題設置
npm run update-theme           # 主題更新
npm run setup:hooks            # Git hooks 設置
npm run setup:quality          # 品質工具安裝
```

## 💡 特殊功能

### Git 清理
```bash
npm run git:cleanup:full       # 完整 Git 歷史清理
npm run git:cleanup:selective  # 選擇性清理
```

### 發布管理
```bash
npm run release:start          # 互動式發布流程
npm run release:deploy         # 部署到生產環境
npm run push                   # 推送到 main 分支
npm run push:tags              # 推送包含標籤
```

## 📋 說明指令

```bash
npm run smart:help             # 智能 Git 說明
npm run ai:help                # AI 協作說明  
npm run content:help           # 內容管理說明
npm run memory:help            # 記憶管理說明
```

---

## 🎯 常用工作流程

### 日常開發
1. `npm run 下拉` - 拉取最新更新
2. 進行開發工作  
3. `npm run 上版` - 智能提交
4. `npm run 上版&佈署` - 發布部署

### AI 協作記錄
1. 完成任務後執行 `npm run 記憶`
2. 系統自動記錄到協作日誌
3. 版本號第5碼自動遞增

### 發布前檢查
1. `npm run conflict:check` - 檢查衝突風險
2. `npm run test:system` - 系統測試
3. `npm run schema:validate` - 驗證結構  
4. `npm run 上版&佈署` - 發布

---

*智能版本控制系統 v5.0 - 指令參考文件*