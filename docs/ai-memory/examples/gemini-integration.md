# Gemini 整合範例

## 概述

這個範例展示如何在 Google Gemini 中使用通用 AI 外部記憶系統，實現自動載入和無縫整合。

## 自動載入方法

### 方法 1: 使用 Gemini 的檔案上傳功能

Gemini 支援直接上傳檔案，這是最簡單的自動載入方式：

1. **上傳記憶檔案**

   - 在 Gemini 介面中點擊檔案上傳按鈕
   - 選擇 `docs/ai-memory/project-memory.md`
   - 檔案會自動載入到對話上下文中

2. **確認載入**
   ```
   請確認你已經讀取了我上傳的專案記憶檔案，並總結一下專案的基本資訊。
   ```

### 方法 2: 使用 Gemini API 自動載入

對於程式化整合，可以使用 Gemini API：

```javascript
// gemini-memory-loader.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function loadProjectMemoryToGemini() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // 讀取記憶檔案
  const memoryContent = fs.readFileSync(
    "docs/ai-memory/project-memory.md",
    "utf8",
  );

  // 建立包含記憶的對話
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            text: `請載入以下專案記憶，並在整個對話中參考這些資訊：\n\n${memoryContent}`,
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "我已經載入並理解了你的專案記憶。我現在了解這是一個名為「懶得變有錢」的 Hugo 部落格專案，使用 TailwindCSS 和 Hugoplate 主題。我會在後續對話中參考這些背景資訊來協助你。",
          },
        ],
      },
    ],
  });

  return chat;
}

// 使用範例
async function main() {
  const chat = await loadProjectMemoryToGemini();

  const result = await chat.sendMessage("請幫我檢查 Hugo 配置是否有問題");
  console.log(result.response.text());
}
```

### 方法 3: 使用 Gemini 的系統指令 (System Instructions)

Gemini 支援系統指令，可以在對話開始時自動載入背景資訊：

```javascript
const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  systemInstruction: {
    parts: [
      {
        text: fs.readFileSync("docs/ai-memory/project-memory.md", "utf8"),
      },
    ],
  },
});
```

## 整合腳本

讓我創建一個自動化腳本來簡化 Gemini 整合：

```javascript
#!/usr/bin/env node
/**
 * Gemini 記憶自動載入工具
 */

const fs = require("fs");
const path = require("path");

class GeminiMemoryLoader {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.memoryFile = "docs/ai-memory/project-memory.md";
  }

  // 生成 Gemini 載入腳本
  generateLoadScript() {
    const memoryContent = fs.readFileSync(this.memoryFile, "utf8");

    const script = `
// Gemini 記憶自動載入腳本
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('${this.apiKey}');
const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  systemInstruction: {
    parts: [{
      text: \`${memoryContent.replace(/`/g, "\\`")}\`
    }]
  }
});

// 現在 model 已經載入了專案記憶
// 可以直接開始對話
const chat = model.startChat();
`;

    return script;
  }

  // 生成上傳用的記憶摘要
  generateUploadSummary() {
    const memoryContent = fs.readFileSync(this.memoryFile, "utf8");

    // 提取關鍵資訊
    const summary = `
# 專案記憶摘要 (Gemini 上傳版)

> 這是「懶得變有錢」專案的記憶摘要，請在整個對話中參考這些資訊。

## 快速參考
- **專案**: 懶得變有錢 Hugo 部落格
- **技術棧**: Hugo + TailwindCSS + Hugoplate
- **語言**: 繁體中文
- **部署**: GitHub Pages

## 完整記憶內容
${memoryContent}

---
*請確認你已經理解了專案背景，並在後續回答中參考這些資訊。*
`;

    return summary;
  }
}

module.exports = GeminiMemoryLoader;
```

## 使用範例

### 範例 1: 檔案上傳方式

**步驟**:

1. 開啟 Gemini 介面
2. 點擊檔案上傳按鈕
3. 選擇 `docs/ai-memory/project-memory.md`
4. 等待檔案處理完成
5. 開始對話

**用戶**:

```
你好！我剛上傳了我的專案記憶檔案。請確認你已經理解了專案背景，並簡要總結一下。
```

**Gemini**:

```
你好！我已經讀取了你的專案記憶檔案。這是一個名為「懶得變有錢」的財務規劃教育部落格專案，主要特點如下：

**專案概述**:
- 使用 Hugo 靜態網站生成器 + TailwindCSS + Hugoplate 主題
- 目標是提供財務規劃教育內容
- 使用繁體中文，部署在 GitHub Pages

