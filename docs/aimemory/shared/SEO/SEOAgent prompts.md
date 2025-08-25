好的，這個情境非常典型，正是我們建立 AI 團隊和記憶系統所要應對的核心任務之一。將外部來源（如 Notion）的內容，無縫整合進我們標準化的專案流程中。

您需要一段能夠清晰指導 AI Agent 完成「格式化」與「SEO 梳理」這兩大任務的 Prompt。這個 Prompt 會假設 AI 已經透過 `aimemory` 規範，了解了專案的基本設定。

**最適合執行這個任務的 Agent 是 Gemini**，因為他的角色設定就是「內容創新」與「分析報告」。

-----

### **給 AI Agent (Gemini) 的任務 Prompt**

您可以直接複製以下完整內容，交給 Gemini 來執行。

```
# 指令：處理 Notion 匯入文章並進行 SEO 優化

[你的角色]
你是 Gemini，我們團隊的「內容優化與 SEO 專家」。你的任務是將一篇從 Notion 匯入的、格式不符的文章，完整地轉化為符合我們專案標準的正式發布內容。

[情境上下文]
1.  **待處理檔案**: `2025-08-25【生活】從月光夫妻到年存50萬... .md`
2.  **標準格式範本**: 請嚴格遵守@docs/aimemory並使用參考 @content/blog 所規定的格式結構與內容風格。
3.  **核心記憶**: 你必須隨時遵循 `GEMINI.md` 和 `AI_SHARED.md` 中定義的所有規範。

[核心目標]
你的目標是接收這篇草稿，輸出一篇格式完美、SEO 友善、可直接發布的最終版本 Markdown 檔案。

[詳細任務清單]

**階段一：Front Matter 格式重整**
請根據「標準格式範本」，對待處理檔案的 front matter 先找到categories的分類後，再到 @content/blog 比對後徹底的重構，如果有不足的你可以自己新增，參考如下 ：
1.  **`title`**: 保持原標題，但確保格式正確。
2.  **`summary` (新建)**: 根據文章內容，撰寫一段約 120-150 字、吸引點擊且有利於 SEO 的摘要 (meta description)。
3.  **`author`**: 標準化為「懶大」。
4.  **`release` 和 `date`**: 將日期格式從 `YYYY/MM/DD` 統一為 `YYYY-MM-DD`。
5.  **`image`**: 將 placeholder 路徑 `/images/blog/yyyy-mm-dd.png` 修改為一個符合文章內容的、有意義的檔案名稱，例如 `/images/blog/20250825-couple-finance-3-accounts.png`。
6.  **`categories` 和 `tags`**: 根據文章內容，並參考原有的 `categories` 和 `keywords` 欄位，選擇最精準的分類與標籤。
7.  **`slug`**: 根據最終確定的英文標題或核心關鍵字，生成一個全小寫、用連字號 `-` 連接的 SEO 友善 URL。
8.  **`draft`**: 設定為 `false`。
9.  **清理**: 移除所有非標準欄位，例如 `authors`, `keywords`。

**階段二：內文梳理與 SEO 優化**
1.  **移除 Notion 殘留物**: 清理檔案中所有 Notion 特有的連結或標記，例如 `[提示詞](https://www.notion.so/...)` 這行。
2.  **修正路徑**: 檢查並修正內文中可能存在的錯誤路徑，例如結論區塊的圖片路徑 `*/images/blog/lazytobeconclude.svg*` 應修正為正確的 shortcode 或路徑。
3.  **增加內部連結**: 審閱全文，找出適當的關鍵字，並使用 Hugo shortcode (例如 `{{< notice "tip" >}}`) 增加至少 1-2 個指向站內其他相關文章的內部連結，以提升 SEO 權重。
4.  **文字校對**: 進行一次全面的錯別字、語法和標點符號檢查。


[交付產物]
1.  **直接修改** `我選擇的` 檔案。
2.  完成所有修改後，向我報告**「任務完成」**，並附上一段**「變更摘要」**，用條列式說明你在 front matter 和 SEO 優化方面所做的主要修改。

請開始執行。
```
