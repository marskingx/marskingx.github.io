#!/usr/bin/env node

/**
 * 通用 AI 外部記憶管理工具
 * 支援跨平台的記憶檔案管理和維護
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// 配置
const CONFIG = {
  MEMORY_DIR: "docs/ai-memory",
  MEMORY_FILE: "docs/ai-memory/project-memory.md",
  BACKUP_DIR: "docs/ai-memory/backups",
  TEMPLATES_DIR: "docs/ai-memory/templates",
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 工具函數
function getCurrentDate() {
  return new Date().toISOString().split("T")[0];
}

function getCurrentDateTime() {
  return new Date().toISOString().replace("T", " ").split(".")[0];
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createBackup() {
  ensureDirectoryExists(CONFIG.BACKUP_DIR);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(
    CONFIG.BACKUP_DIR,
    `project-memory-${timestamp}.md`,
  );

  if (fs.existsSync(CONFIG.MEMORY_FILE)) {
    fs.copyFileSync(CONFIG.MEMORY_FILE, backupPath);
    console.log(`✅ 備份已建立: ${backupPath}`);
    return backupPath;
  } else {
    console.log("❌ 記憶檔案不存在，無法建立備份");
    return null;
  }
}

// 主要功能
function addDecisionRecord() {
  console.log("\n=== 添加決策記錄 ===");

  const questions = [
    "決策標題: ",
    "背景描述: ",
    "考慮的選項 (用分號分隔): ",
    "最終決定: ",
    "選擇理由: ",
    "預期影響: ",
    "相關標籤 (用空格分隔，不含#): ",
  ];

  const answers = [];
  let currentQuestion = 0;

  function askQuestion() {
    if (currentQuestion < questions.length) {
      rl.question(questions[currentQuestion], (answer) => {
        answers.push(answer.trim());
        currentQuestion++;
        askQuestion();
      });
    } else {
      const [title, background, options, decision, rationale, impact, tags] =
        answers;

      // 處理選項列表
      const optionsList = options
        .split(";")
        .map((opt) => `- ${opt.trim()}`)
        .join("\n");

      // 處理標籤
      const tagsList = tags
        ? tags
            .split(" ")
            .map((tag) => `#${tag.trim()}`)
            .join(" ")
        : "";

      const record = `
### [${getCurrentDate()}] ${title}
**背景**: ${background}
**選項**: 
${optionsList}
**決定**: ${decision}
**理由**: ${rationale}
**影響**: ${impact}${tagsList ? `\n**標籤**: ${tagsList}` : ""}
`;

      appendToMemoryFile(record, "## 重要決策記錄");
      console.log("\n✅ 決策記錄已添加到記憶檔案");
      showMainMenu();
    }
  }

  askQuestion();
}

function addLearningNote() {
  console.log("\n=== 添加學習筆記 ===");

  const questions = [
    "學習主題: ",
    "遇到的問題: ",
    "解決方案: ",
    "程式碼範例 (可選，按 Enter 跳過): ",
    "參考資料 (可選，用分號分隔): ",
    "標籤 (用空格分隔，不含#): ",
  ];

  const answers = [];
  let currentQuestion = 0;

  function askQuestion() {
    if (currentQuestion < questions.length) {
      rl.question(questions[currentQuestion], (answer) => {
        answers.push(answer.trim());
        currentQuestion++;
        askQuestion();
      });
    } else {
      const [topic, problem, solution, code, references, tags] = answers;

      let note = `
### ${topic}
**問題**: ${problem}
**解決方案**: ${solution}`;

      if (code) {
        note += `
**程式碼範例**:
\`\`\`
${code}
\`\`\``;
      }

      if (references) {
        const refList = references
          .split(";")
          .map((ref) => `- ${ref.trim()}`)
          .join("\n");
        note += `
**參考資料**: 
${refList}`;
      }

      if (tags) {
        const tagsList = tags
          .split(" ")
          .map((tag) => `#${tag.trim()}`)
          .join(" ");
        note += `
**標籤**: ${tagsList}`;
      }

      appendToMemoryFile(note, "## 學習筆記");
      console.log("\n✅ 學習筆記已添加到記憶檔案");
      showMainMenu();
    }
  }

  askQuestion();
}

function addConfigurationRecord() {
  console.log("\n=== 添加配置記錄 ===");

  const questions = [
    "組件/系統名稱: ",
    "配置項目: ",
    "設定值: ",
    "配置原因: ",
    "對系統的影響: ",
  ];

  const answers = [];
  let currentQuestion = 0;

  function askQuestion() {
    if (currentQuestion < questions.length) {
      rl.question(questions[currentQuestion], (answer) => {
        answers.push(answer.trim());
        currentQuestion++;
        askQuestion();
      });
    } else {
      const [component, setting, value, reason, impact] = answers;

      const record = `
### ${component} 配置
- **設定項目**: ${setting}
- **設定值**: ${value}
- **原因**: ${reason}
- **影響**: ${impact}
- **最後修改**: ${getCurrentDate()}
`;

      appendToMemoryFile(record, "## 技術配置");
      console.log("\n✅ 配置記錄已添加到記憶檔案");
      showMainMenu();
    }
  }

  askQuestion();
}

function appendToMemoryFile(content, section) {
  try {
    if (!fs.existsSync(CONFIG.MEMORY_FILE)) {
      console.error(`❌ 記憶檔案不存在: ${CONFIG.MEMORY_FILE}`);
      return false;
    }

    let memoryContent = fs.readFileSync(CONFIG.MEMORY_FILE, "utf8");

    // 找到指定區段的位置
    const sectionIndex = memoryContent.indexOf(section);
    if (sectionIndex === -1) {
      console.error(`❌ 找不到區段: ${section}`);
      return false;
    }

    // 找到下一個 ## 區段的位置
    const nextSectionIndex = memoryContent.indexOf(
      "\n## ",
      sectionIndex + section.length,
    );
    const insertPosition =
      nextSectionIndex === -1 ? memoryContent.length : nextSectionIndex;

    // 插入新內容
    const newContent =
      memoryContent.slice(0, insertPosition) +
      content +
      "\n" +
      memoryContent.slice(insertPosition);

    // 建立備份
    createBackup();

    // 寫入更新的內容
    fs.writeFileSync(CONFIG.MEMORY_FILE, newContent, "utf8");
    return true;
  } catch (error) {
    console.error("❌ 更新記憶檔案時發生錯誤:", error.message);
    return false;
  }
}

function validateMemoryFile() {
  console.log("\n=== 驗證記憶檔案 ===");

  if (!fs.existsSync(CONFIG.MEMORY_FILE)) {
    console.log("❌ 記憶檔案不存在");
    return false;
  }

  const content = fs.readFileSync(CONFIG.MEMORY_FILE, "utf8");

  // 檢查必要區段
  const requiredSections = [
    "## 專案概述",
    "## 重要決策記錄",
    "## 技術配置",
    "## 學習筆記",
    "## 最佳實踐",
    "## 常見問題和解決方案",
    "## 待辦事項和想法",
    "## 重要連結和資源",
  ];

  let allSectionsFound = true;
  console.log("\n檢查必要區段:");

  requiredSections.forEach((section) => {
    if (content.includes(section)) {
      console.log(`✅ ${section}`);
    } else {
      console.log(`❌ ${section} - 缺失`);
      allSectionsFound = false;
    }
  });

  // 檢查檔案大小
  const stats = fs.statSync(CONFIG.MEMORY_FILE);
  const fileSizeKB = Math.round(stats.size / 1024);
  console.log(`\n檔案大小: ${fileSizeKB} KB`);

  if (fileSizeKB > 100) {
    console.log("⚠️  記憶檔案較大，考慮分割或歸檔舊內容");
  }

  // 檢查最後修改時間
  const lastModified = stats.mtime.toISOString().split("T")[0];
  console.log(`最後修改: ${lastModified}`);

  if (allSectionsFound) {
    console.log("\n✅ 記憶檔案驗證通過");
  } else {
    console.log("\n❌ 記憶檔案驗證失敗，請檢查缺失的區段");
  }

  return allSectionsFound;
}

function searchMemory() {
  console.log("\n=== 搜尋記憶內容 ===");

  rl.question("請輸入搜尋關鍵字: ", (keyword) => {
    if (!keyword.trim()) {
      console.log("❌ 請輸入有效的關鍵字");
      showMainMenu();
      return;
    }

    if (!fs.existsSync(CONFIG.MEMORY_FILE)) {
      console.log("❌ 記憶檔案不存在");
      showMainMenu();
      return;
    }

    const content = fs.readFileSync(CONFIG.MEMORY_FILE, "utf8");
    const lines = content.split("\n");
    const results = [];

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(keyword.toLowerCase())) {
        results.push({
          lineNumber: index + 1,
          content: line.trim(),
        });
      }
    });

    if (results.length === 0) {
      console.log(`❌ 沒有找到包含 "${keyword}" 的內容`);
    } else {
      console.log(`\n✅ 找到 ${results.length} 個結果:`);
      results.forEach((result) => {
        console.log(`第 ${result.lineNumber} 行: ${result.content}`);
      });
    }

    showMainMenu();
  });
}

function showStatistics() {
  console.log("\n=== 記憶檔案統計 ===");

  if (!fs.existsSync(CONFIG.MEMORY_FILE)) {
    console.log("❌ 記憶檔案不存在");
    return;
  }

  const content = fs.readFileSync(CONFIG.MEMORY_FILE, "utf8");
  const lines = content.split("\n");

  // 統計各種內容
  const stats = {
    totalLines: lines.length,
    decisions: (content.match(/### \[\d{4}-\d{2}-\d{2}\]/g) || []).length,
    learningNotes: (content.match(/### \[.*?\] /g) || []).length,
    codeBlocks: (content.match(/```/g) || []).length / 2,
    links: (content.match(/\[.*?\]\(.*?\)/g) || []).length,
    tags: (content.match(/#\w+/g) || []).length,
  };

  console.log(`總行數: ${stats.totalLines}`);
  console.log(`決策記錄: ${stats.decisions} 個`);
  console.log(`學習筆記: ${stats.learningNotes} 個`);
  console.log(`程式碼區塊: ${stats.codeBlocks} 個`);
  console.log(`外部連結: ${stats.links} 個`);
  console.log(`標籤: ${stats.tags} 個`);

  // 檔案大小
  const stats_file = fs.statSync(CONFIG.MEMORY_FILE);
  const fileSizeKB = Math.round(stats_file.size / 1024);
  console.log(`檔案大小: ${fileSizeKB} KB`);

  // 最後修改時間
  const lastModified = stats_file.mtime
    .toISOString()
    .replace("T", " ")
    .split(".")[0];
  console.log(`最後修改: ${lastModified}`);
}

function exportMemoryForAI() {
  console.log("\n=== 匯出 AI 載入格式 ===");

  const platforms = [
    "1. ChatGPT 格式",
    "2. Claude 格式",
    "3. 通用格式",
    "4. 摘要格式",
  ];

  console.log("請選擇匯出格式:");
  platforms.forEach((platform) => console.log(platform));

  rl.question("\n請選擇 (1-4): ", (choice) => {
    if (!fs.existsSync(CONFIG.MEMORY_FILE)) {
      console.log("❌ 記憶檔案不存在");
      showMainMenu();
      return;
    }

    const content = fs.readFileSync(CONFIG.MEMORY_FILE, "utf8");
    const outputDir = path.join(CONFIG.MEMORY_DIR, "exports");
    ensureDirectoryExists(outputDir);

    let exportContent = "";
    let filename = "";

    switch (choice) {
      case "1":
        exportContent = `請載入以下專案記憶，並在整個對話過程中參考這些資訊：

===== 專案記憶開始 =====
${content}
===== 專案記憶結束 =====

請確認你已經理解了專案的背景、技術棧和重要決策。`;
        filename = "chatgpt-memory.txt";
        break;

      case "2":
        exportContent = `# 專案記憶檔案

請參考以下專案記憶來理解我的專案背景和上下文：

${content}`;
        filename = "claude-memory.md";
        break;

      case "3":
        exportContent = content;
        filename = "universal-memory.md";
        break;

      case "4":
        // 建立摘要版本
        const lines = content.split("\n");
        const summary = [];
        let inSection = false;
        let currentSection = "";

        lines.forEach((line) => {
          if (line.startsWith("## ")) {
            currentSection = line;
            summary.push(line);
            inSection = true;
          } else if (line.startsWith("### ") && inSection) {
            summary.push(line);
          } else if (line.startsWith("- **") && inSection) {
            summary.push(line);
          }
        });

        exportContent = summary.join("\n");
        filename = "memory-summary.md";
        break;

      default:
        console.log("❌ 無效選擇");
        showMainMenu();
        return;
    }

    const outputPath = path.join(outputDir, filename);
    fs.writeFileSync(outputPath, exportContent, "utf8");
    console.log(`✅ 已匯出到: ${outputPath}`);

    showMainMenu();
  });
}

function showMainMenu() {
  console.log("\n=== 通用 AI 外部記憶管理工具 ===");
  console.log("1. 添加決策記錄");
  console.log("2. 添加學習筆記");
  console.log("3. 添加配置記錄");
  console.log("4. 搜尋記憶內容");
  console.log("5. 驗證記憶檔案");
  console.log("6. 顯示統計資訊");
  console.log("7. 匯出 AI 載入格式");
  console.log("8. 建立備份");
  console.log("9. 退出");

  rl.question("\n請選擇操作 (1-9): ", (choice) => {
    switch (choice) {
      case "1":
        addDecisionRecord();
        break;
      case "2":
        addLearningNote();
        break;
      case "3":
        addConfigurationRecord();
        break;
      case "4":
        searchMemory();
        break;
      case "5":
        validateMemoryFile();
        showMainMenu();
        break;
      case "6":
        showStatistics();
        showMainMenu();
        break;
      case "7":
        exportMemoryForAI();
        break;
      case "8":
        createBackup();
        showMainMenu();
        break;
      case "9":
        console.log("👋 再見！");
        rl.close();
        break;
      default:
        console.log("❌ 無效選擇，請重新選擇");
        showMainMenu();
    }
  });
}

// 初始化檢查
function initialize() {
  console.log("🧠 通用 AI 外部記憶管理工具");
  console.log("=====================================");

  // 檢查記憶目錄
  if (!fs.existsSync(CONFIG.MEMORY_DIR)) {
    console.log(`❌ 記憶目錄不存在: ${CONFIG.MEMORY_DIR}`);
    console.log("請確保在正確的專案目錄中執行此工具");
    process.exit(1);
  }

  // 檢查記憶檔案
  if (!fs.existsSync(CONFIG.MEMORY_FILE)) {
    console.log(`⚠️  記憶檔案不存在: ${CONFIG.MEMORY_FILE}`);
    console.log("某些功能可能無法正常使用");
  }

  showMainMenu();
}

// 啟動工具
initialize();
