---
title: "【測試】Mailchimp 自動化電子報系統測試"
description: "測試新建立的 Mailchimp 自動化系統是否能正確運作，這是一篇測試文章。"
author: 懶大
release: 2025-08-21
date: 2025-08-21
image: /images/blog/20250821.png
categories: [測試]
tags: [測試, 系統驗證]
draft: false
slug: test-mailchimp-automation-system
---

這是一篇測試文章，用於驗證我們新建立的 Mailchimp 自動化電子報系統。

## 測試目的

1. 確認 GitHub Actions 工作流程能正確觸發
2. 驗證文章 front matter 解析功能
3. 測試 Mailchimp API 整合
4. 確認電子報模板渲染正常

## 預期結果

當這篇文章被推送到 main 分支時，應該會：

1. 觸發 `.github/workflows/mailchimp_notification.yml` 工作流程
2. 執行 `.github/scripts/mailchimp-notifier.js` 腳本
3. 解析此文章的 front matter 資訊
4. 創建並發送 Mailchimp 電子報給訂閱者

如果您收到電子報通知，表示系統運作正常！

{{< notice "info" >}}
這是一篇測試文章，測試完成後會被刪除。
{{< /notice >}}

{{< quote author="懶大" >}}
自動化讓我們更專注於創造價值，而不是重複性工作。
{{< /quote >}}