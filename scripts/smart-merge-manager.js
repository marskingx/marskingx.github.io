#!/usr/bin/env node

/**
 * 智能併版管理器 (Smart Merge Manager)
 * 提供智能化分支合併功能，支援多種合併策略和自動衝突檢測
 */

const { execSync } = require('child_process');
const fs = require('fs');

class SmartMergeManager {
  constructor() {
    this.mergeStrategies = {
      'fast-forward': '快速合併 (適合無分歧的線性歷史)',
      'no-fast-forward': '保留合併 (保留分支歷史記錄)',
      'squash': '壓縮合併 (多個提交壓縮為一個)',
      'rebase': '變基合併 (重新整理提交歷史)'
    };
  }

  log(message, type = 'info') {
    const icons = {
      info: '📝',
      success: '✅', 
      warning: '⚠️',
      error: '❌',
      merge: '🔀',
      analyze: '🔍',
      clean: '🧹'
    };
    console.log(`${icons[type]} ${message}`);
  }

  executeCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        cwd: options.cwd || process.cwd(),
        ...options
      });
      return result;
    } catch (error) {
      if (options.ignoreError) return null;
      throw new Error(`指令執行失敗: ${command}\n${error.message}`);
    }
  }

  // 分析分支狀態
  analyzeBranchStatus() {
    this.log('分析分支狀態...', 'analyze');
    
    try {
      // 檢查當前分支
      const currentBranch = this.executeCommand('git branch --show-current', { silent: true }).trim();
      
      // 檢查工作目錄狀態
      const gitStatus = this.executeCommand('git status --porcelain', { silent: true }).trim();
      const isClean = gitStatus === '';
      
      // 獲取遠端分支列表
      this.executeCommand('git fetch --all', { silent: true });
      const remoteBranches = this.executeCommand('git branch -r', { silent: true })
        .split('\n')
        .map(branch => branch.trim())
        .filter(branch => branch && !branch.includes('HEAD'))
        .map(branch => branch.replace('origin/', ''));

      // 分析分支差異
      const branchAnalysis = {};
      for (const branch of remoteBranches) {
        if (branch === currentBranch) continue;
        
        try {
          // 檢查分支是否領先主分支
          const aheadBehind = this.executeCommand(
            `git rev-list --count --left-right ${currentBranch}...origin/${branch}`, 
            { silent: true }
          ).trim().split('\t');
          
          const behind = parseInt(aheadBehind[0]) || 0;
          const ahead = parseInt(aheadBehind[1]) || 0;
          
          if (ahead > 0 || behind > 0) {
            branchAnalysis[branch] = { ahead, behind };
          }
        } catch (e) {
          // 忽略無法比較的分支
        }
      }

      return {
        currentBranch,
        isClean,
        remoteBranches,
        branchAnalysis,
        gitStatus
      };
    } catch (error) {
      throw new Error(`分支狀態分析失敗: ${error.message}`);
    }
  }

  // 檢測合併衝突
  detectMergeConflicts(sourceBranch, targetBranch = 'main') {
    this.log(`檢測 ${sourceBranch} -> ${targetBranch} 合併衝突...`, 'analyze');
    
    try {
      // 建立臨時合併測試
      const tempBranch = `temp-merge-test-${Date.now()}`;
      
      // 建立臨時分支進行測試合併
      this.executeCommand(`git checkout -b ${tempBranch}`, { silent: true });
      
      let hasConflicts = false;
      let conflictFiles = [];
      
      try {
        // 嘗試合併
        this.executeCommand(`git merge origin/${sourceBranch} --no-commit --no-ff`, { silent: true });
      } catch (error) {
        if (error.message.includes('conflict')) {
          hasConflicts = true;
          // 獲取衝突檔案列表
          const conflictOutput = this.executeCommand('git diff --name-only --diff-filter=U', { silent: true });
          conflictFiles = conflictOutput.trim().split('\n').filter(Boolean);
        }
      }

      // 清理臨時分支
      this.executeCommand('git merge --abort', { silent: true, ignoreError: true });
      this.executeCommand(`git checkout ${targetBranch}`, { silent: true });
      this.executeCommand(`git branch -D ${tempBranch}`, { silent: true });

      return { hasConflicts, conflictFiles };
    } catch (error) {
      this.log(`衝突檢測失敗: ${error.message}`, 'error');
      return { hasConflicts: true, conflictFiles: [] };
    }
  }

  // 選擇最佳合併策略
  selectMergeStrategy(branchInfo, conflictInfo) {
    const { ahead, behind } = branchInfo;
    const { hasConflicts } = conflictInfo;

    // 如果有衝突，建議使用 rebase 策略
    if (hasConflicts) {
      return 'rebase';
    }

    // 如果目標分支沒有新提交，使用快速合併
    if (behind === 0) {
      return 'fast-forward';
    }

    // 如果源分支只有少量提交，建議壓縮合併
    if (ahead <= 3) {
      return 'squash';
    }

    // 默認使用保留歷史的合併
    return 'no-fast-forward';
  }

  // 執行合併
  async performMerge(sourceBranch, targetBranch = 'main', strategy = 'auto') {
    this.log(`開始智能併版: ${sourceBranch} -> ${targetBranch}`, 'merge');
    
    // 1. 分析分支狀態
    const status = this.analyzeBranchStatus();
    
    if (!status.isClean) {
      throw new Error('工作目錄不乾淨，請先提交或儲藏變更');
    }

    if (status.currentBranch !== targetBranch) {
      this.log(`切換到目標分支: ${targetBranch}`, 'info');
      this.executeCommand(`git checkout ${targetBranch}`);
    }

    // 2. 檢查分支差異
    if (!status.branchAnalysis[sourceBranch]) {
      throw new Error(`找不到分支 ${sourceBranch} 或該分支與 ${targetBranch} 沒有差異`);
    }

    const branchInfo = status.branchAnalysis[sourceBranch];
    this.log(`分支分析: ${sourceBranch} 領先 ${branchInfo.ahead} 個提交，落後 ${branchInfo.behind} 個提交`, 'analyze');

    // 3. 檢測衝突
    const conflictInfo = this.detectMergeConflicts(sourceBranch, targetBranch);
    
    if (conflictInfo.hasConflicts) {
      this.log(`檢測到 ${conflictInfo.conflictFiles.length} 個檔案衝突:`, 'warning');
      conflictInfo.conflictFiles.forEach(file => this.log(`  - ${file}`, 'warning'));
    }

    // 4. 選擇合併策略
    if (strategy === 'auto') {
      strategy = this.selectMergeStrategy(branchInfo, conflictInfo);
    }

    this.log(`選擇合併策略: ${strategy} (${this.mergeStrategies[strategy]})`, 'info');

    // 5. 執行合併
    try {
      await this.executeMergeStrategy(sourceBranch, targetBranch, strategy);
      this.log(`併版成功完成! ${sourceBranch} -> ${targetBranch}`, 'success');
      
      // 6. 合併後驗證
      await this.postMergeValidation();
      
      return { success: true, strategy, branchInfo, conflictInfo };
    } catch (error) {
      this.log(`併版失敗: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // 執行具體的合併策略
  async executeMergeStrategy(sourceBranch, targetBranch, strategy) {
    switch (strategy) {
      case 'fast-forward':
        this.executeCommand(`git merge origin/${sourceBranch} --ff-only`);
        break;

      case 'no-fast-forward':
        this.executeCommand(`git merge origin/${sourceBranch} --no-ff -m "merge: 併版 ${sourceBranch} 到 ${targetBranch}

🔀 智能併版操作
- 來源分支: ${sourceBranch}
- 目標分支: ${targetBranch}
- 合併策略: 保留分支歷史
- 執行者: Claude Code 智能併版系統"`);
        break;

      case 'squash':
        this.executeCommand(`git merge origin/${sourceBranch} --squash`);
        this.executeCommand(`git commit -m "merge: 壓縮併版 ${sourceBranch} 到 ${targetBranch}

🔀 智能併版操作 (壓縮模式)
- 來源分支: ${sourceBranch}  
- 目標分支: ${targetBranch}
- 合併策略: 多提交壓縮為單一提交
- 執行者: Claude Code 智能併版系統"`);
        break;

      case 'rebase':
        // 先將來源分支變基到目標分支
        this.executeCommand(`git checkout origin/${sourceBranch}`);
        this.executeCommand(`git rebase ${targetBranch}`);
        this.executeCommand(`git checkout ${targetBranch}`);
        this.executeCommand(`git merge origin/${sourceBranch} --ff-only`);
        break;

      default:
        throw new Error(`未知的合併策略: ${strategy}`);
    }
  }

  // 合併後驗證
  async postMergeValidation() {
    this.log('執行合併後驗證...', 'analyze');
    
    try {
      // 檢查是否有未解決的衝突
      const conflicts = this.executeCommand('git diff --name-only --diff-filter=U', { silent: true }).trim();
      if (conflicts) {
        throw new Error(`仍有未解決的衝突檔案: ${conflicts}`);
      }

      // 檢查系統完整性
      this.executeCommand(`${process.execPath} scripts/system-test.js`, { silent: true });
      
      this.log('合併驗證通過', 'success');
    } catch (error) {
      this.log(`合併後驗證失敗: ${error.message}`, 'warning');
      throw error;
    }
  }

  // 列出可併版的分支
  listMergeableBranches() {
    this.log('分析可併版分支...', 'analyze');
    
    const status = this.analyzeBranchStatus();
    const mergeableBranches = [];

    for (const [branch, info] of Object.entries(status.branchAnalysis)) {
      if (info.ahead > 0) {
        const conflictInfo = this.detectMergeConflicts(branch, status.currentBranch);
        mergeableBranches.push({
          branch,
          ahead: info.ahead,
          behind: info.behind,
          hasConflicts: conflictInfo.hasConflicts,
          conflictFiles: conflictInfo.conflictFiles,
          recommendedStrategy: this.selectMergeStrategy(info, conflictInfo)
        });
      }
    }

    return mergeableBranches;
  }

  // 顯示合併建議
  showMergeSuggestions() {
    const branches = this.listMergeableBranches();
    
    if (branches.length === 0) {
      this.log('目前沒有可併版的分支', 'info');
      return;
    }

    this.log('\n📋 可併版分支分析:', 'merge');
    
    branches.forEach((branch, index) => {
      this.log(`\n${index + 1}. ${branch.branch}`, 'info');
      this.log(`   📈 領先: ${branch.ahead} 個提交`, 'info');
      this.log(`   📉 落後: ${branch.behind} 個提交`, 'info');
      this.log(`   🎯 建議策略: ${branch.recommendedStrategy}`, 'info');
      
      if (branch.hasConflicts) {
        this.log(`   ⚠️  衝突檔案: ${branch.conflictFiles.length} 個`, 'warning');
        branch.conflictFiles.slice(0, 3).forEach(file => {
          this.log(`      - ${file}`, 'warning');
        });
        if (branch.conflictFiles.length > 3) {
          this.log(`      ... 還有 ${branch.conflictFiles.length - 3} 個檔案`, 'warning');
        }
      } else {
        this.log(`   ✅ 無衝突`, 'success');
      }
    });

    this.log('\n💡 使用方式:', 'info');
    this.log('  npm run 併版 <branch-name>     # 智能併版指定分支', 'info');
    this.log('  npm run 併版 <branch> <strategy> # 指定合併策略', 'info');
  }

  // 清理合併相關的臨時檔案
  cleanup() {
    this.log('清理合併臨時檔案...', 'clean');
    
    try {
      // 清理可能的合併狀態
      this.executeCommand('git merge --abort', { silent: true, ignoreError: true });
      this.executeCommand('git rebase --abort', { silent: true, ignoreError: true });
      
      // 刪除臨時分支
      const tempBranches = this.executeCommand('git branch --list temp-merge-*', { silent: true }).trim();
      if (tempBranches) {
        tempBranches.split('\n').forEach(branch => {
          const branchName = branch.trim().replace(/^\*\s*/, '');
          if (branchName) {
            this.executeCommand(`git branch -D ${branchName}`, { silent: true, ignoreError: true });
          }
        });
      }
      
      this.log('清理完成', 'success');
    } catch (error) {
      this.log(`清理過程中出現錯誤: ${error.message}`, 'warning');
    }
  }

  showHelp() {
    console.log(`
🔀 智能併版管理系統

使用方式:
  node smart-merge-manager.js <command> [options]

指令:
  analyze                          # 分析可併版分支
  merge <branch> [strategy]        # 併版指定分支
  list                            # 列出可併版分支  
  cleanup                         # 清理合併臨時檔案
  help                           # 顯示幫助資訊

合併策略:
  auto                           # 自動選擇最佳策略 (默認)
  fast-forward                   # 快速合併
  no-fast-forward               # 保留分支歷史
  squash                         # 壓縮多個提交為一個
  rebase                         # 變基後合併

範例:
  node smart-merge-manager.js analyze
  node smart-merge-manager.js merge codex-dev
  node smart-merge-manager.js merge gemini-dev squash
  node smart-merge-manager.js list
    `);
  }
}

// CLI 介面
async function main() {
  const manager = new SmartMergeManager();
  const [command, ...args] = process.argv.slice(2);

  try {
    switch (command) {
      case 'analyze':
        manager.showMergeSuggestions();
        break;

      case 'merge':
        if (!args[0]) {
          console.error('❌ 請指定要併版的分支名稱');
          process.exit(1);
        }
        const result = await manager.performMerge(args[0], 'main', args[1] || 'auto');
        if (!result.success) {
          process.exit(1);
        }
        break;

      case 'list':
        manager.showMergeSuggestions();
        break;

      case 'cleanup':
        manager.cleanup();
        break;

      case 'help':
      case undefined:
        manager.showHelp();
        break;

      default:
        console.error(`❌ 未知指令: ${command}`);
        manager.showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ 執行失敗: ${error.message}`);
    process.exit(1);
  }
}

module.exports = SmartMergeManager;

if (require.main === module) {
  main();
}