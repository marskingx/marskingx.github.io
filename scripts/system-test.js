#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * AI 協作系統自動化測試
 * 測試所有核心功能的完整性
 */

class SystemTester {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  log(message, type = "info") {
    const prefix = {
      info: "📝",
      success: "✅",
      error: "❌",
      warning: "⚠️",
      test: "🧪",
    };
    console.log(`${prefix[type]} ${message}`);
  }

  executeCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        encoding: "utf8",
        stdio: options.silent ? "pipe" : "inherit",
        cwd: path.join(__dirname, ".."),
        ...options,
      });
      return { success: true, output: result };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: error.stdout || error.stderr || "",
      };
    }
  }

  addTestResult(testName, passed, details = "") {
    this.testResults.push({
      name: testName,
      passed,
      details,
      timestamp: new Date().toISOString(),
    });

    if (passed) {
      this.passedTests++;
      this.log(`${testName}: PASSED`, "success");
    } else {
      this.failedTests++;
      this.log(`${testName}: FAILED - ${details}`, "error");
    }
  }

  // 測試 1: 檢查核心檔案存在性
  testCoreFilesExistence() {
    this.log("測試核心檔案存在性...", "test");

    const requiredFiles = [
      ".eslintrc.js",
      ".markdownlint.json",
      ".stylelintrc.json",
      ".prettierrc",
      "scripts/release-manager.js",
      "scripts/private-repo-handler.js",
      "scripts/git-hooks-setup.js",
      "CLAUDE.md",
    ];

    let allFilesExist = true;
    let missingFiles = [];

    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, "..", file);
      if (!fs.existsSync(filePath)) {
        allFilesExist = false;
        missingFiles.push(file);
      }
    }

    this.addTestResult(
      "核心檔案存在性檢查",
      allFilesExist,
      missingFiles.length > 0 ? `缺少檔案: ${missingFiles.join(", ")}` : "",
    );

    return allFilesExist;
  }

  // 測試 2: 檢查 Git hooks 設定
  testGitHooksSetup() {
    this.log("測試 Git hooks 設定...", "test");

    const hooksPath = path.join(__dirname, "..", ".git", "hooks");
    const commitMsgHook = path.join(hooksPath, "commit-msg");
    const preCommitHook = path.join(hooksPath, "pre-commit");

    const hooksExist =
      fs.existsSync(commitMsgHook) && fs.existsSync(preCommitHook);

    let executableChecks = true;
    if (hooksExist) {
      try {
        // 檢查檔案內容而非執行權限（Windows 環境相容性）
        const commitMsgContent = fs.readFileSync(commitMsgHook, "utf8");
        const preCommitContent = fs.readFileSync(preCommitHook, "utf8");
        executableChecks =
          commitMsgContent.includes("commit_regex") &&
          preCommitContent.includes("代碼品質檢查");
      } catch (error) {
        executableChecks = false;
      }
    }

    const passed = hooksExist && executableChecks;
    this.addTestResult(
      "Git Hooks 設定檢查",
      passed,
      !hooksExist
        ? "缺少 hooks 檔案"
        : !executableChecks
          ? "hooks 檔案內容不正確"
          : "",
    );

    return passed;
  }

  // 測試 3: 測試 npm scripts 可用性
  testNpmScripts() {
    this.log("測試 npm scripts 可用性...", "test");

    const packageJsonPath = path.join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const requiredScripts = [
      "setup:hooks",
      "memory:push",
      "memory:pull",
      "memory:status",
      "release:start",
      "lint:all",
      "memory:help",
    ];

    let allScriptsExist = true;
    let missingScripts = [];

    for (const script of requiredScripts) {
      if (!packageJson.scripts[script]) {
        allScriptsExist = false;
        missingScripts.push(script);
      }
    }

    this.addTestResult(
      "npm scripts 可用性檢查",
      allScriptsExist,
      missingScripts.length > 0
        ? `缺少 scripts: ${missingScripts.join(", ")}`
        : "",
    );

    return allScriptsExist;
  }

  // 測試 4: 測試代碼品質工具安裝
  testLintingToolsInstallation() {
    this.log("測試代碼品質工具安裝...", "test");

    const packageJsonPath = path.join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const requiredDevDeps = [
      "eslint",
      "markdownlint-cli",
      "stylelint",
      "stylelint-config-standard",
      "prettier",
    ];

    let allToolsInstalled = true;
    let missingTools = [];

    for (const tool of requiredDevDeps) {
      if (!packageJson.devDependencies[tool]) {
        allToolsInstalled = false;
        missingTools.push(tool);
      }
    }

    this.addTestResult(
      "代碼品質工具安裝檢查",
      allToolsInstalled,
      missingTools.length > 0 ? `缺少工具: ${missingTools.join(", ")}` : "",
    );

    return allToolsInstalled;
  }

  // 測試 5: 測試私有儲存庫連接
  testPrivateRepoConnection() {
    this.log("測試私有儲存庫連接...", "test");

    const result = this.executeCommand("npm run memory:status", {
      silent: true,
    });

    let passed = result.success;
    let details = "";

    if (!result.success) {
      details = "無法執行 memory:status 指令";
    } else {
      try {
        // 檢查輸出是否包含成功的 JSON 結果
        const lines = result.output.split("\n");
        const jsonLine = lines.find(
          (line) => line.trim().startsWith("{") && line.includes('"success"'),
        );
        if (jsonLine) {
          const statusResult = JSON.parse(jsonLine);
          passed = statusResult.success;
          if (!passed) {
            details = statusResult.error || "私有儲存庫狀態檢查失敗";
          }
        } else {
          // 如果找不到 JSON，但指令執行成功且有輸出，可能仍然正常
          if (result.output.includes("私有儲存庫路徑驗證通過")) {
            passed = true;
          } else {
            passed = false;
            details = "memory:status 輸出格式異常";
          }
        }
      } catch (error) {
        passed = false;
        details = `無法解析 memory:status 輸出: ${error.message}`;
      }
    }

    this.addTestResult("私有儲存庫連接檢查", passed, details);

    return passed;
  }

  // 測試 6: 測試 Conventional Commits 驗證
  testConventionalCommitsValidation() {
    this.log("測試 Conventional Commits 驗證...", "test");

    const { validateCommitMessage } = require("./git-hooks-setup.js");

    const testCases = [
      { message: "feat: 新增功能", shouldPass: true },
      { message: "fix: 修復錯誤", shouldPass: true },
      { message: "docs: 更新文檔", shouldPass: true },
      { message: "feat(blog): 新增文章功能", shouldPass: true },
      { message: "隨便寫的提交訊息", shouldPass: false },
      { message: "FEAT: 大寫不符合規範", shouldPass: false },
    ];

    let allTestsPassed = true;
    let failedCases = [];

    for (const testCase of testCases) {
      const result = validateCommitMessage(testCase.message);
      if (result !== testCase.shouldPass) {
        allTestsPassed = false;
        failedCases.push(
          `"${testCase.message}" 預期${testCase.shouldPass ? "通過" : "失敗"}但結果相反`,
        );
      }
    }

    this.addTestResult(
      "Conventional Commits 驗證測試",
      allTestsPassed,
      failedCases.length > 0 ? failedCases.join("; ") : "",
    );

    return allTestsPassed;
  }

  // 測試 7: 測試代碼品質檢查工具
  testCodeQualityTools() {
    this.log("測試代碼品質檢查工具...", "test");

    // 創建測試檔案
    const testJsFile = path.join(__dirname, "..", "test-temp.js");
    const testJsContent = 'console.log("test");\nvar unused = 1;'; // 故意的品質問題

    fs.writeFileSync(testJsFile, testJsContent);

    try {
      const eslintResult = this.executeCommand("npx eslint test-temp.js", {
        silent: true,
      });

      // ESLint 應該要報告錯誤（因為有品質問題）
      const eslintWorking =
        !eslintResult.success ||
        eslintResult.output.includes("warning") ||
        eslintResult.output.includes("error");

      // 清理測試檔案
      fs.unlinkSync(testJsFile);

      this.addTestResult(
        "代碼品質檢查工具測試",
        eslintWorking,
        eslintWorking ? "" : "ESLint 沒有檢測到預期的代碼品質問題",
      );

      return eslintWorking;
    } catch (error) {
      // 清理測試檔案
      if (fs.existsSync(testJsFile)) {
        fs.unlinkSync(testJsFile);
      }

      this.addTestResult(
        "代碼品質檢查工具測試",
        false,
        `測試執行失敗: ${error.message}`,
      );

      return false;
    }
  }

  // 生成測試報告
  generateTestReport() {
    const totalTests = this.testResults.length;
    const successRate =
      totalTests > 0 ? ((this.passedTests / totalTests) * 100).toFixed(2) : 0;

    const report = {
      summary: {
        totalTests,
        passedTests: this.passedTests,
        failedTests: this.failedTests,
        successRate: `${successRate}%`,
        timestamp: new Date().toISOString(),
      },
      results: this.testResults,
    };

    const reportPath = path.join(__dirname, "..", "test-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    this.log(`測試報告已生成: ${reportPath}`, "info");
    return report;
  }

  // 執行所有測試
  async runAllTests() {
    this.log("🚀 開始執行 AI 協作系統自動化測試", "info");
    this.log("", "info");

    // 執行所有測試
    this.testCoreFilesExistence();
    this.testGitHooksSetup();
    this.testNpmScripts();
    this.testLintingToolsInstallation();
    this.testPrivateRepoConnection();
    this.testConventionalCommitsValidation();
    this.testCodeQualityTools();

    // 生成報告
    const report = this.generateTestReport();

    // 顯示總結
    this.log("", "info");
    this.log("📊 測試結果總結:", "info");
    this.log(`總測試數: ${report.summary.totalTests}`, "info");
    this.log(`通過測試: ${report.summary.passedTests}`, "success");
    this.log(
      `失敗測試: ${report.summary.failedTests}`,
      report.summary.failedTests > 0 ? "error" : "info",
    );
    this.log(
      `成功率: ${report.summary.successRate}`,
      report.summary.successRate === "100.00%" ? "success" : "warning",
    );

    if (this.failedTests > 0) {
      this.log("", "info");
      this.log("❌ 失敗的測試詳情:", "error");
      this.testResults
        .filter((test) => !test.passed)
        .forEach((test) => {
          this.log(`- ${test.name}: ${test.details}`, "error");
        });
    }

    this.log("", "info");
    if (this.failedTests === 0) {
      this.log("🎉 所有測試通過！AI 協作系統運作正常", "success");
    } else {
      this.log("⚠️  部分測試失敗，請檢查上述錯誤並修復", "warning");
    }

    return report;
  }
}

// CLI 接口
async function main() {
  const tester = new SystemTester();
  const report = await tester.runAllTests();

  // 如果有失敗的測試，以非零狀態碼退出
  process.exit(report.summary.failedTests > 0 ? 1 : 0);
}

module.exports = SystemTester;

if (require.main === module) {
  main();
}
