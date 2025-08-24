#!/usr/bin/env node

/**
 * AI 記憶檔案同步工具
 * 管理 docs/aimemory/ 目錄下的記憶檔案同步
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class AIMemorySync {
  constructor() {
    this.projectRoot = process.cwd();
    this.memoryDir = path.join(this.projectRoot, "docs/aimemory");
    this.worktrees = [
      { name: "Claude", path: this.projectRoot, branch: "main" },
      {
        name: "Codex",
        path: "D:/marskingx-worktrees/codex-dev",
        branch: "codex-dev",
      },
      {
        name: "Gemini",
        path: "D:/marskingx-worktrees/gemini-dev",
        branch: "gemini-dev",
      },
    ];
  }

  async run(action = "status") {
    console.log("🧠 AI 記憶檔案同步工具\n");
    console.log("======================================\n");

    // capture extra args for optional logging, etc.
    this.args = process.argv.slice(3);

    switch (action) {
      case "status":
        await this.checkMemoryStatus();
        break;
      case "sync":
        await this.syncMemoryFiles();
        break;
      case "clean":
        await this.cleanOldFiles();
        break;
      case "structure":
        await this.showMemoryStructure();
        break;
      default:
        this.showUsage();
    }
  }

  async checkMemoryStatus() {
    console.log("📊 AI 記憶檔案狀態檢查\n");

    // 檢查主記憶目錄結構
    const memoryStructure = this.analyzeMemoryStructure();
    this.displayMemoryStructure(memoryStructure);

    // 檢查各 worktree 的記憶檔案同步狀態
    for (const worktree of this.worktrees) {
      await this.checkWorktreeMemory(worktree);
    }

    this.showSyncSuggestions();
  }

  analyzeMemoryStructure() {
    const structure = {
      shared: [],
      claude: [],
      gemini: [],
      codex: [],
      orphaned: [],
    };

    const memoryDirs = ["shared", "claude", "gemini", "codex"];

    for (const dir of memoryDirs) {
      const dirPath = path.join(this.memoryDir, dir);
      if (fs.existsSync(dirPath)) {
        const files = fs
          .readdirSync(dirPath)
          .filter((file) => file.endsWith(".md") || file.endsWith(".txt"));
        structure[dir] = files.map((file) => ({
          name: file,
          size: this.getFileSize(path.join(dirPath, file)),
          modified: this.getLastModified(path.join(dirPath, file)),
        }));
      }
    }

    // 檢查根目錄是否還有遺留的 AI 檔案
    const rootFiles = fs
      .readdirSync(this.projectRoot)
      .filter((file) => this.isAIMemoryFile(file));

    structure.orphaned = rootFiles.map((file) => ({
      name: file,
      location: "root",
      suggestion: this.suggestLocation(file),
    }));

    return structure;
  }

  displayMemoryStructure(structure) {
    console.log("📁 記憶檔案結構:\n");

    const categories = ["shared", "claude", "gemini", "codex"];

    for (const category of categories) {
      const files = structure[category];
      const icon = this.getCategoryIcon(category);

      console.log(`${icon} ${category.toUpperCase()}:`);

      if (files.length === 0) {
        console.log("   (空目錄)");
      } else {
        files.forEach((file) => {
          console.log(`   📄 ${file.name} (${file.size}, ${file.modified})`);
        });
      }
      console.log();
    }

    // 顯示遺留檔案
    if (structure.orphaned.length > 0) {
      console.log("⚠️  根目錄遺留的 AI 檔案:");
      structure.orphaned.forEach((file) => {
        console.log(`   📄 ${file.name} → 建議移動到: ${file.suggestion}`);
      });
      console.log();
    }
  }

  async checkWorktreeMemory(worktree) {
    console.log(`🌳 ${worktree.name} Worktree (${worktree.branch}):`);

    try {
      const memoryPath = path.join(worktree.path, "docs/aimemory");

      if (!fs.existsSync(memoryPath)) {
        console.log("   ❌ 記憶目錄不存在");
        return;
      }

      const sharedPath = path.join(memoryPath, "shared");
      if (fs.existsSync(sharedPath)) {
        const sharedFiles = fs.readdirSync(sharedPath).length;
        console.log(`   📋 共用記憶: ${sharedFiles} 個檔案`);
      }

      const personalPath = path.join(memoryPath, worktree.name.toLowerCase());
      if (fs.existsSync(personalPath)) {
        const personalFiles = fs.readdirSync(personalPath).length;
        console.log(`   👤 個人記憶: ${personalFiles} 個檔案`);
      }

      // 檢查同步狀態
      const lastSync = this.getLastSyncTime(worktree.path);
      console.log(`   🔄 最後同步: ${lastSync}`);
    } catch (error) {
      console.log(`   ❌ 檢查失敗: ${error.message}`);
    }

    console.log();
  }

  async syncMemoryFiles() {
    console.log("🔄 同步記憶檔案到所有 worktree\n");

    const sharedDir = path.join(this.memoryDir, "shared");

    if (!fs.existsSync(sharedDir)) {
      console.log("❌ 共用記憶目錄不存在");
      return;
    }

    const timestamp = new Date().toISOString();
    // ensure main memory dir exists
    try {
      fs.mkdirSync(this.memoryDir, { recursive: true });
      fs.writeFileSync(path.join(this.memoryDir, ".last-sync"), timestamp + "\n", "utf8");
    } catch {}

    for (const worktree of this.worktrees) {
      if (worktree.name === "Claude") {
        continue;
      } // 主目錄跳過

      console.log(`📋 同步到 ${worktree.name} worktree:`);

      try {
        const targetMemoryDir = path.join(worktree.path, "docs/aimemory");

        // 建立目錄結構
        ["shared", "claude", "gemini", "codex"].forEach((dir) => {
          const dirPath = path.join(targetMemoryDir, dir);
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
        });

        // 同步共用檔案
        const sharedFiles = fs.readdirSync(sharedDir);
        sharedFiles.forEach((file) => {
          const sourcePath = path.join(sharedDir, file);
          const targetPath = path.join(targetMemoryDir, "shared", file);
          fs.copyFileSync(sourcePath, targetPath);
        });

        // 更新 worktree 的最後同步時間
        try {
          fs.writeFileSync(path.join(targetMemoryDir, ".last-sync"), timestamp + "\n", "utf8");
        } catch {}

        console.log(`   ✅ 同步完成 (${sharedFiles.length} 個共用檔案)`);
      } catch (error) {
        console.log(`   ❌ 同步失敗: ${error.message}`);
      }
    }

    // Optional: append collaboration log when --log is passed
    try {
      const extra = this.args || [];
      if (extra.includes("--log")) {
        console.log("📝 寫入協作日誌...");
        const cmd = [
          process.execPath,
          path.join(this.projectRoot, "scripts/aimemory-log-update.js"),
          ...extra.filter((a) => a !== "--log"),
        ];
        execSync(cmd.map((s) => (s.includes(' ') ? `"${s}"` : s)).join(' '), {
          cwd: this.projectRoot,
          stdio: "inherit",
        });
      }
    } catch (e) {
      console.log(`⚠️  協作日誌寫入失敗: ${e.message}`);
    }

    console.log("\n💡 記憶檔案已同步，請各 AI 檢查本地記憶目錄");
  }

  async cleanOldFiles() {
    console.log("🧹 清理遺留的 AI 記憶檔案\n");

    const rootAIFiles = fs
      .readdirSync(this.projectRoot)
      .filter((file) => this.isAIMemoryFile(file));

    if (rootAIFiles.length === 0) {
      console.log("✅ 根目錄沒有遺留的 AI 檔案");
      return;
    }

    console.log("🗑️  發現遺留檔案:");
    rootAIFiles.forEach((file) => {
      console.log(`   📄 ${file}`);
    });

    console.log("\n💡 建議手動檢查後移動到適當的 docs/aimemory/ 子目錄");
  }

  async showMemoryStructure() {
    console.log("🏗️  AI 記憶系統架構\n");

    console.log("📁 目錄結構:");
    console.log("docs/aimemory/");
    console.log("├── shared/           # 三 AI 共用記憶");
    console.log("├── claude/           # Claude (克勞德) 專用");
    console.log("├── gemini/           # Gemini 專用");
    console.log("├── codex/            # Codex 專用");
    console.log("└── README.md         # 說明文件");
    console.log();

    console.log("🎯 設計原則:");
    console.log("• 共用記憶 - 避免重複維護");
    console.log("• 專業分工 - 發揮各自優勢");
    console.log("• 本地管理 - 不推送到 GitHub");
    console.log("• 分類清晰 - 便於維護管理");
    console.log();
  }

  // 輔助方法
  isAIMemoryFile(filename) {
    const patterns = [
      /^AI_.*\.md$/,
      /^CLAUDE.*\.md$/,
      /^GEMINI.*\.md$/,
      /^CODEX.*\.md$/,
      /.*ONBOARDING.*\.md$/,
      /.*HANDOVER.*\.md$/,
      /.*REVIEW.*\.md$/,
      /.*COLLABORATION.*\.md$/,
      /^GSC_.*\.(md|txt)$/,
    ];

    return patterns.some((pattern) => pattern.test(filename));
  }

  suggestLocation(filename) {
    if (filename.includes("SHARED") || filename.includes("COLLABORATION")) {
      return "docs/aimemory/shared/";
    } else if (filename.includes("CLAUDE")) {
      return "docs/aimemory/claude/";
    } else if (filename.includes("GEMINI")) {
      return "docs/aimemory/gemini/";
    } else if (filename.includes("CODEX")) {
      return "docs/aimemory/codex/";
    }
    return "docs/aimemory/shared/";
  }

  getCategoryIcon(category) {
    const icons = {
      shared: "🤝",
      claude: "🧠",
      gemini: "✨",
      codex: "⚙️",
    };
    return icons[category] || "📁";
  }

  getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const bytes = stats.size;
      if (bytes < 1024) {
        return `${bytes}B`;
      }
      if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)}KB`;
      }
      return `${Math.round(bytes / (1024 * 1024))}MB`;
    } catch {
      return "N/A";
    }
  }

  getLastModified(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return stats.mtime.toLocaleDateString("zh-TW");
    } catch {
      return "N/A";
    }
  }

  getLastSyncTime(worktreePath) {
    try {
      const syncFile = path.join(worktreePath, "docs/aimemory/.last-sync");
      if (fs.existsSync(syncFile)) {
        return fs.readFileSync(syncFile, "utf8").trim();
      }
    } catch {
      return "從未同步";
    }
    return "從未同步";
  }

  showSyncSuggestions() {
    console.log("💡 建議動作:\n");
    console.log("• 同步記憶檔案: npm run memory:sync");
    console.log("• 清理遺留檔案: npm run memory:clean");
    console.log("• 查看系統架構: npm run memory:structure");
    console.log("• 檢查同步狀態: npm run memory:status");
    console.log();
  }

  showUsage() {
    console.log("使用方式:\n");
    console.log("npm run memory:status     - 檢查記憶檔案狀態");
    console.log("npm run memory:sync       - 同步共用記憶到所有 worktree");
    console.log("npm run memory:clean      - 清理遺留檔案");
    console.log("npm run memory:structure  - 顯示系統架構");
    console.log();
  }
}

// 執行
if (require.main === module) {
  const action = process.argv[2] || "status";
  const sync = new AIMemorySync();
  sync.run(action).catch(console.error);
}

module.exports = AIMemorySync;
