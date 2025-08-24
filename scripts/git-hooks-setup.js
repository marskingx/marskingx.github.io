#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Git Hooks Setup Script
 * 設定 Git hooks 來強制執行 Conventional Commits 標準
 */

const HOOKS_DIR = path.join(__dirname, "..", ".git", "hooks");
const COMMIT_MSG_HOOK = path.join(HOOKS_DIR, "commit-msg");
const PRE_COMMIT_HOOK = path.join(HOOKS_DIR, "pre-commit");

// Conventional Commits 格式驗證
const COMMIT_MSG_SCRIPT = `#!/bin/sh
# Conventional Commits 格式驗證

commit_regex='^(feat|fix|docs|style|refactor|test|chore|ci|build|perf)(\\(.+\\))?: .{1,50}'

error_msg="❌ 提交訊息格式不正確！

請使用 Conventional Commits 格式：
<type>(<scope>): <subject>

類型 (type):
  feat:     新功能
  fix:      錯誤修復
  docs:     文檔更新
  style:    代碼格式 (不影響功能)
  refactor: 代碼重構
  test:     測試相關
  chore:    維護任務
  ci:       CI/CD 相關
  build:    建置相關
  perf:     效能優化

範例:
  feat(blog): 新增文章搜尋功能
  fix(layout): 修復響應式佈局問題
  docs: 更新 README 安裝說明"

if ! grep -qE "$commit_regex" "$1"; then
    echo "$error_msg" >&2
    exit 1
fi
`;

// Pre-commit hook for code quality checks
const PRE_COMMIT_SCRIPT = `#!/bin/sh
# Pre-commit hook for code quality checks

echo "🔍 執行代碼品質檢查..."

# Check if prettier is available
if command -v npx >/dev/null 2>&1; then
    # Format staged files
    echo "📝 格式化代碼..."
    npx prettier --write --ignore-unknown $(git diff --cached --name-only)
    
    # Add formatted files back to staging
    git add $(git diff --cached --name-only)
    
    # Run ESLint on JS files
    JS_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\\.js$' | tr '\\n' ' ')
    if [ ! -z "$JS_FILES" ]; then
        echo "🔍 檢查 JavaScript 代碼品質..."
        npx eslint $JS_FILES
        if [ $? -ne 0 ]; then
            echo "❌ ESLint 檢查失敗！請修復錯誤後重新提交。"
            exit 1
        fi
    fi
    
    # Run Markdownlint on Markdown files
    MD_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\\.md$' | tr '\\n' ' ')
    if [ ! -z "$MD_FILES" ]; then
        echo "📚 檢查 Markdown 文檔品質..."
        npx markdownlint $MD_FILES
        if [ $? -ne 0 ]; then
            echo "❌ Markdownlint 檢查失敗！請修復錯誤後重新提交。"
            exit 1
        fi
    fi
    
    echo "✅ 代碼品質檢查通過！"
else
    echo "⚠️  未安裝 Node.js/npm，跳過代碼品質檢查"
fi
`;

function setupGitHooks() {
  console.log("🚀 設定 Git Hooks...");

  // Create hooks directory if it doesn't exist
  if (!fs.existsSync(HOOKS_DIR)) {
    console.log("❌ .git/hooks 目錄不存在，請確認這是一個 Git 儲存庫");
    process.exit(1);
  }

  try {
    // Write commit-msg hook
    fs.writeFileSync(COMMIT_MSG_HOOK, COMMIT_MSG_SCRIPT);
    fs.chmodSync(COMMIT_MSG_HOOK, "755");
    console.log("✅ 建立 commit-msg hook");

    // Write pre-commit hook
    fs.writeFileSync(PRE_COMMIT_HOOK, PRE_COMMIT_SCRIPT);
    fs.chmodSync(PRE_COMMIT_HOOK, "755");
    console.log("✅ 建立 pre-commit hook");

    console.log("\n🎉 Git Hooks 設定完成！");
    console.log("\n📋 使用說明:");
    console.log("- 提交訊息必須遵循 Conventional Commits 格式");
    console.log("- 提交前會自動格式化代碼並檢查品質");
    console.log("- 如需跳過檢查，使用: git commit --no-verify");
  } catch (error) {
    console.error("❌ 設定 Git Hooks 失敗:", error.message);
    process.exit(1);
  }
}

function validateCommitMessage(message) {
  const commitRegex =
    /^(feat|fix|docs|style|refactor|test|chore|ci|build|perf)(\(.+\))?: .{1,50}/;
  return commitRegex.test(message);
}

// Export for testing
module.exports = {
  setupGitHooks,
  validateCommitMessage,
};

// Run if called directly
if (require.main === module) {
  setupGitHooks();
}
