#!/usr/bin/env node

/**
 * 衝突防止機制
 * 在提交前檢查潛在衝突，提供預警和建議
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class ConflictPrevention {
  constructor() {
    this.projectRoot = process.cwd();
    this.highRiskFiles = [
      "hugo.toml",
      "package.json",
      ".version",
      "docs/aimemory/claude/claude.md",
      "docs/aimemory/gemini/gemini.md",
      "docs/aimemory/codex/codex.md",
      "docs/aimemory/shared/ai-shared.md",
    ];

    this.fileResponsibilities = {
      "content/blog/": ["內容創建者", "Gemini", "Claude"],
      "layouts/": ["Claude", "Codex"],
      "scripts/": ["Codex", "Claude"],
      "themes/hugoplate/": ["需三AI協議"],
      "static/": ["共同維護"],
      "assets/": ["共同維護"],
      "config/": ["Claude"],
    };
  }

  // 主要執行方法
  async run(action = "check") {
    console.log("🛡️  AI 衝突防止系統\n");
    console.log("======================================\n");

    switch (action) {
      case "check":
        await this.checkCurrentChanges();
        break;
      case "precommit": {
        const ok = await this.preCommitCheck();
        process.exit(ok ? 0 : 1);
      }
        break;
      case "rules":
        await this.showCollaborationRules();
        break;
      case "lock":
        await this.createFileLock(process.argv[3]);
        if (process.argv.includes("--notify")) {
          await this.notifyOtherAIs();
        }
        break;
      case "unlock":
        await this.releaseFileLock();
        break;
      default:
        this.showUsage();
    }
  }

  // 檢查當前變更的風險
  async checkCurrentChanges() {
    console.log("🔍 檢查當前變更風險\n");

    // <<<<<<< 新增：自動檢查檔案鎖定 >>>>>>>
    const lockPath = path.join(this.projectRoot, ".ai-lock.json");
    if (fs.existsSync(lockPath)) {
      const lockInfo = JSON.parse(fs.readFileSync(lockPath, "utf8"));
      const currentBranch = this.getCurrentBranch();
      if (lockInfo.branch !== currentBranch) {
        console.log("🚨 !!! 警告：偵測到檔案鎖定 !!! 🚨\n");
        console.log(`   • 鎖定者: ${lockInfo.ai}`);
        console.log(`   • 鎖定分支: ${lockInfo.branch}`);
        console.log(`   • 鎖定時間: ${lockInfo.timestamp}`);
        console.log(`   • 訊息: ${lockInfo.message}`);
        console.log(`   • 鎖定檔案數: ${lockInfo.files.length}\n`);
        console.log("💡 建議：暫停目前工作，並與鎖定者協調。\n");
        return; // 發現鎖定後，提前終止檢查
      }
    }
    // <<<<<<< 新增結束 >>>>>>>

    const currentBranch = this.getCurrentBranch();
    const modifiedFiles = this.getModifiedFiles();

    console.log(`📍 當前分支: ${currentBranch}`);
    console.log(`📝 修改檔案數: ${modifiedFiles.length}\n`);

    if (modifiedFiles.length === 0) {
      console.log("✅ 沒有未提交的變更\n");
      return;
    }

    // 分析風險等級
    const riskAnalysis = this.analyzeRisk(modifiedFiles);
    this.displayRiskAnalysis(riskAnalysis);

    // 檢查其他分支是否修改相同檔案
    await this.checkCrossAgentConflicts(modifiedFiles);

    // 提供建議
    this.provideRecommendations(riskAnalysis);
  }

  // 提交前檢查
  async preCommitCheck() {
    console.log("🚦 提交前安全檢查\n");

    const issues = [];

    // 1. 檢查 Markdown 規範（快速失敗）
    console.log("📝 檢查 Markdown 規範...");
    try {
      execSync("npm run content:lint:strict", { stdio: "pipe" });
      console.log("✅ Markdown 檢查通過\n");
    } catch {
      console.log("❌ Markdown 檢查未通過\n");
      issues.push("Markdown 規範未通過 (content/docs/aimemory)");
    }

    // 2. 檢查建置是否成功
    console.log("🔨 檢查建置狀態...");
    try {
      execSync("npm run build", { stdio: "pipe" });
      console.log("✅ 建置成功\n");
    } catch {
      console.log("❌ 建置失敗\n");
      issues.push("建置失敗，請修復後再提交");
    }

    // 3. 檢查結構化資料
    console.log("📊 檢查結構化資料...");
    try {
      const output = execSync("npm run schema:validate", {
        encoding: "utf8",
        stdio: "pipe",
      });
      if (output.includes("❌ 錯誤數量: 0")) {
        console.log("✅ 結構化資料正確\n");
      } else {
        console.log("⚠️  結構化資料有警告\n");
      }
    } catch {
      console.log("⚠️  結構化資料檢查失敗\n");
    }

    // 4. 檢查高風險檔案
    const modifiedFiles = this.getModifiedFiles();
    const highRiskModified = modifiedFiles.filter((file) =>
      this.highRiskFiles.some((riskFile) => file.includes(riskFile)),
    );

    if (highRiskModified.length > 0) {
      console.log("⚠️  修改了高風險檔案:");
      highRiskModified.forEach((file) => {
        console.log(`   • ${file}`);
      });
      console.log("   💡 建議通知其他 AI 協調\n");
    }

    // 5. 檢查記憶檔案同步
    if (modifiedFiles.some((file) => file.includes(".md"))) {
      console.log("📝 檢查記憶檔案同步...");
      const needsSync = await this.checkMemorySync();
      if (needsSync) {
        issues.push("記憶檔案可能需要同步更新");
      }
    }

    // 總結
    if (issues.length === 0) {
      console.log("🎉 所有檢查通過，可以安全提交！\n");
      return true;
    } else {
      console.log("⚠️  發現以下問題:");
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      console.log("\n💡 已阻擋提交，請修復後重試\n");
      return false;
    }
  }

  // 顯示協作規則
  async showCollaborationRules() {
    console.log("📋 多 AI 協作規則\n");

    console.log("🤖 AI 分工:");
    console.log("• 克勞德 (Claude): 主要開發、版本管理、配置維護");
    console.log("• Codex: 程式碼生成、自動化腳本、效能優化");
    console.log("• Gemini: 實驗功能、內容創新、分析報告\n");

    console.log("📂 檔案責任區域:");
    Object.entries(this.fileResponsibilities).forEach(([path, owners]) => {
      console.log(`• ${path.padEnd(20)} → ${owners.join(", ")}`);
    });
    console.log();

    console.log("⚠️  高風險檔案 (需協調):");
    this.highRiskFiles.forEach((file) => {
      console.log(`• ${file}`);
    });
    console.log();

    console.log("🔄 工作流程:");
    console.log("1. 開發前: 檢查其他 AI 分支狀態");
    console.log("2. 開發中: 避免修改他人責任區域");
    console.log("3. 提交前: 執行 npm run conflict:precommit");
    console.log("4. 合併前: 使用 rebase 保持歷史整潔");
    console.log("5. 部署後: 更新共用記憶檔案\n");
  }

  // 創建檔案鎖定 (標記正在編輯)
  async createFileLock(message = "正在進行高風險變更，請稍後再修改相關檔案") {
    const currentBranch = this.getCurrentBranch();
    const aiName = this.getAINameFromBranch(currentBranch);

    const lockInfo = {
      ai: aiName,
      branch: currentBranch,
      timestamp: new Date().toISOString(),
      message: message,
      files: this.getModifiedFiles(),
    };

    const lockPath = path.join(this.projectRoot, ".ai-lock.json");
    fs.writeFileSync(lockPath, JSON.stringify(lockInfo, null, 2));

    console.log(`🔒 已創建檔案鎖定標記 (${aiName})`);
    console.log(`💬 訊息: ${message}`);
    console.log(`📁 鎖定檔案: ${lockInfo.files.length} 個\n`);
  }

  // 釋放檔案鎖定
  async releaseFileLock() {
    const lockPath = path.join(this.projectRoot, ".ai-lock.json");

    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
      console.log("🔓 已釋放檔案鎖定\n");
    } else {
      console.log("💡 沒有發現檔案鎖定\n");
    }
  }

  // 輔助方法
  getCurrentBranch() {
    try {
      return execSync("git branch --show-current", {
        encoding: "utf8",
        stdio: "pipe",
      }).trim();
    } catch {
      return "unknown";
    }
  }

  getModifiedFiles() {
    try {
      const result = execSync("git status --porcelain", {
        encoding: "utf8",
        stdio: "pipe",
      });
      return result
        .trim()
        .split("\n")
        .filter((line) => line)
        .map((line) => line.substring(3));
    } catch {
      return [];
    }
  }

  analyzeRisk(files) {
    const risk = { high: [], medium: [], low: [] };

    files.forEach((file) => {
      if (this.highRiskFiles.some((riskFile) => file.includes(riskFile))) {
        risk.high.push(file);
      } else if (
        file.includes("themes/hugoplate/") ||
        file.includes("layouts/")
      ) {
        risk.medium.push(file);
      } else {
        risk.low.push(file);
      }
    });

    return risk;
  }

  displayRiskAnalysis(risk) {
    console.log("🎯 風險分析:\n");

    if (risk.high.length > 0) {
      console.log("🔴 高風險檔案:");
      risk.high.forEach((file) => console.log(`   • ${file}`));
      console.log();
    }

    if (risk.medium.length > 0) {
      console.log("🟡 中風險檔案:");
      risk.medium.forEach((file) => console.log(`   • ${file}`));
      console.log();
    }

    if (risk.low.length > 0) {
      console.log("🟢 低風險檔案:");
      risk.low.forEach((file) => console.log(`   • ${file}`));
      console.log();
    }
  }

  async checkCrossAgentConflicts(files) {
    console.log("🤖 檢查跨 AI 衝突風險:\n");

    const branches = ["claude-dev", "codex-dev", "gemini-dev"];
    const currentBranch = this.getCurrentBranch();
    const conflicts = [];

    for (const branch of branches) {
      if (branch === currentBranch) {
        continue;
      }

      try {
        const branchFiles = execSync(`git diff --name-only main...${branch}`, {
          encoding: "utf8",
          stdio: "pipe",
        })
          .trim()
          .split("\n")
          .filter((f) => f);

        const commonFiles = files.filter((file) => branchFiles.includes(file));

        if (commonFiles.length > 0) {
          conflicts.push({ branch, files: commonFiles });
        }
      } catch {
        // 分支不存在或無法訪問
      }
    }

    if (conflicts.length === 0) {
      console.log("✅ 沒有發現跨 AI 檔案衝突\n");
    } else {
      console.log("⚠️  發現潛在衝突:");
      conflicts.forEach(({ branch, files }) => {
        console.log(`   📍 ${branch}: ${files.join(", ")}`);
      });
      console.log();
    }
  }

  provideRecommendations(risk) {
    console.log("💡 建議動作:\n");

    if (risk.high.length > 0) {
      console.log("• 高風險檔案需要與其他 AI 協調");
      console.log("• 建議更新 ai-shared.md 記錄變更");
    }

    if (risk.medium.length > 0) {
      console.log("• 檢查相關 AI 是否在修改相同區域");
    }

    console.log("• 提交前執行: npm run conflict:precommit");
    console.log("• 如需協調，可創建鎖定: npm run conflict:lock\n");
  }

  // <<<<<<< 新增：通知其他 AI >>>>>>>
  async notifyOtherAIs() {
    const lockPath = path.join(this.projectRoot, ".ai-lock.json");
    if (!fs.existsSync(lockPath)) {
      console.log("💡 沒有發現檔案鎖定，無需通知。");
      return;
    }

    const lockInfo = JSON.parse(fs.readFileSync(lockPath, "utf8"));
    const allAIs = ["claude", "codex", "gemini"];
    const lockingAI = lockInfo.branch.split('-')[0];
    const otherAIs = allAIs.filter(ai => ai !== lockingAI);

    const notificationMessage = `\n---\n**🚨 自動化衝突警告 (${new Date().toISOString()}) 🚨**\n- **來源**: ${lockInfo.ai}\n- **訊息**: ${lockInfo.message}\n- **建議**: 在對方釋放鎖定 (執行 \`npm run conflict:unlock\]) 前，請避免修改高風險檔案。\n---\n`;

    console.log(`\n📢 正在通知其他 AI...`);

    for (const ai of otherAIs) {
      const memoryFile = `docs/aimemory/${ai}/${ai}.md`;
      const memoryPath = path.join(this.projectRoot, memoryFile);
      if (fs.existsSync(memoryPath)) {
        fs.appendFileSync(memoryPath, notificationMessage);
        console.log(`   ✅ 已通知 ${ai} (更新於 ${memoryFile})`);
      } else {
        console.log(`   ⚠️  ${ai} 的記憶檔案不存在，無法通知。`);
      }
    }
    console.log();
  }
  // <<<<<<< 新增結束 >>>>>>>

  async checkMemorySync() {
    // 檢查記憶檔案是否需要同步
    const memoryFiles = [
      "docs/aimemory/shared/ai-shared.md", 
      "docs/aimemory/claude/claude.md", 
      "docs/aimemory/gemini/gemini.md", 
      "docs/aimemory/codex/codex.md"
    ];
    let needsSync = false;

    for (const file of memoryFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        if (content.includes("2025-08-21") && !content.includes("2025-08-22")) {
          needsSync = true;
          break;
        }
      }
    }

    return needsSync;
  }

  getAINameFromBranch(branch) {
    switch (branch) {
      case "claude-dev":
        return "Claude (克勞德)";
      case "codex-dev":
        return "Codex";
      case "gemini-dev":
        return "Gemini";
      default:
        return "Unknown AI";
    }
  }

  showUsage() {
    console.log("使用方式:\n");
    console.log("npm run conflict:check                - 檢查當前變更風險 (會自動偵測鎖定)");
    console.log("npm run conflict:precommit            - 提交前安全檢查");
    console.log("npm run conflict:rules                - 顯示協作規則");
    console.log("npm run conflict:lock [message]       - 創建檔案鎖定，可選填訊息");
    console.log("npm run conflict:lock --notify [msg]  - 創建鎖定並通知其他 AI");
    console.log("npm run conflict:unlock               - 釋放檔案鎖定\n");
  }
}

// 執行
if (require.main === module) {
  const action = process.argv[2] || "check";
  const prevention = new ConflictPrevention();
  prevention.run(action).catch(console.error);
}

module.exports = ConflictPrevention;
