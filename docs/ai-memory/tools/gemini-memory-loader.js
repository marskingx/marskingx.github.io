#!/usr/bin/env node

/**
 * Gemini 記憶自動載入工具
 * 提供多種方式將專案記憶載入到 Google Gemini
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// 配置
const CONFIG = {
  MEMORY_FILE: "docs/ai-memory/project-memory.md",
  GEMINI_MEMORY_FILE: "docs/ai-memory/gemini-memory.md",
  GEMINI_SCRIPT_FILE: "docs/ai-memory/tools/gemini-auto-loader.js",
  EXPORTS_DIR: "docs/ai-memory/exports",
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateGeminiMemoryFile() {
  console.log("\n=== 生成 Gemini 專用記憶檔案 ===");

  if (!fs.existsSync(CONFIG.MEMORY_FILE)) {
    console.log("❌ 原始記憶檔案不存在");
    return false;
  }

  const memoryContent = fs.readFileSync(CONFIG.MEMORY_FILE, "utf8");

  const geminiMemory = `# Gemini 專案記憶載入

> 🧠 這是「懶得變有錢」專案的完整記憶檔案，請在整個對話過程中參考這些資訊來協助開發工作。

## 📋 載入確認
請在讀取完此檔案後回覆：「我已經載入並理解了你的專案記憶，現在了解這是一個使用 Hugo + TailwindCSS 的財務教育部落格專案。」

## 🎯 使用指南
- 在回答問題時請參考專案的技術配置和歷史決策
- 遇到技術問題時請查閱學習筆記中的解決方案
- 提供建議時請考慮專案的最佳實踐和慣例

---

${memoryContent}

---

## 🔄 記憶更新提醒
如果專案有重要變更，請提醒我更新這個記憶檔案，以確保資訊的準確性和時效性。`;

  fs.writeFileSync(CONFIG.GEMINI_MEMORY_FILE, geminiMemory, "utf8");
  console.log(`✅ Gemini 記憶檔案已生成: ${CONFIG.GEMINI_MEMORY_FILE}`);
  console.log("📤 請將此檔案上傳到 Gemini 介面");

  return true;
}

function generateGeminiAPIScript() {
  console.log("\n=== 生成 Gemini API 自動載入腳本 ===");

  if (!fs.existsSync(CONFIG.MEMORY_FILE)) {
    console.log("❌ 原始記憶檔案不存在");
    return false;
  }

  const memoryContent = fs.readFileSync(CONFIG.MEMORY_FILE, "utf8");

  const apiScript = `#!/usr/bin/env node

/**
 * Gemini API 記憶自動載入腳本
 * 使用 Google Gemini API 自動載入專案記憶
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

class GeminiMemoryLoader {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('請提供 Gemini API Key');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.memoryContent = \`${memoryContent.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`;
  }
  
  // 建立包含記憶的模型
  createModelWithMemory(modelName = 'gemini-pro') {
    return this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: {
        parts: [{
          text: \`你是一個專業的開發助手。以下是「懶得變有錢」專案的完整記憶，請在所有回答中參考這些資訊：

\${this.memoryContent}

請確保你理解了專案的技術棧、重要決策和最佳實踐，並在協助開發時參考這些背景資訊。\`
        }]
      }
    });
  }
  
  // 建立包含記憶的對話
  async createChatWithMemory(modelName = 'gemini-pro') {
    const model = this.createModelWithMemory(modelName);
    return model.startChat();
  }
  
  // 驗證記憶載入
  async validateMemoryLoading(modelName = 'gemini-pro') {
    const chat = await this.createChatWithMemory(modelName);
    
    const result = await chat.sendMessage(
      "請簡要總結我的專案技術棧和最近的重要決策，以確認你已正確載入記憶。"
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
    console.log('請設定 GEMINI_API_KEY 環境變數');
    console.log('export GEMINI_API_KEY="your-api-key-here"');
    return;
  }
  
  try {
    const loader = new GeminiMemoryLoader(apiKey);
    
    // 驗證記憶載入
    console.log('🧠 驗證記憶載入...');
    const validation = await loader.validateMemoryLoading();
    console.log('驗證結果:', validation);
    
    // 建立對話
    const chat = await loader.createChatWithMemory();
    
    // 範例對話
    const result = await chat.sendMessage("我的 Hugo 網站建置時間很長，有什麼優化建議？");
    console.log('\\n回答:', result.response.text());
    
  } catch (error) {
    console.error('錯誤:', error.message);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  example();
}

module.exports = GeminiMemoryLoader;`;

  fs.writeFileSync(CONFIG.GEMINI_SCRIPT_FILE, apiScript, "utf8");
  console.log(`✅ Gemini API 腳本已生成: ${CONFIG.GEMINI_SCRIPT_FILE}`);
  console.log("💡 使用方法:");
  console.log("   1. 安裝依賴: npm install @google/generative-ai");
  console.log('   2. 設定 API Key: export GEMINI_API_KEY="your-key"');
  console.log(
    "   3. 執行腳本: node docs/ai-memory/tools/gemini-auto-loader.js",
  );

  return true;
}

function generateGeminiPrompts() {
  console.log("\n=== 生成 Gemini 載入提示詞 ===");

  ensureDirectoryExists(CONFIG.EXPORTS_DIR);

  if (!fs.existsSync(CONFIG.MEMORY_FILE)) {
    console.log("❌ 原始記憶檔案不存在");
    return false;
  }

  const memoryContent = fs.readFileSync(CONFIG.MEMORY_FILE, "utf8");

  // 完整載入提示
  const fullPrompt = `🧠 專案記憶載入 - Gemini 版

請載入以下專案記憶，並在整個對話過程中參考這些資訊：

===== 專案記憶開始 =====
${memoryContent}
===== 專案記憶結束 =====

載入完成後，請回覆確認你已經理解了：
1. 專案名稱和目標
2. 技術棧配置
3. 重要決策記錄
4. 學習筆記和最佳實踐

然後我們就可以開始協作開發了！`;

  // 摘要載入提示
  const summaryPrompt = `🧠 專案記憶摘要 - Gemini 版

我正在開發「懶得變有錢」Hugo 部落格專案，以下是關鍵背景資訊：

**專案概述**:
- 名稱：懶得變有錢 (財務規劃教育部落格)
- 技術棧：Hugo + TailwindCSS + Hugoplate Theme
- 語言：繁體中文
- 部署：GitHub Pages

**重要決策**:
- 選擇 Hugoplate 主題加速開發
- 建立通用 AI 外部記憶系統
- 使用 TailwindCSS 作為 CSS 框架

**當前配置**:
- Google Analytics: G-03PSTN4ES1
- 支援 CJK 語言處理
- 使用 monokai 語法高亮

請在協助我開發時參考這些背景資訊。如需完整的專案記憶，我可以上傳詳細的記憶檔案。`;

  // 儲存提示詞
  fs.writeFileSync(
    path.join(CONFIG.EXPORTS_DIR, "gemini-full-prompt.txt"),
    fullPrompt,
    "utf8",
  );
  fs.writeFileSync(
    path.join(CONFIG.EXPORTS_DIR, "gemini-summary-prompt.txt"),
    summaryPrompt,
    "utf8",
  );

  console.log("✅ Gemini 提示詞已生成:");
  console.log(`   - 完整版: ${CONFIG.EXPORTS_DIR}/gemini-full-prompt.txt`);
  console.log(`   - 摘要版: ${CONFIG.EXPORTS_DIR}/gemini-summary-prompt.txt`);

  return true;
}

function generateGeminiSetupScript() {
  console.log("\n=== 生成 Gemini 設定腳本 ===");

  const setupScript = `#!/bin/bash

# Gemini 記憶自動載入設定腳本

echo "🧠 設定 Gemini 記憶自動載入..."

# 檢查記憶檔案
if [ ! -f "docs/ai-memory/project-memory.md" ]; then
    echo "❌ 記憶檔案不存在: docs/ai-memory/project-memory.md"
    exit 1
fi

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 需要安裝 Node.js"
    exit 1
fi

# 安裝 Gemini API 依賴 (如果需要)
echo "📦 檢查 Gemini API 依賴..."
if [ ! -d "node_modules/@google/generative-ai" ]; then
    echo "安裝 @google/generative-ai..."
    npm install @google/generative-ai
fi

# 生成 Gemini 專用檔案
echo "📝 生成 Gemini 專用記憶檔案..."
node -e "
const fs = require('fs');
const memoryContent = fs.readFileSync('docs/ai-memory/project-memory.md', 'utf8');
const geminiMemory = \`# Gemini 專案記憶載入

> 🧠 請在整個對話過程中參考以下專案記憶資訊

## 載入確認
請讀取完此檔案後回覆確認你已理解專案背景。

---

\${memoryContent}

---

## 使用提醒
- 回答問題時請參考專案配置和歷史決策
- 遇到問題時請查閱學習筆記中的解決方案
- 提供建議時請考慮專案的最佳實踐
\`;
fs.writeFileSync('docs/ai-memory/gemini-memory.md', geminiMemory, 'utf8');
console.log('✅ Gemini 記憶檔案已生成');
"

# 檢查 API Key 設定
if [ -z "\$GEMINI_API_KEY" ]; then
    echo "⚠️  未設定 GEMINI_API_KEY 環境變數"
    echo "   如需使用 API 功能，請執行:"
    echo "   export GEMINI_API_KEY=\"your-api-key-here\""
else
    echo "✅ GEMINI_API_KEY 已設定"
fi

echo ""
echo "🎉 Gemini 記憶載入設定完成！"
echo ""
echo "📋 使用方法:"
echo "   1. 檔案上傳: 將 docs/ai-memory/gemini-memory.md 上傳到 Gemini"
echo "   2. API 使用: node docs/ai-memory/tools/gemini-auto-loader.js"
echo "   3. 提示詞: 使用 docs/ai-memory/exports/ 中的提示詞"
echo ""
`;

  fs.writeFileSync("docs/ai-memory/tools/setup-gemini.sh", setupScript, "utf8");

  // 設定執行權限 (在 Unix 系統上)
  try {
    fs.chmodSync("docs/ai-memory/tools/setup-gemini.sh", "755");
  } catch (error) {
    // Windows 系統可能不支援 chmod，忽略錯誤
  }

  console.log("✅ Gemini 設定腳本已生成: docs/ai-memory/tools/setup-gemini.sh");
  console.log("💡 執行方法: bash docs/ai-memory/tools/setup-gemini.sh");

  return true;
}

function showMainMenu() {
  console.log("\n=== Gemini 記憶自動載入工具 ===");
  console.log("1. 生成 Gemini 專用記憶檔案 (上傳用)");
  console.log("2. 生成 Gemini API 自動載入腳本");
  console.log("3. 生成 Gemini 載入提示詞");
  console.log("4. 生成 Gemini 設定腳本");
  console.log("5. 全部生成");
  console.log("6. 退出");

  rl.question("\n請選擇操作 (1-6): ", (choice) => {
    switch (choice) {
      case "1":
        generateGeminiMemoryFile();
        showMainMenu();
        break;
      case "2":
        generateGeminiAPIScript();
        showMainMenu();
        break;
      case "3":
        generateGeminiPrompts();
        showMainMenu();
        break;
      case "4":
        generateGeminiSetupScript();
        showMainMenu();
        break;
      case "5":
        console.log("\n=== 生成所有 Gemini 整合檔案 ===");
        generateGeminiMemoryFile();
        generateGeminiAPIScript();
        generateGeminiPrompts();
        generateGeminiSetupScript();
        console.log("\n🎉 所有 Gemini 整合檔案已生成完成！");
        showMainMenu();
        break;
      case "6":
        console.log("👋 再見！");
        rl.close();
        break;
      default:
        console.log("❌ 無效選擇，請重新選擇");
        showMainMenu();
    }
  });
}

// 初始化
function initialize() {
  console.log("🤖 Gemini 記憶自動載入工具");
  console.log("================================");

  // 檢查記憶檔案
  if (!fs.existsSync(CONFIG.MEMORY_FILE)) {
    console.log(`❌ 記憶檔案不存在: ${CONFIG.MEMORY_FILE}`);
    console.log("請確保在正確的專案目錄中執行此工具");
    process.exit(1);
  }

  // 確保輸出目錄存在
  ensureDirectoryExists(CONFIG.EXPORTS_DIR);
  ensureDirectoryExists(path.dirname(CONFIG.GEMINI_SCRIPT_FILE));

  showMainMenu();
}

// 啟動工具
initialize();
