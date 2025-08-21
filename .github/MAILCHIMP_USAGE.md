# Mailchimp 電子報自動化使用說明

## 🎯 系統功能

當有新文章發布到 `content/blog/` 或 `content/posts/` 時，系統會自動：
1. 檢測新增的 Markdown 文件
2. 解析文章標題、描述和連結
3. 創建 Mailchimp 電子報活動
4. 發送電子報給所有訂閱者

## ⚙️ 環境變數設定

在 GitHub Repository 的 Settings > Secrets and variables > Actions 中設定：

### 必要變數
- `MAILCHIMP_API_KEY`: 你的 Mailchimp API 金鑰
- `MAILCHIMP_AUDIENCE_ID`: 你的受眾清單 ID
- `FROM_EMAIL`: 寄件者信箱（必須在 Mailchimp 中驗證）

### 可選變數  
- `MAILCHIMP_SERVER_PREFIX`: 伺服器前綴 (預設: us14)
- `SITE_BASE_URL`: 網站基礎 URL (預設: https://lazytoberich.com.tw)

## 🧪 測試模式

### 啟用測試模式
在 GitHub Secrets 中新增：
- `TEST_MODE`: 設為 `true`
- `TEST_EMAIL`: 測試收件者信箱 (選用，預設: shamangels@gmail.com)

### 測試模式行為
- ✅ 創建 Mailchimp 活動（DRAFT 狀態）
- ❌ **不會發送**電子報給訂閱者
- 📝 在 Actions 日誌中顯示測試模式提示
- 🔍 可在 Mailchimp 控制台預覽電子報內容

### 測試流程
1. 設定 `TEST_MODE=true`
2. 推送新文章到 repository
3. 檢查 GitHub Actions 執行結果
4. 登入 Mailchimp 查看 DRAFT 活動
5. 確認內容無誤後，移除 `TEST_MODE` 或設為 `false`

## 🚀 正式發布模式

### 啟用正式模式
- 移除 `TEST_MODE` 或設為 `false`
- 確保 `FROM_EMAIL` 已在 Mailchimp 驗證

### 正式模式行為
- ✅ 創建 Mailchimp 活動
- ✅ **自動發送**給所有訂閱者
- 📊 在 Actions 日誌顯示發送統計

## 🔧 故障排除

### 常見錯誤

#### 401 Unauthorized
- 檢查 `MAILCHIMP_API_KEY` 是否正確
- 確認 API 金鑰格式：`xxxxxxxx-us14`

#### 400 Bad Request (寄件者問題)
- 確認 `FROM_EMAIL` 已在 Mailchimp 驗證
- 檢查 Domain Authentication 設定

#### 404 連結錯誤
- 確認 `SITE_BASE_URL` 設定正確
- 檢查文章的 `slug` 欄位設定

### 檢查工具

#### 本地測試
```bash
# 進入專案目錄
cd .github/scripts

# 設定環境變數（Windows）
set MAILCHIMP_API_KEY=你的API金鑰
set MAILCHIMP_AUDIENCE_ID=你的受眾ID
set FROM_EMAIL=你的信箱
set TEST_MODE=true

# 執行測試
node debug-mailchimp.js
```

#### GitHub Actions 日誌
查看 Actions 頁面的執行日誌，搜尋：
- `[ERROR]`: 錯誤訊息
- `🧪 測試模式`: 測試模式提示
- `活動創建成功`: 成功建立活動

## 📝 版本管理整合

系統已整合版本管理，當發布新文章時：
1. 自動更新內容版本號 (`x.x.x.1` → `x.x.x.2`)
2. 提交變更到 Git
3. 觸發 Mailchimp 工作流程

使用指令：
```bash
npm run version:content  # 手動更新內容版本
```

## 🎨 自定義設定

### 修改電子報模板
編輯 `.github/scripts/mailchimp-notifier.js` 中的 `createEmailContent` 函數

### 修改觸發條件
編輯 `.github/workflows/mailchimp_notification.yml` 中的 `paths` 設定

### 修改文章來源
修改 `CONFIG.CONTENT_PATHS` 陣列，加入其他目錄

---

🎉 **系統已完全自動化，享受無縫的內容發布體驗！**
