# 學習筆記模板

## 使用說明

使用此模板來記錄解決問題的過程、學到的新知識或重要的技術發現。這些筆記將幫助未來遇到類似問題時快速找到解決方案。

## 模板

````markdown
### [主題/技術名稱] 學習內容標題

**問題**: 清楚描述遇到的具體問題或需要學習的內容

**解決方案**: 詳細說明採用的解決方法或學習到的知識點

**程式碼範例**: (如適用)

```language
// 在此放入相關的程式碼範例
// 包含註解說明關鍵部分
```
````

**步驟說明**: (如適用)

1. 第一步：具體操作
2. 第二步：具體操作
3. 第三步：具體操作

**注意事項**:

- 重要的注意點或容易犯錯的地方
- 相關的限制或前提條件

**參考資料**:

- [資源標題](URL) - 簡要說明此資源的價值
- [另一個資源](URL) - 簡要說明

**相關概念**: (可選)

- 相關的技術概念或術語解釋

**標籤**: #主題 #技術 #問題類型

````

## 範例

```markdown
### [Hugo] 解決 TailwindCSS 樣式不生效問題
**問題**: 在 Hugo 專案中使用 TailwindCSS 時，某些樣式類別沒有被正確載入，導致頁面樣式顯示不正確

**解決方案**: 問題出在 Hugo 的統計追蹤機制沒有正確識別使用的 CSS 類別。需要確保 hugo_stats.json 檔案正確生成，並且 TailwindCSS 配置中正確引用此檔案

**程式碼範例**:
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './hugo_stats.json', // 關鍵：引用 Hugo 統計檔案
    './layouts/**/*.html',
    './content/**/*.md',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
````

```toml
# hugo.toml 中的快取破壞設定
[[build.cachebusters]]
source = 'assets/watching/hugo_stats\.json'
target = 'style\.css'
```

**步驟說明**:

1. 檢查 hugo_stats.json 是否在專案根目錄生成
2. 確認 tailwind.config.js 中包含 './hugo_stats.json'
3. 在 hugo.toml 中設定正確的 cache buster
4. 清除快取：`hugo mod clean --all`
5. 重新建置：`npm run build`

**注意事項**:

- hugo_stats.json 檔案會在每次建置時更新，不要手動編輯
- 確保 TailwindCSS 版本與 Hugo 版本相容
- 開發模式下可能需要重啟 Hugo server 才能看到變更

**參考資料**:

- [Hugo + TailwindCSS 官方指南](https://gohugo.io/hugo-pipes/tailwindcss/) - 官方整合文件
- [TailwindCSS Content Configuration](https://tailwindcss.com/docs/content-configuration) - 內容配置說明

**相關概念**:

- **PurgeCSS**: TailwindCSS 用來移除未使用樣式的機制
- **Cache Busting**: 確保瀏覽器載入最新資源的技術

**標籤**: #hugo #tailwindcss #css #troubleshooting #build

````

## 另一個範例

```markdown
### [JavaScript] 實作防抖動 (Debounce) 函數
**問題**: 需要限制函數的執行頻率，避免在短時間內重複觸發（如搜尋輸入框）

**解決方案**: 使用防抖動技術，在指定時間內如果函數被多次調用，只執行最後一次

**程式碼範例**:
```javascript
function debounce(func, delay) {
  let timeoutId;

  return function (...args) {
    // 清除之前的計時器
    clearTimeout(timeoutId);

    // 設定新的計時器
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// 使用範例
const searchInput = document.getElementById('search');
const debouncedSearch = debounce((query) => {
  console.log('搜尋:', query);
  // 執行搜尋邏輯
}, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
````

**步驟說明**:

1. 建立 debounce 函數，接收原函數和延遲時間
2. 返回一個新函數，內部管理計時器
3. 每次調用時清除舊計時器，設定新計時器
4. 只有在延遲時間內沒有新調用時才執行原函數

**注意事項**:

- 使用 `apply` 確保 `this` 上下文正確傳遞
- 使用展開運算符 `...args` 傳遞所有參數
- 延遲時間通常設定為 200-500ms

**參考資料**:

- [MDN - setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout) - 計時器 API 文件
- [Lodash debounce](https://lodash.com/docs/4.17.15#debounce) - 成熟的 debounce 實作

**相關概念**:

- **Throttle**: 限制函數執行頻率的另一種方法
- **Event Loop**: JavaScript 的事件循環機制

**標籤**: #javascript #performance #debounce #event-handling

```

## 注意事項

1. **標題明確**: 使用清楚的標題描述學習的主題
2. **問題具體**: 詳細描述遇到的具體問題或學習目標
3. **解決方案完整**: 提供完整的解決步驟，讓未來能夠重現
4. **程式碼註解**: 在程式碼中添加註解說明關鍵部分
5. **標籤分類**: 使用相關標籤便於搜尋和分類
6. **持續更新**: 如果發現更好的解決方案，及時更新筆記
```
