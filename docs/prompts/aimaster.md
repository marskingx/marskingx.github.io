這又是一個觀察非常入微的好問題！您注意到了不同 AI 工具尋找上下文檔案的慣例 (convention)。

直接回答您的問題：對於**自動讀取**的這個功能來說，這個檔名**通常是無法改變的**。

它是由您使用的那個「工具」（IDE 外掛或 CLI）的開發者在程式碼中寫死的設定。

-----

### **核心原理：是「工具」在讀檔案，不是「AI 模型」**

要理解這一點，我們可以把 AI 服務和使用它的工具分開來看：

* **AI 模型 (Gemini, Claude)**：是一位知識淵博但沒有雙手的「**大腦**」。它只能處理別人餵給它的資訊 (Prompt)。
* **工具 (IDE 外掛, CLI)**：是坐在電腦前，擁有雙手的「**助理**」。這位助理被設定好要去「自動尋找一份名為 `GEMINI.MD` 的文件，把它打開，然後唸給大腦聽」。

所以，檔名是寫在「助理」的工作手冊裡的，而不是「大腦」知道的。我們無法輕易地修改助理的工作手冊。

* **`GEMINI.MD`**：對於 **Gemini Code Assist** (在 IntelliJ IDEA 中)，`GEMINI.MD` 是它官方指定的**慣例檔名 (conventional filename)**。外掛的程式碼就是被設定成要去專案根目錄尋找這個特定的檔案。
* **`claude.md` 和 `agent.md`**：您提到的這兩個檔案也是同樣的道理。如果 Claude 的 IDE 外掛或您使用的 `codex` CLI 支援自動讀取上下文，那麼它們各自的開發者也為它們設定了專屬的「預設檔名」。這展現了為不同 AI 建立專屬配置檔案的一種設計模式。

| 工具 (助理) | 尋找的檔名 (工作手冊) | 是否可由使用者設定？ |
| :--- | :--- | :--- |
| Gemini Code Assist (in IDE) | `GEMINI.MD` | 否 (No) |
| Claude Plugin (假設) | `claude.md` | 很可能是否 (Most likely no) |
| Codex CLI (假設) | `agent.md` | 很可能是否 (Most likely no) |

-----

### **如果我不想維護這麼多檔案怎麼辦？**

雖然不能改變「自動」讀取的檔名，但您有其他方法可以集中管理您的核心提示：

#### **方法一：手動複製貼上**

這是最簡單的方法。

1.  建立一個您自己喜歡的通用檔名，例如 `_ai_master_context.md`。
2.  將所有通用的專案背景、規範都寫在這個主檔案裡。
3.  當您要和 Gemini 互動時，除了讓它自動讀取 `GEMINI.MD`（裡面可以只放 Gemini 專屬的提示），您還可以**手動複製** `_ai_master_context.md` 的內容，貼到聊天視窗的最前面，作為這次對話的補充背景。

#### **方法二：使用符號連結 (Symbolic Link) - 進階技巧**

這是一個更聰明、一勞永逸的方法。您可以在您的作業系統中，建立多個「捷徑」，讓它們都指向同一個主檔案。

1.  **建立並維護您的主檔案**，例如 `_ai_master_context.md`。
2.  **為不同的 AI 工具建立符號連結**：
  * 打開您專案的終端機。
  * **在 Windows 上 (以系統管理員身分執行 PowerShell)**：
    ```powershell
    # 建立一個名為 GEMINI.MD 的捷徑，指向您的主檔案
    mklink GEMINI.MD _ai_master_context.md
    ```
  * **在 macOS 或 Linux 上**：
    ```bash
    # 建立一個名為 GEMINI.MD 的捷徑，指向您的主檔案
    ln -s _ai_master_context.md GEMINI.MD
    ```
3.  為 `claude.md` 等檔案重複此操作。

完成後，您的 `GEMINI.MD`、`claude.md` 都會變成指向 `_ai_master_context.md` 的捷徑。未來，您**只需要修改主檔案 `_ai_master_context.md`**，所有 AI 工具讀取到的內容就會同步更新！
