# Mailchimp 自動化電子報設定指南

## 概述

本專案包含一個完整的自動化系統，當有新文章發布時會自動發送 Mailchimp 電子報通知給訂閱者。

## 設定步驟

### 1. Mailchimp API 設定

#### 1.1 取得 API Key
1. 登入 [Mailchimp](https://mailchimp.com/)
2. 前往 **Account** → **Extras** → **API keys**
3. 點擊 **Create A Key** 創建新的 API Key
4. 複製產生的 API Key（格式類似：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us14`）

#### 1.2 取得 Server Prefix
API Key 的最後部分就是 Server Prefix（例如：`us14`）

#### 1.3 取得 Audience ID
1. 前往 **Audience** → **All contacts**
2. 點擊 **Settings** → **Audience name and defaults**
3. 在頁面底部找到 **Audience ID**（10 位數字字串）

### 2. GitHub Secrets 設定

在 GitHub 專案中設定以下 Secrets：

1. 前往 GitHub 專案頁面
2. 點擊 **Settings** → **Secrets and variables** → **Actions**
3. 點擊 **New repository secret** 新增以下設定：

| Secret 名稱 | 說明 | 範例值 |
|------------|------|--------|
| `MAILCHIMP_API_KEY` | Mailchimp API 金鑰 | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us14` |
| `MAILCHIMP_SERVER_PREFIX` | Mailchimp 伺服器前綴 | `us14` |
| `MAILCHIMP_AUDIENCE_ID` | Mailchimp 受眾 ID | `1234567890` |
| `SITE_BASE_URL` | 網站基礎 URL | `https://marskingx.github.io` |

### 3. 驗證設定

#### 3.1 測試 API 連線
您可以使用以下 curl 指令測試 API 連線：

```bash
curl -X GET \
  'https://<server_prefix>.api.mailchimp.com/3.0/lists/<audience_id>' \
  -H 'Authorization: Bearer <api_key>'
```

#### 3.2 測試工作流程
1. 在 `content/blog/` 目錄下新增一篇測試文章
2. 提交並推送到 `main` 分支
3. 查看 GitHub Actions 執行結果

## 工作流程說明

### 觸發條件
- 推送到 `main` 分支
- 變更的檔案路徑包含 `content/**/*.md`

### 執行流程
1. **檢測變更**：分析 Git commit 中新增的 Markdown 檔案
2. **文章解析**：提取文章的 title、description、permalink 等資訊
3. **創建活動**：透過 Mailchimp API 創建電子報活動
4. **設定內容**：將文章內容轉換為 HTML 電子報格式
5. **發送電子報**：自動發送給所有訂閱者

### 檔案結構
```
.github/
├── workflows/
│   └── mailchimp_notification.yml    # GitHub Actions 工作流程
├── scripts/
│   └── mailchimp-notifier.js         # 主要處理腳本
└── MAILCHIMP_SETUP.md                # 本設定文檔
```

## 電子報模板

### 預設設定
- **寄件者名稱**：懶得變有錢
- **回覆信箱**：noreply@lazytoberich.com
- **主旨前綴**：【懶得變有錢】新文章通知：
- **內容格式**：響應式 HTML + 純文字版本

### 自訂樣式
電子報使用響應式設計，支援：
- 文章標題和描述
- 文章特色圖片
- 分類和標籤資訊
- 閱讀完整文章按鈕
- 取消訂閱連結

## 故障排除

### 常見問題

#### 1. API 權限錯誤
**錯誤訊息**：`401 Unauthorized`
**解決方法**：
- 檢查 MAILCHIMP_API_KEY 是否正確
- 確認 API Key 尚未過期

#### 2. 受眾 ID 錯誤
**錯誤訊息**：`404 Resource Not Found`
**解決方法**：
- 檢查 MAILCHIMP_AUDIENCE_ID 是否正確
- 確認該受眾清單存在且可存取

#### 3. 工作流程未觸發
**可能原因**：
- 變更的檔案不在 `content/` 目錄下
- 檔案不是 `.md` 格式
- 推送的分支不是 `main`

#### 4. 檔案解析錯誤
**可能原因**：
- 文章 front matter 格式不正確
- 缺少必要的欄位（title）

### 除錯方法

#### 1. 查看 GitHub Actions 日誌
1. 前往 GitHub 專案的 **Actions** 頁面
2. 點擊失敗的工作流程執行
3. 查看詳細的錯誤訊息

#### 2. 本地測試腳本
```bash
# 安裝相依套件
npm install axios yaml front-matter

# 設定環境變數
export MAILCHIMP_API_KEY="your-api-key"
export MAILCHIMP_AUDIENCE_ID="your-audience-id"

# 執行腳本
node .github/scripts/mailchimp-notifier.js
```

## 安全最佳實踐

### API Key 管理
- ✅ **使用 GitHub Secrets**：永不在程式碼中直接寫入 API Key
- ✅ **定期輪換**：建議每 6 個月更新一次 API Key
- ✅ **最小權限原則**：只給予必要的 API 權限

### 監控與警示
- 設定 Mailchimp 活動監控
- 追蹤電子報開信率和點擊率
- 定期檢查 GitHub Actions 執行狀態

## 進階設定

### 自訂電子報模板
修改 `mailchimp-notifier.js` 中的 `createEmailContent` 函數來自訂電子報外觀。

### 條件式發送
您可以在腳本中加入更複雜的邏輯，例如：
- 只在特定分類的文章發布時發送
- 根據文章標籤決定發送給不同的訂閱群組
- 設定發送時間限制

### 多語言支援
如果網站支援多語言，可以修改腳本來處理不同語言的電子報模板。

## 聯絡資訊

如果您在設定過程中遇到問題，請：
1. 查看 GitHub Issues
2. 參考 Mailchimp 官方文檔
3. 聯絡網站管理員

---

*最後更新：2025-08-21*
*版本：v1.0.0*