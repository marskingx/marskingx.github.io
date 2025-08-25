# 表格樣式修復紀錄（AI 版控暫存）

本檔案記錄一次表格樣式導致 Hugo/PostCSS 編譯失敗的修復重點，作為團隊協作參考。

## 問題描述

- PostCSS 報錯：`No max-md screen found`（Tailwind 沒有 `@screen max-md` 別名）。
- 使用了不存在的 Tailwind 工具類：`-webkit-overflow-scrolling-touch`（應為原生 CSS 屬性）。

## 修復方式

- 將 `@screen max-md` 改為標準媒體查詢：`@media (max-width: 767px)`。
- 保留 `@apply overflow-x-auto;`，並以原生屬性 `-webkit-overflow-scrolling: touch;` 啟用 iOS 慣性滾動。
- 變更位置：`themes/hugoplate/assets/scss/components.scss`（`.responsive-table-wrapper` 區塊）。

## 影響範圍

- 使用下列短碼或元件的頁面皆受益：
  - `layouts/shortcodes/responsive-table.html`
  - `layouts/shortcodes/table-cards.html`
  - `layouts/shortcodes/comparison-table.html`

## 驗證建議

- 本地 `hugo server` 可正常啟動。
- 行動版可水平滑動表格，iOS 具備慣性滾動。
