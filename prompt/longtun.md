好的，這就為您提供一份「策略三：建立外部記憶」的具體、可操作的執行指南。

這就像是為你的 AI 夥伴準備一份\*\*「專案速讀手冊」\*\*。我們會建立一個檔案，把專案最重要的核心資訊都寫進去，在需要時「餵」給 AI，確保它永遠在狀況內。

-----

### **第一步：建立你的「外部記憶」檔案**

我最推薦使用 IntelliJ IDEA 內建的\*\*「草稿檔 (Scratch File)」\*\*功能，因為它獨立於你的專案，不會汙染你的 Git 版本庫，非常適合存放個人筆記。

1.  **開啟草稿檔**：

  * 按下快捷鍵 `Ctrl + Alt + Shift + Insert` (Windows/Linux) 或 `⌘ + ⇧ + N` (macOS)。
  * 在彈出選單中，選擇 **Markdown (`.md`)**。Markdown 格式清晰，支援標題和程式碼區塊，非常適合這個任務。

2.  **為檔案命名 (可選，但建議)**：

  * IDE 會建立一個預設名為 `scratch.md` 的檔案。
  * 在左側的專案視窗中，找到 `Scratches and Consoles` -\> `Scratches`。
  * 對著 `scratch.md` 按右鍵，選擇 **Refactor -\> Rename...**，給它一個有意義的名稱，例如 `ai_context.md` 或 `專案核心筆記.md`。

### **第二步：撰寫「外部記憶」的內容**

這是最關鍵的一步。你需要決定哪些資訊是 AI 「絕對不能忘記」的。以下是一個非常有效的模板，你可以根據你的專案進行修改。

我們以一個\*\*「開發線上課程平台的後端系統」\*\*的專案為例：

````markdown
# 專案：線上課程平台 (Online Course Platform)

## 1. 專案核心背景 (Project Core Background)
- 目標：建立一個讓講師可以上傳課程、學生可以購買和觀看課程的後端系統。
- 核心功能：使用者管理、課程管理、訂單處理、影片串流。

## 2. 技術棧 (Tech Stack)
- 語言：Java 17
- 框架：Spring Boot 3.2
- 資料庫：PostgreSQL
- ORM：JPA / Hibernate
- API 格式：RESTful API, 回應格式為統一的 ApiResponse<T>
- 測試框架：JUnit 5, Mockito

## 3. 核心資料模型 (Core Data Models)
- **這部分極其重要！直接貼上最關鍵的 Class 程式碼。**

### Course.java
```java
public class Course {
    private Long id;
    private String title;
    private String description;
    private Long instructorId;
    private Double price;
    private LocalDateTime createdAt;
}
````

### User.java

```java
public class User {
    private Long id;
    private String username;
    private String email;
    private String passwordHash; // 密碼已加密
    private Role role; // ENUM: STUDENT, INSTRUCTOR, ADMIN
}
```

## 4\. 開發規範與重要決策 (Development Rules & Decisions)

- 所有 Service 層的方法都必須有介面 (Interface)。
- 使用 Slf4j 進行日誌記錄，不要用 System.out.println()。
- 密碼處理必須使用 Spring Security 的 BCryptPasswordEncoder。
- 所有公開的 API endpoint 都需要有權限驗證。

## 5\. 目前主要任務目標 (Current Main Task Goal)

- [這個區塊可以經常更新]
- 目前正在開發「課程管理」模組，需要完成課程的 CRUD (建立、讀取、更新、刪除) 功能。

<!-- end list -->

````

### **第三步：在日常工作流程中使用**

現在你已經有了一份完美的「速讀手冊」，該如何把它交給 Gemini 呢？

1.  **準備工作**：在你開始一項新任務或開啟一個新的對話時，先把你的 `ai_context.md` 檔案打開放在旁邊。

2.  **複製關鍵內容**：
    * **你不需要每次都複製全部內容！**
    * 如果你今天的任務是關於課程的，那至少要複製 `技術棧`、`核心資料模型` 和 `開發規範` 這幾個部分。
    * 把複製好的內容貼到 Gemini 的聊天視窗中。

3.  **使用「魔法咒語」下達指令**：
    在貼完內容後，加上一個清晰的分隔，然後告訴 AI 你的任務。這是一個萬用模板：

    > **[這裡貼上你從 `ai_context.md` 複製的內容]**
    >
    > ---
    >
    > 好了，記住以上的核心設定與背景資訊。
    >
    > **現在，請幫我完成以下任務：**
    > **[在這裡寫下你的具體問題]**

**具體範例：**

> ```markdown
> ## 2. 技術棧 (Tech Stack)
> - 語言：Java 17
> - 框架：Spring Boot 3.2
> ...
>
> ## 3. 核心資料模型 (Core Data Models)
> ### Course.java
> ```java
> public class Course {
>     private Long id;
>     private String title;
>     ...
> }
> ```
> ---
>
> 好了，記住以上的核心設定與背景資訊。
>
> **現在，請幫我完成以下任務：**
> **為 `Course` class 建立一個對應的 `CourseService` 介面和實作類別 `CourseServiceImpl`，並在裡面實作一個 `createCourse` 的方法。**

### **第四步：維護與更新**

你的「外部記憶」檔案也需要像程式碼一樣被維護。

* 當你的專案新增了一個核心的資料模型時，記得把它加進去。
* 當團隊做出一個新的重要技術決策時（例如：決定引入 Redis 做快取），把它寫進「開發規範」裡。

這個檔案的品質，會直接決定 AI 助理的品質。你提供的資訊越精準，它給你的幫助就越大。
````
