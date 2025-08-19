#!/usr/bin/env node

/**
 * Gemini API 記憶自動載入腳本
 * 使用 Google Gemini API 自動載入專案記憶
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

class GeminiMemoryLoader {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("請提供 Gemini API Key");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.memoryContent = `# 專案記憶 - 懶得變有錢部落格

> 這是一個通用的 AI 外部記憶檔案，適用於任何 AI 模型。
> 請在與 AI 對話時載入此檔案內容，以提供完整的專案上下文。

## 專案概述
- **專案名稱**: 懶得變有錢 (Lazytoberich)
- **完整標題**: 懶得變有錢 | 帶你了解財務規劃本質 鑑定自己的財務DNA
- **技術棧**: Hugo + TailwindCSS + Hugoplate Theme
- **目標**: 財務規劃教育部落格
- **語言**: 繁體中文 (zh-tw)
- **版本**: Hugoplate 1.15.1
- **開發環境**: Windows, Node.js, Git
- **部署平台**: GitHub Pages

## 重要決策記錄

### [2025-01-18] 選擇 Hugoplate 主題
**背景**: 需要一個現代化、響應式的 Hugo 主題來建立財務教育部落格
**選項**: 
- 自建主題: 完全客製化但開發時間長
- 使用現有的 Hugo 主題: 快速但可能不符合需求
- 選擇 Hugoplate 主題: 平衡客製化和開發效率
**決定**: 選擇 Hugoplate 主題
**理由**: 
- 內建 TailwindCSS 支援，符合現代開發趨勢
- 現代化設計和響應式佈局
- 豐富的插件和功能支援
- 良好的 SEO 優化
- 活躍的社群支援
**影響**: 加速開發進程，提供專業的視覺呈現，降低維護成本

### [2025-01-18] 建立通用 AI 外部記憶系統
**背景**: 需要一個持久化的知識管理系統來保存專案開發過程中的重要資訊，且要能被不同 AI 模型使用
**選項**:
- 使用外部文件管理工具: 功能豐富但不易整合
- 建立基於 Markdown 的記憶系統: 通用性好但需要自行開發
- 依賴 Git 提交訊息記錄: 簡單但資訊不夠結構化
- 使用特定 AI 平台的功能: 功能強大但平台綁定
**決定**: 建立基於 Markdown 的通用外部記憶系統
**理由**:
- 平台無關性：任何 AI 模型都能理解 Markdown 格式
- 人機共讀：開發者和 AI 都能輕鬆讀寫
- 版本控制友好：完全相容 Git 等版本控制系統
- 結構化且可搜尋：便於組織和檢索資訊
- 可擴展性：支援多種整合方式和客製化
**影響**: 
- 提供跨平台的專案上下文持續性
- 改善不同 AI 助手的協作效率
- 建立可重用的知識管理模式

## 技術配置

### Hugo 靜態網站生成器
- **版本**: 最新穩定版
- **基礎 URL**: https://marskingx.github.io/
- **時區**: Asia/Taipei
- **預設語言**: zh-tw (繁體中文)
- **分頁設定**: 120 篇文章
- **主題**: hugoplate
- **CJK 語言支援**: 啟用 (hasCJKLanguage = true)
- **語法高亮**: monokai 風格
- **摘要長度**: 0 (手動控制)

### TailwindCSS 配置
- **版本**: ^3.4.3
- **處理方式**: PostCSS 管道
- **統計追蹤**: hugo_stats.json
- **快取破壞**: 自動檢測變更
- **插件**: @tailwindcss/forms, @tailwindcss/typography
- **格線系統**: tailwind-bootstrap-grid

### 重要檔案位置
- **主題檔案**: themes/hugoplate/
- **內容檔案**: content/ (文章放在 content/blog/)
- **配置檔案**: hugo.toml
- **樣式檔案**: assets/scss/
- **靜態檔案**: static/
- **佈局模板**: layouts/
- **資料檔案**: data/
- **建置輸出**: public/ (自動生成)
- **AI 記憶**: docs/ai-memory/

### 服務整合
- **Google Analytics**: G-03PSTN4ES1
- **評論系統**: Disqus (themefisher-template)
- **搜尋功能**: 內建搜尋索引
- **Web App Manifest**: 支援 PWA 功能
- **RSS Feed**: 自動生成

### 建置和部署
- **開發命令**: \`npm run dev\` (hugo server)
- **建置命令**: \`npm run build\` (hugo --gc --minify --templateMetrics --templateMetricsHints --forceSyncStatic)
- **預覽命令**: \`npm run preview\` (生產環境預覽)
- **格式化**: \`npm run format\` (prettier)
- **部署平台**: GitHub Pages
- **自動部署**: GitHub Actions (如有設定)

## 學習筆記

### Hugo 效能優化
**問題**: 如何優化 Hugo 網站的建置效能和輸出品質
**解決方案**: 
- 啟用 \`--gc\` 垃圾回收清理未使用資源
- 使用 \`--minify\` 壓縮 HTML、CSS、JS 輸出
- 配置 \`templateMetrics\` 監控模板效能
- 使用 \`forceSyncStatic\` 確保靜態檔案同步
- 設定適當的快取策略 (720小時)
**程式碼範例**:
\`\`\`bash
# 完整的建置命令
hugo --gc --minify --templateMetrics --templateMetricsHints --forceSyncStatic
\`\`\`
**參考資料**: 
- [Hugo Performance](https://gohugo.io/troubleshooting/build-performance/)
- [Hugo Build Options](https://gohugo.io/commands/hugo/)
**標籤**: #hugo #performance #optimization

### TailwindCSS 與 Hugo 整合
**問題**: 如何在 Hugo 中正確配置 TailwindCSS 並確保樣式正確載入
**解決方案**:
- 使用 PostCSS 處理 CSS 檔案
- 配置 \`hugo_stats.json\` 追蹤實際使用的 CSS 類別
- 設定 cache busters 確保樣式變更時正確更新
- 使用 PurgeCSS 移除未使用的樣式
**程式碼範例**:
\`\`\`toml
# hugo.toml 中的快取破壞設定
[[build.cachebusters]]
source = 'assets/watching/hugo_stats\.json'
target = 'style\.css'

[[build.cachebusters]]
source = '(postcss|tailwind)\.config\.js'
target = 'css'
\`\`\`
**參考資料**:
- [Hugo with TailwindCSS](https://gohugo.io/hugo-pipes/tailwindcss/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
**標籤**: #tailwindcss #hugo #css #integration

### 中文網站優化
**問題**: 如何正確配置 Hugo 以支援繁體中文內容
**解決方案**:
- 設定 \`hasCJKLanguage = true\` 啟用中日韓語言支援
- 配置 \`defaultContentLanguage = 'zh-tw'\` 設定預設語言
- 停用不需要的語言 \`disableLanguages = ["en"]\`
- 設定正確的時區 \`timeZone = "Asia/Taipei"\`
**影響**: 正確處理中文字符計數、搜尋功能和 SEO 優化
**標籤**: #chinese #i18n #localization

### 外部記憶系統設計
**問題**: 如何設計一個通用的 AI 外部記憶系統
**解決方案**:
- 使用標準 Markdown 格式確保跨平台相容性
- 建立結構化的資訊組織方式
- 提供多種 AI 平台的整合方法
- 建立標準化的模板和格式規範
**程式碼範例**:
\`\`\`markdown
# 標準決策記錄格式
### [日期] 決策標題
**背景**: 背景描述
**選項**: 選項列表
**決定**: 最終決定
**理由**: 選擇理由
**影響**: 預期影響
\`\`\`
**參考資料**:
- [Markdown Specification](https://spec.commonmark.org/)
- [AI Context Management Best Practices](https://example.com)
**標籤**: #ai #memory #knowledge-management #markdown

## 最佳實踐

### 內容管理
- **文章組織**: 文章放置在 \`content/blog/\` 目錄，使用有意義的檔名
- **SEO 優化**: 使用完整的 front matter 設定標題、描述、關鍵字
- **圖片處理**: 使用 Hugo 的 image processing 功能優化圖片
- **載入優化**: 啟用 lazy loading 提升頁面載入效能
- **摘要控制**: 使用 \`summaryLength = 0\` 手動控制文章摘要

### 開發流程
- **本地開發**: 使用 \`npm run dev\` 啟動開發伺服器
- **程式碼品質**: 定期執行 \`npm run format\` 保持程式碼格式一致
- **建置測試**: 使用 \`npm run preview\` 在本地測試生產環境
- **版本控制**: Git 提交前檢查建置是否成功
- **部署驗證**: 部署後檢查網站功能是否正常

### 效能優化
- **快取策略**: 啟用 Hugo 的快取機制 (720小時)
- **圖片格式**: 優先使用 WebP 格式圖片
- **圖片品質**: 配置適當的圖片品質 (80%)
- **資源載入**: 使用 lazy loading 載入非關鍵資源
- **輸出壓縮**: 啟用 minification 壓縮所有輸出

### AI 記憶管理
- **即時更新**: 重要決策和學習立即記錄到記憶檔案
- **結構一致**: 遵循標準化的 Markdown 格式和模板
- **標籤使用**: 在學習筆記中使用標籤便於分類和搜尋
- **定期整理**: 每月整理記憶內容，歸檔過時資訊
- **版本控制**: 記憶檔案納入 Git 管理，定期提交更新

## 常見問題和解決方案

### Hugo 建置問題
**症狀**: Hugo 建置失敗或樣式顯示不正確
**原因**: 通常是 TailwindCSS 配置問題或快取衝突
**解決方法**: 
1. 清除 Hugo 模組快取：\`hugo mod clean --all\`
2. 重新安裝依賴：\`npm install\`
3. 重新建置：\`npm run build\`
4. 檢查 \`hugo_stats.json\` 是否正確生成
5. 驗證 PostCSS 和 TailwindCSS 配置
**預防措施**: 
- 定期更新依賴套件
- 使用 package-lock.json 鎖定版本
- 建立自動化測試流程

### 中文內容顯示問題
**症狀**: 中文字符顯示異常、搜尋功能失效或字數統計錯誤
**原因**: CJK 語言支援配置不正確
**解決方法**: 
1. 確保 \`hasCJKLanguage = true\` 已在 hugo.toml 中設定
2. 檢查 \`defaultContentLanguage = 'zh-tw'\` 配置
3. 驗證內容檔案的編碼為 UTF-8
4. 測試搜尋功能是否正常
**預防措施**: 
- 在配置變更後立即測試中文內容
- 建立中文內容的測試案例
- 定期檢查搜尋索引的生成

### GitHub Pages 部署問題
**症狀**: 部署後網站無法正常顯示或資源載入失敗
**原因**: baseURL 配置錯誤、路徑問題或建置檔案缺失
**解決方法**: 
1. 檢查 \`baseURL = "https://marskingx.github.io/"\` 配置
2. 確認 public/ 目錄內容完整
3. 檢查 GitHub Pages 設定和分支配置
4. 驗證靜態檔案路徑正確性
5. 檢查 CNAME 檔案 (如使用自訂網域)
**預防措施**: 
- 使用 \`npm run preview\` 在本地測試生產環境
- 建立部署前的自動檢查流程
- 監控部署狀態和錯誤日誌

### AI 記憶載入問題
**症狀**: AI 模型無法正確理解或使用記憶檔案內容
**原因**: 記憶檔案格式不當、內容過於複雜或載入方式錯誤
**解決方法**:
1. 檢查 Markdown 格式是否正確
2. 簡化複雜的巢狀結構
3. 確保資訊組織清晰有邏輯
4. 根據 AI 平台特性調整載入方式
5. 分割過大的記憶檔案
**預防措施**:
- 定期驗證記憶檔案格式
- 測試不同 AI 平台的載入效果
- 保持記憶內容的簡潔性

## 待辦事項和想法

### 短期目標 (1-2 週)
- [ ] 完善 AI 記憶系統的使用文件
- [ ] 建立內容創作的標準化流程和模板
- [ ] 優化網站的 SEO 設定和 meta 標籤
- [ ] 測試不同 AI 平台的記憶載入效果
- [ ] 建立自動化的記憶備份機制

### 中期目標 (1-2 個月)
- [ ] 建立自動化的內容發布和部署流程
- [ ] 實作進階的財務計算工具和互動元件
- [ ] 整合更多的分析和追蹤工具
- [ ] 建立內容管理的最佳實踐指南
- [ ] 優化網站效能和載入速度

### 長期規劃 (3-6 個月)
- [ ] 建立互動式的財務規劃表單和工具
- [ ] 考慮多語言支援的擴展可能性
- [ ] 探索 AI 輔助內容創作的整合
- [ ] 建立社群功能和用戶互動機制
- [ ] 研究進階的 SEO 和內容行銷策略

## 重要連結和資源

### 官方文件
- **Hugo**: https://gohugo.io/ - 靜態網站生成器官方文件
- **TailwindCSS**: https://tailwindcss.com/ - CSS 框架官方文件
- **Hugoplate**: https://github.com/zeon-studio/hugoplate - 主題官方倉庫

### 工具和服務
- **Google Analytics**: G-03PSTN4ES1 - 網站分析追蹤
- **部署平台**: GitHub Pages (https://marskingx.github.io/) - 靜態網站託管
- **版本控制**: GitLab (https://gitlab.com/lazytoberich/lazytoberich) - 原始碼管理
- **CDN**: GitHub Pages 內建 CDN 服務

### 開發資源
- **Node.js**: https://nodejs.org/ - JavaScript 執行環境
- **PostCSS**: https://postcss.org/ - CSS 處理工具
- **Prettier**: https://prettier.io/ - 程式碼格式化工具
- **Font Awesome**: https://fontawesome.com/ - 圖示庫

### 學習資源
- **Hugo 學習指南**: https://gohugo.io/getting-started/
- **TailwindCSS 教學**: https://tailwindcss.com/docs/installation
- **Markdown 語法**: https://www.markdownguide.org/
- **Git 版本控制**: https://git-scm.com/doc

## 專案結構說明

### 核心目錄結構
\`\`\`
專案根目錄/
├── content/              # 內容檔案 (Markdown)
│   ├── blog/            # 部落格文章
│   ├── pages/           # 靜態頁面
│   └── _index.md        # 首頁內容
├── layouts/             # 模板檔案 (HTML)
├── static/              # 靜態資源 (圖片、檔案)
├── assets/              # 需要處理的資源 (SCSS, JS)
├── data/                # 資料檔案 (YAML, JSON)
├── themes/hugoplate/    # 主題檔案
├── public/              # 建置輸出 (自動生成)
├── docs/ai-memory/      # AI 外部記憶系統
├── scripts/             # 輔助腳本
└── .kiro/               # Kiro IDE 配置 (如使用 Kiro)
\`\`\`

### 重要配置檔案
- **hugo.toml**: Hugo 主要配置檔案
- **package.json**: Node.js 依賴和腳本定義
- **tailwind.config.js**: TailwindCSS 配置
- **postcss.config.js**: PostCSS 處理配置
- **.gitignore**: Git 忽略檔案設定

### AI 記憶系統檔案
- **docs/ai-memory/project-memory.md**: 核心專案記憶檔案
- **docs/ai-memory/README.md**: 記憶系統使用說明
- **docs/ai-memory/templates/**: 記憶模板檔案
- **docs/ai-memory/tools/**: 記憶管理工具

## AI 使用指南

### 如何載入此記憶檔案

#### 對於 ChatGPT 用戶
1. 複製此檔案的完整內容
2. 在新對話開始時貼入以下提示：
\`\`\`
請載入以下專案記憶，並在整個對話過程中參考這些資訊來協助我：

[貼入此檔案的完整內容]

請確認你已經理解了專案的背景、技術棧和重要決策。
\`\`\`

#### 對於 Claude 用戶
1. 使用檔案上傳功能上傳此 Markdown 檔案
2. 在對話中說明：「請參考上傳的專案記憶檔案來理解我的專案背景和上下文」

#### 對於 Kiro 用戶
1. 此檔案已透過 steering 機制自動載入
2. 無需額外操作，AI 助手已具備專案上下文

#### 對於其他 AI 平台
1. 根據平台特性選擇適合的載入方式
2. 可以分段載入重要區段
3. 或將關鍵資訊整理成簡化版本

### 記憶更新建議
當專案有重要變更時，請更新對應的記憶區段：
- **新的技術決策**: 添加到「重要決策記錄」
- **學到新知識**: 添加到「學習筆記」
- **配置變更**: 更新「技術配置」區段
- **問題解決**: 添加到「常見問題和解決方案」

---

*此記憶檔案最後更新: 2025-01-18*
*版本: 1.0*
*適用於任何支援 Markdown 的 AI 模型*### [2
025-01-18] 改進為通用 AI 記憶系統
**背景**: 原本的記憶系統只針對 Kiro 設計，需要改進為通用的 AI 平台解決方案
**選項**:
- 保持 Kiro 專用設計: 功能完整但適用性有限
- 建立通用系統但保留 Kiro 整合: 平衡通用性和現有功能
- 完全重新設計為平台無關系統: 通用性最佳但可能失去特定功能
**決定**: 建立通用系統但保留 Kiro 整合
**理由**:
- 提供更廣泛的適用性，支援 ChatGPT、Claude 等主流 AI 平台
- 使用標準 Markdown 格式確保跨平台相容性
- 保留 Kiro 的 steering 整合以維持現有自動載入功能
- 提供多種載入方式適應不同 AI 平台的特性和限制
- 建立標準化模板和工具，提升使用體驗
**影響**:
- 記憶系統現在適用於任何支援 Markdown 的 AI 模型
- 提供了完整的使用指南和不同平台的整合範例
- 建立了通用的管理工具和標準化模板
- 實現了真正的平台無關知識管理解決方案
- 為團隊協作和知識傳承提供了更好的基礎
**標籤**: #ai #universal #cross-platform #knowledge-management
###
 [2025-01-18] 添加 Gemini 自動載入支援
**背景**: 通用 AI 記憶系統需要支援 Google Gemini，實現真正的跨平台自動載入
**選項**:
- 僅提供手動載入方式: 簡單但用戶體驗不佳
- 提供檔案上傳支援: 方便但仍需手動操作
- 建立完整的自動載入解決方案: 複雜但用戶體驗最佳
**決定**: 建立完整的自動載入解決方案
**理由**:
- Gemini 支援檔案上傳和 API 整合，可以實現真正的自動載入
- 提供多種載入方式適應不同使用場景和偏好
- 建立標準化工具和腳本，簡化設定過程
- 生成專用的 Gemini 記憶檔案，優化載入體驗
- 支援 API 自動載入，實現程式化整合
**影響**:
- 記憶系統現在完全支援 ChatGPT、Claude、Gemini、Kiro 四大主流 AI 平台
- 提供了一鍵設定工具 (\`npm run gemini:setup\`)
- 建立了 API 自動載入腳本和相關工具
- 實現了真正的「無需任何操作」自動載入體驗
- 為未來支援更多 AI 平台建立了標準化流程
**標籤**: #gemini #auto-load #cross-platform #api-integration`;
  }

  // 建立包含記憶的模型
  createModelWithMemory(modelName = "gemini-pro") {
    return this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: {
        parts: [
          {
            text: `你是一個專業的開發助手。以下是「懶得變有錢」專案的完整記憶，請在所有回答中參考這些資訊：

${this.memoryContent}

請確保你理解了專案的技術棧、重要決策和最佳實踐，並在協助開發時參考這些背景資訊。`,
          },
        ],
      },
    });
  }

  // 建立包含記憶的對話
  async createChatWithMemory(modelName = "gemini-pro") {
    const model = this.createModelWithMemory(modelName);
    return model.startChat();
  }

  // 驗證記憶載入
  async validateMemoryLoading(modelName = "gemini-pro") {
    const chat = await this.createChatWithMemory(modelName);

    const result = await chat.sendMessage(
      "請簡要總結我的專案技術棧和最近的重要決策，以確認你已正確載入記憶。",
    );

    return result.response.text();
  }

  // 更新記憶內容
  updateMemory(newMemoryContent) {
    this.memoryContent = newMemoryContent;
  }
}

// 使用範例
async function example() {
  // 從環境變數獲取 API Key
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("請設定 GEMINI_API_KEY 環境變數");
    console.log('export GEMINI_API_KEY="your-api-key-here"');
    return;
  }

  try {
    const loader = new GeminiMemoryLoader(apiKey);

    // 驗證記憶載入
    console.log("🧠 驗證記憶載入...");
    const validation = await loader.validateMemoryLoading();
    console.log("驗證結果:", validation);

    // 建立對話
    const chat = await loader.createChatWithMemory();

    // 範例對話
    const result = await chat.sendMessage(
      "我的 Hugo 網站建置時間很長，有什麼優化建議？",
    );
    console.log("\n回答:", result.response.text());
  } catch (error) {
    console.error("錯誤:", error.message);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  example();
}

module.exports = GeminiMemoryLoader;
