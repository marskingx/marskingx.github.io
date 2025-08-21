---
title: "【Debug】Mailchimp 系統除錯測試"
description: "使用 debug 腳本詳細檢查 Mailchimp API 連線和環境設定，診斷系統問題。"
author: 懶大
release: 2025-08-21
date: 2025-08-21
image: /images/blog/20250821.png
categories: [測試, 除錯]
tags: [Debug, Mailchimp, API, 系統診斷]
draft: false
slug: mailchimp-debug-test
---

這是 debug 測試文章，用於詳細檢查 Mailchimp 自動化系統的各個環節。

## Debug 檢查項目

### 環境變數驗證
- ✅ MAILCHIMP_API_KEY 是否已設定
- ✅ MAILCHIMP_SERVER_PREFIX 是否正確
- ✅ MAILCHIMP_AUDIENCE_ID 是否有效
- ✅ SITE_BASE_URL 配置

### 依賴套件檢查
- ✅ axios 是否正確載入
- ✅ front-matter 套件狀態
- ✅ Node.js 環境版本

### API 連線測試
- ✅ Mailchimp ping 端點測試
- ✅ 受眾清單存取權限
- ✅ API Key 格式驗證
- ✅ Server Prefix 匹配檢查

### Git 環境檢查
- ✅ Git 版本資訊
- ✅ 當前 Commit ID
- ✅ 變更檔案檢測

## 預期除錯輸出

此次執行應該會提供詳細的診斷資訊，幫助我們找出之前失敗的具體原因。

{{< notice "info" >}}
Debug 模式會顯示詳細的環境資訊，但不會洩露敏感的 API Key 內容。
{{< /notice >}}

{{< quote author="懶大" >}}
詳細的日誌是解決問題的最佳工具。
{{< /quote >}}