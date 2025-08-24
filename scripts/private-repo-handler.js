#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Private Repository Handler
 * 處理私有儲存庫的同步操作
 */

class PrivateRepoHandler {
  constructor(config = {}) {
    this.config = {
      privateRepoPath:
        config.privateRepoPath || "D:\\marskingx.github.io-dev-sync",
      defaultCommitMessage:
        config.defaultCommitMessage || "sync: AI memory update",
      verbose: config.verbose !== false,
      ...config,
    };
  }

  log(message, type = "info") {
    if (!this.config.verbose) {
      return;
    }

    const prefix = {
      info: "📝",
      success: "✅",
      error: "❌",
      warning: "⚠️",
    };

    console.log(`${prefix[type]} ${message}`);
  }

  validatePrivateRepo() {
    const repoPath = this.config.privateRepoPath;

    if (!fs.existsSync(repoPath)) {
      throw new Error(`私有儲存庫路徑不存在: ${repoPath}`);
    }

    const gitPath = path.join(repoPath, ".git");
    if (!fs.existsSync(gitPath)) {
      throw new Error(`路徑不是 Git 儲存庫: ${repoPath}`);
    }

    this.log(`✓ 私有儲存庫路徑驗證通過: ${repoPath}`);
  }

  executeCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        cwd: this.config.privateRepoPath,
        encoding: "utf8",
        stdio: options.silent ? "pipe" : "inherit",
        ...options,
      });
      return result;
    } catch (error) {
      throw new Error(`命令執行失敗: ${command}\\n錯誤: ${error.message}`);
    }
  }

  checkWorkingDirectory() {
    try {
      const status = this.executeCommand("git status --porcelain", {
        silent: true,
      });
      return status.trim();
    } catch (error) {
      throw new Error(`檢查工作目錄狀態失敗: ${error.message}`);
    }
  }

  async pushChanges(commitMessage = null) {
    this.log("開始推送變更到私有儲存庫...", "info");

    try {
      // 驗證儲存庫
      this.validatePrivateRepo();

      // 檢查是否有變更
      const changes = this.checkWorkingDirectory();
      if (!changes) {
        this.log("沒有變更需要提交", "warning");
        return { success: true, message: "沒有變更" };
      }

      this.log(`發現變更:\\n${changes}`);

      // 添加所有變更
      this.executeCommand("git add .");
      this.log("已添加所有變更到暫存區");

      // 提交變更
      const message = commitMessage || this.config.defaultCommitMessage;
      this.executeCommand(`git commit -m "${message}"`);
      this.log(`已提交變更: ${message}`);

      // 推送到遠端
      this.executeCommand("git push origin main");
      this.log("已推送到遠端儲存庫", "success");

      return {
        success: true,
        message: "變更推送成功",
        commitMessage: message,
      };
    } catch (error) {
      this.log(`推送失敗: ${error.message}`, "error");
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async pullChanges() {
    this.log("開始從私有儲存庫拉取變更...", "info");

    try {
      // 驗證儲存庫
      this.validatePrivateRepo();

      // 檢查工作目錄是否乾淨
      const changes = this.checkWorkingDirectory();
      if (changes) {
        this.log("工作目錄有未提交的變更，請先提交或暫存", "warning");
        this.log(`變更內容:\\n${changes}`);
        return {
          success: false,
          error: "工作目錄不乾淨",
          changes: changes,
        };
      }

      // 拉取變更
      const result = this.executeCommand("git pull origin main", {
        silent: true,
      });

      if (result.includes("Already up to date")) {
        this.log("已是最新版本", "success");
        return {
          success: true,
          message: "已是最新版本",
        };
      }

      this.log("成功拉取變更", "success");
      return {
        success: true,
        message: "拉取變更成功",
        output: result,
      };
    } catch (error) {
      this.log(`拉取失敗: ${error.message}`, "error");
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createTag(tagName) {
    this.log(`建立標籤: ${tagName}`, "info");

    try {
      this.validatePrivateRepo();

      // 建立標籤
      this.executeCommand(`git tag ${tagName}`);
      this.log(`已建立標籤: ${tagName}`);

      // 推送標籤
      this.executeCommand(`git push origin ${tagName}`);
      this.log(`已推送標籤: ${tagName}`, "success");

      return {
        success: true,
        message: `標籤 ${tagName} 建立並推送成功`,
      };
    } catch (error) {
      this.log(`建立標籤失敗: ${error.message}`, "error");
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getStatus() {
    try {
      this.validatePrivateRepo();

      const status = this.executeCommand("git status --porcelain", {
        silent: true,
      });
      const branch = this.executeCommand("git branch --show-current", {
        silent: true,
      }).trim();
      const lastCommit = this.executeCommand('git log -1 --format="%h %s"', {
        silent: true,
      }).trim();

      return {
        success: true,
        branch: branch,
        lastCommit: lastCommit,
        hasChanges: !!status.trim(),
        changes: status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// CLI 接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const handler = new PrivateRepoHandler();

  try {
    switch (command) {
      case "push":
        const commitMessage = args[1];
        const pushResult = await handler.pushChanges(commitMessage);
        console.log(JSON.stringify(pushResult, null, 2));
        process.exit(pushResult.success ? 0 : 1);
        break;

      case "pull":
        const pullResult = await handler.pullChanges();
        console.log(JSON.stringify(pullResult, null, 2));
        process.exit(pullResult.success ? 0 : 1);
        break;

      case "tag":
        const tagName = args[1];
        if (!tagName) {
          console.error("❌ 請提供標籤名稱");
          process.exit(1);
        }
        const tagResult = await handler.createTag(tagName);
        console.log(JSON.stringify(tagResult, null, 2));
        process.exit(tagResult.success ? 0 : 1);
        break;

      case "status":
        const statusResult = await handler.getStatus();
        console.log(JSON.stringify(statusResult, null, 2));
        process.exit(statusResult.success ? 0 : 1);
        break;

      default:
        console.log(`
🔧 私有儲存庫處理工具

使用方法:
  node private-repo-handler.js <command> [options]

指令:
  push [message]    - 推送變更到私有儲存庫
  pull             - 從私有儲存庫拉取變更
  tag <name>       - 建立並推送標籤
  status           - 檢查儲存庫狀態

範例:
  node private-repo-handler.js push "update AI memory"
  node private-repo-handler.js pull
  node private-repo-handler.js tag v3.3.2
  node private-repo-handler.js status
        `);
    }
  } catch (error) {
    console.error("❌", error.message);
    process.exit(1);
  }
}

module.exports = PrivateRepoHandler;

if (require.main === module) {
  main();
}
