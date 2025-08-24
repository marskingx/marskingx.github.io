#!/usr/bin/env node

/**
 * 選擇性清理工具 - 移除特定私人檔案但保留歷史
 */

const { execSync } = require("child_process");

class SelectiveCleanup {
  constructor() {
    // 需要從歷史中移除的私人檔案模式
    this.privatePatterns = [
      ".claude/",
      ".kiro/",
      "docs/aimemory/",
      ".env",
      ".claude-backups/",
      "*.log",
      "mailchimp/",
      "Claude-Code-Usage-Monitor/",
    ];
  }

  log(message, type = "info") {
    const prefix = {
      info: "📝",
      success: "✅",
      error: "❌",
      warning: "⚠️",
    };
    console.log(`${prefix[type]} ${message}`);
  }

  async selectiveCleanup() {
    this.log("開始選擇性私人檔案清理...", "warning");

    try {
      // 使用 git filter-branch 移除私人檔案
      for (const pattern of this.privatePatterns) {
        this.log(`清理檔案模式: ${pattern}`, "info");

        const command = `git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch ${pattern}" --prune-empty --tag-name-filter cat -- --all`;

        try {
          execSync(command, { stdio: "pipe" });
          this.log(`✓ 已清理: ${pattern}`, "success");
        } catch {
          this.log(`跳過: ${pattern} (可能不存在)`, "info");
        }
      }

      // 清理 reflog 和垃圾回收
      this.log("執行垃圾回收...", "info");
      execSync("git reflog expire --expire=now --all");
      execSync("git gc --prune=now --aggressive");

      this.log("🎉 選擇性清理完成！", "success");
      this.log("請檢查並強制推送: git push -f origin main", "warning");

      return { success: true };
    } catch (error) {
      this.log(`清理失敗: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }
}

// 執行
if (require.main === module) {
  const cleanup = new SelectiveCleanup();
  cleanup.selectiveCleanup();
}

module.exports = SelectiveCleanup;
