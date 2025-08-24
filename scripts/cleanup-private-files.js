#!/usr/bin/env node

const { execSync } = require("child_process");

/**
 * 清理公有庫中的私人檔案
 * 將私人檔案從 Git 歷史中完全移除
 */

class PrivateFilesCleaner {
  constructor() {
    this.privateFilePatterns = [
      "docs/aimemory/",
      ".kiro/",
      ".claude-backups/",
      ".claude/",
      ".env*",
      "reindex/",
      "AI_*.md",
      "CLAUDE*.md",
      "GEMINI*.md",
      "CODEX*.md",
      "*ONBOARDING*.md",
      "*HANDOVER*.md",
      "*REVIEW*.md",
      "*COLLABORATION*.md",
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

  executeCommand(command, options = {}) {
    try {
      return execSync(command, {
        encoding: "utf8",
        stdio: options.silent ? "pipe" : "inherit",
        ...options,
      });
    } catch (error) {
      throw new Error(`指令執行失敗: ${command}\\n${error.message}`);
    }
  }

  /**
   * 從 Git 歷史中完全移除私人檔案
   */
  async cleanupPrivateFiles() {
    this.log("🧹 開始清理公有庫中的私人檔案", "info");

    try {
      // 1. 先檢查當前有哪些私人檔案在追蹤中
      const trackedFiles = this.getTrackedPrivateFiles();

      if (trackedFiles.length === 0) {
        this.log("沒有發現被追蹤的私人檔案", "success");
        return;
      }

      this.log(`發現 ${trackedFiles.length} 個被追蹤的私人檔案:`, "warning");
      trackedFiles.forEach((file) => console.log(`  - ${file}`));

      // 2. 從 Git 索引中移除這些檔案
      this.log("\\n從 Git 索引中移除私人檔案...", "info");

      for (const file of trackedFiles) {
        try {
          this.executeCommand(`git rm -r --cached "${file}"`, { silent: true });
          this.log(`✓ 移除: ${file}`, "success");
        } catch {
          this.log(`跳過: ${file} (可能已不存在)`, "warning");
        }
      }

      // 3. 提交移除操作
      this.log("\\n提交私人檔案移除操作...", "info");
      this.executeCommand(
        'git commit -m "security: 從公有庫移除私人檔案，改由私有儲存庫管理\\n\\n- 移除 .kiro/ 專案規格檔案\\n- 移除 .claude-backups/ 備份檔案\\n- 移除 .env 環境變數\\n- 移除 reindex/ 索引檔案\\n- 移除 docs/aimemory/ AI記憶檔案\\n\\n🔒 這些檔案現在只存在於私有儲存庫中\\n\\n🤖 Generated with Claude Code\\n\\nCo-Authored-By: Claude <noreply@anthropic.com>"',
      );

      this.log("✓ 私人檔案清理提交完成", "success");

      // 4. 更新 .gitignore 確保這些檔案被忽略
      await this.updateGitignore();

      return { success: true, removedFiles: trackedFiles };
    } catch (error) {
      this.log(`清理失敗: ${error.message}`, "error");
      throw error;
    }
  }

  /**
   * 取得被追蹤的私人檔案
   */
  getTrackedPrivateFiles() {
    const allTrackedFiles = this.executeCommand(
      "git ls-tree -r --name-only HEAD",
      { silent: true },
    )
      .trim()
      .split("\\n")
      .filter((line) => line.length > 0);

    return allTrackedFiles.filter((file) => {
      return this.privateFilePatterns.some((pattern) => {
        if (pattern.endsWith("/")) {
          return file.startsWith(pattern);
        }
        if (pattern.includes("*")) {
          const regex = new RegExp(pattern.replace(/\\*/g, ".*"));
          return regex.test(file);
        }
        return file === pattern;
      });
    });
  }

  /**
   * 更新 .gitignore 確保私人檔案被忽略
   */
  async updateGitignore() {
    this.log("更新 .gitignore 確保私人檔案被正確忽略...", "info");

    const gitignorePath = ".gitignore";
    let gitignoreContent = "";

    if (require("fs").existsSync(gitignorePath)) {
      gitignoreContent = require("fs").readFileSync(gitignorePath, "utf8");
    }

    // 確保所有私人檔案模式都在 .gitignore 中
    const patterns = [
      "# 🔒 私人開發檔案 (由私有儲存庫管理)",
      "docs/aimemory/",
      ".kiro/",
      ".claude-backups/",
      ".claude/",
      ".env*",
      "reindex/",
      "AI_*.md",
      "CLAUDE*.md",
      "GEMINI*.md",
      "CODEX*.md",
      "*ONBOARDING*.md",
      "*HANDOVER*.md",
      "*REVIEW*.md",
      "*COLLABORATION*.md",
    ];

    let needsUpdate = false;
    for (const pattern of patterns) {
      if (!gitignoreContent.includes(pattern)) {
        gitignoreContent += `\\n${pattern}`;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      require("fs").writeFileSync(gitignorePath, gitignoreContent);
      this.log("✓ .gitignore 已更新", "success");
    } else {
      this.log(".gitignore 已包含所有必要的忽略規則", "info");
    }
  }

  /**
   * 驗證清理結果
   */
  async validateCleanup() {
    this.log("驗證清理結果...", "info");

    const remainingPrivateFiles = this.getTrackedPrivateFiles();

    if (remainingPrivateFiles.length === 0) {
      this.log("🎉 公有庫清理完成，沒有殘留私人檔案", "success");
      return true;
    } else {
      this.log(
        `仍有 ${remainingPrivateFiles.length} 個私人檔案在追蹤中:`,
        "error",
      );
      remainingPrivateFiles.forEach((file) => console.log(`  - ${file}`));
      return false;
    }
  }
}

// CLI 接口
async function main() {
  const cleaner = new PrivateFilesCleaner();

  try {
    await cleaner.cleanupPrivateFiles();
    await cleaner.validateCleanup();

    console.log(`
🎯 清理完成！現在：
  ✅ 公有庫只包含程式碼和公開配置
  ✅ 私人檔案只存在於私有儲存庫
  ✅ 未來的上版/下拉會自動處理雙儲存庫同步
    `);
  } catch (error) {
    console.error("❌ 清理失敗:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
