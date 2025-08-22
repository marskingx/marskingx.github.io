#!/bin/bash

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
const geminiMemory = `# Gemini 專案記憶載入

> 🧠 請在整個對話過程中參考以下專案記憶資訊

## 載入確認
請讀取完此檔案後回覆確認你已理解專案背景。

---

${memoryContent}

---

## 使用提醒
- 回答問題時請參考專案配置和歷史決策
- 遇到問題時請查閱學習筆記中的解決方案
- 提供建議時請考慮專案的最佳實踐
`;
fs.writeFileSync('docs/ai-memory/gemini-memory.md', geminiMemory, 'utf8');
console.log('✅ Gemini 記憶檔案已生成');
"

# 檢查 API Key 設定
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  未設定 GEMINI_API_KEY 環境變數"
    echo "   如需使用 API 功能，請執行:"
    echo "   export GEMINI_API_KEY="your-api-key-here""
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
