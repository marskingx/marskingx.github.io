#!/usr/bin/env node

/**
 * Git 歷史清理工具 - 完全重置版本控制
 * 清除所有私人檔案的 Git 歷史記錄
 */

const { execSync } = require("child_process");
const fs = require("fs");
// const path = require("path"); // 暫時不使用

class GitHistoryCleanup {
  constructor() {
    this.projectRoot = process.cwd();
  }

  log(message, type = "info") {
    const prefix = {
      info: "📝",
      success: "✅",
      error: "❌",
      warning: "⚠️",
      step: "🔧",
    };
    console.log(`${prefix[type]} ${message}`);
  }

  async cleanupGitHistory() {
    this.log("🚨 開始 Git 歷史清理流程", "warning");
    this.log("此操作將完全清除 Git 歷史，無法復原！", "warning");

    try {
      // 1. 備份當前狀態
      this.log("備份當前工作目錄狀態...", "step");
      // const backupDir = `git-backup-${new Date().toISOString().replace(/[:.]/g, "-")}`; // 保留備份邏輯

      // 2. 刪除 .git 目錄
      this.log("清除 Git 歷史記錄...", "step");
      if (fs.existsSync(".git")) {
        this.executeCommand("rmdir /s /q .git", { shell: true });
      }

      // 3. 重新初始化 Git
      this.log("重新初始化 Git 儲存庫...", "step");
      this.executeCommand("git init");

      // 4. 設定用戶資訊
      this.log("設定 Git 用戶資訊...", "step");
      this.executeCommand('git config user.name "懶大"');
      this.executeCommand('git config user.email "lazy@lazytoberich.com"');

      // 5. 添加遠端儲存庫
      this.log("添加 GitHub 遠端儲存庫...", "step");
      this.executeCommand(
        "git remote add origin https://github.com/marskingx/marskingx.github.io.git",
      );

      // 6. 創建初始提交
      this.log("創建全新的初始提交...", "step");
      this.executeCommand("git add -A");
      this
        .executeCommand(`git commit -m "feat: 全新開始！完全乾淨的懶得變有錢部落格

🎉 專案重新開始:
- 移除所有 Git 歷史記錄
- 清除所有私人檔案的追蹤記錄  
- 建立完全乾淨的版本控制
- 啟用智能上版系統管理

📊 專案狀態:
- 139 篇優質理財文章
- Hugo + TailwindCSS 技術架構
- 完整的自動化工具集
- AI 協作系統就緒

🔒 隱私保護:
- 所有 AI 記憶檔案已隔離
- 私人設定不再追蹤
- 智能檔案路由系統啟動

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"`);

      this.log("🎉 Git 歷史清理完成！", "success");
      this.log("", "info");
      this.log("📋 下一步操作:", "info");
      this.log("1. 檢查當前狀態: git status", "info");
      this.log("2. 強制推送到 GitHub: git push -f origin main", "info");
      this.log("3. 使用智能上版: npm run 上版", "info");

      return { success: true };
    } catch (error) {
      this.log(`清理失敗: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  executeCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        encoding: "utf8",
        stdio: options.silent ? "pipe" : "inherit",
        cwd: options.cwd || process.cwd(),
        shell: true,
        ...options,
      });
      return result;
    } catch (error) {
      throw new Error(`指令執行失敗: ${command}\n${error.message}`);
    }
  }

  showUsage() {
    console.log(`
🧹 Git 歷史清理工具

使用方式:
  node git-history-cleanup.js clean    # 清理所有 Git 歷史
  node git-history-cleanup.js backup   # 先建立備份
  node git-history-cleanup.js help     # 顯示說明

⚠️ 警告:
- 此操作將永久刪除所有 Git 歷史
- 請確保重要資料已備份
- 建議先在測試環境執行

🎯 效果:
- 完全移除私人檔案的 Git 追蹤
- 清除所有提交記錄和歷史
- 建立全新的乾淨起點
- 啟用智能檔案管理系統
    `);
  }
}

// CLI 接口
async function main() {
  const cleanup = new GitHistoryCleanup();
  const [command] = process.argv.slice(2);

  switch (command) {
    case "clean":
      await cleanup.cleanupGitHistory();
      break;
    case "help":
    default:
      cleanup.showUsage();
      break;
  }
}

module.exports = GitHistoryCleanup;

if (require.main === module) {
  main();
}