**技術決策**:
- 選擇了 Hugoplate 主題以加速開發
- 建立了通用 AI 外部記憶系統
- 採用 TailwindCSS 作為 CSS 框架

**當前配置**:
- Google Analytics 追蹤 (G-03PSTN4ES1)
- 支援 CJK 語言
- 使用 monokai 語法高亮

我已經準備好基於這些背景資訊來協助你的開發工作。有什麼需要幫助的嗎？
```

### 範例 2: API 整合方式

```javascript
// 使用 Gemini API 的完整範例
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function createGeminiWithMemory() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // 載入記憶內容
  const memoryContent = fs.readFileSync(
    "docs/ai-memory/project-memory.md",
    "utf8",
  );

  // 建立包含記憶的模型
  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
    systemInstruction: {
      parts: [
        {
          text: `你是一個專業的開發助手。以下是專案的完整記憶，請在所有回答中參考這些資訊：\n\n${memoryContent}`,
        },
      ],
    },
  });

  return model;
}

// 使用範例
async function main() {
  const model = await createGeminiWithMemory();
  const chat = model.startChat();

  const result = await chat.sendMessage(
    "我的 TailwindCSS 樣式沒有生效，可能是什麼問題？",
  );
  console.log(result.response.text());
}

main().catch(console.error);
```

## 自動化工具

### Gemini 記憶載入器腳本

```bash
#!/bin/bash
# gemini-memory-setup.sh

echo "🧠 設定 Gemini 記憶自動載入..."

# 檢查記憶檔案
if [ ! -f "docs/ai-memory/project-memory.md" ]; then
    echo "❌ 記憶檔案不存在"
    exit 1
fi

# 生成 Gemini 專用的記憶檔案
echo "📝 生成 Gemini 專用記憶檔案..."
cat > docs/ai-memory/gemini-memory.md << 'EOF'
# Gemini 專案記憶載入

> 請在整個對話過程中參考以下專案記憶資訊

EOF

cat docs/ai-memory/project-memory.md >> docs/ai-memory/gemini-memory.md

echo "✅ Gemini 記憶檔案已生成: docs/ai-memory/gemini-memory.md"
echo "📤 請將此檔案上傳到 Gemini 介面"
```

## 最佳實踐

### 1. 檔案上傳優化

- 使用專門的 Gemini 記憶檔案，包含載入提示
- 檔案大小控制在合理範圍內
- 定期更新上傳的記憶檔案

### 2. API 整合優化

- 使用系統指令確保記憶持續有效
- 實作記憶內容的增量更新
- 處理 API 限制和錯誤情況

### 3. 對話管理

- 在對話開始時確認記憶載入狀態
- 定期提醒 Gemini 參考記憶內容
- 重要決策後更新記憶檔案

## 進階功能

### 動態記憶更新

```javascript
class GeminiMemoryManager {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.memoryFile = "docs/ai-memory/project-memory.md";
  }

  async updateMemory(newContent) {
    // 更新記憶檔案
    fs.appendFileSync(this.memoryFile, `\n${newContent}`);

    // 重新載入到 Gemini
    return this.reloadMemory();
  }

  async reloadMemory() {
    const memoryContent = fs.readFileSync(this.memoryFile, "utf8");

    return this.genAI.getGenerativeModel({
      model: "gemini-pro",
      systemInstruction: {
        parts: [{ text: memoryContent }],
      },
    });
  }
}
```

### 記憶驗證

```javascript
async function validateGeminiMemory(model) {
  const chat = model.startChat();

  const result = await chat.sendMessage(
    "請簡要總結我的專案技術棧和最近的重要決策，以確認你已正確載入記憶。",
  );

  console.log("記憶驗證結果:", result.response.text());
}
```

## 注意事項

1. **API 限制**: 注意 Gemini API 的使用限制和配額
2. **檔案大小**: 上傳檔案有大小限制，必要時分割記憶內容
3. **記憶持續性**: 系統指令在整個對話中保持有效
4. **更新頻率**: 定期更新記憶內容以保持資訊新鮮
5. **隱私考量**: 避免在記憶中包含敏感資訊

## 故障排除

### 常見問題

**Q: Gemini 沒有正確理解記憶內容？**
A: 檢查檔案格式，確保 Markdown 語法正確，考慮簡化複雜結構。

**Q: 記憶檔案太大無法上傳？**
A: 分割記憶內容，或創建摘要版本用於上傳。

**Q: API 整合時記憶丟失？**
A: 確保使用系統指令而非普通對話載入記憶。

**Q: 記憶內容過時？**
A: 建立定期更新機制，或使用動態記憶管理工具。
