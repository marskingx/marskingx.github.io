#!/usr/bin/env node

/**
 * 多 AI Agent 協作管理工具
 * 監控三個 AI 的工作狀態，管理 rebase 工作流程
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class MultiAIManager {
    constructor() {
        this.projectRoot = process.cwd();
        this.aiAgents = [
            { name: 'Claude (克勞德)', branch: 'claude-dev', worktree: null },
            { name: 'Codex', branch: 'codex-dev', worktree: 'D:/marskingx-worktrees/codex-dev' },
            { name: 'Gemini', branch: 'gemini-dev', worktree: 'D:/marskingx-worktrees/gemini-dev' }
        ];
    }

    // 主要執行方法
    async run(command = 'status') {
        console.log('🤖 多 AI Agent 協作管理工具\n');
        console.log('======================================\n');

        switch (command) {
            case 'status':
                await this.checkAllStatus();
                break;
            case 'sync':
                await this.syncAllBranches();
                break;
            case 'conflicts':
                await this.checkConflicts();
                break;
            case 'rebase':
                await this.interactiveRebase();
                break;
            case 'memory':
                await this.syncMemoryFiles();
                break;
            default:
                this.showUsage();
        }
    }

    // 檢查所有 AI 的工作狀態
    async checkAllStatus() {
        console.log('📊 AI Agent 工作狀態檢查\n');

        for (const ai of this.aiAgents) {
            console.log(`🤖 ${ai.name} (${ai.branch}):`);
            
            try {
                const workdir = ai.worktree || this.projectRoot;
                
                // 檢查分支是否存在
                const branchExists = this.branchExists(ai.branch, workdir);
                if (!branchExists) {
                    console.log(`   ❌ 分支 ${ai.branch} 不存在`);
                    continue;
                }

                // 檢查與 main 分支的差異
                const commits = this.getCommitsDiff(ai.branch, workdir);
                console.log(`   📈 領先 main: ${commits.ahead} commits`);
                console.log(`   📉 落後 main: ${commits.behind} commits`);

                // 檢查工作目錄狀態
                const status = this.getWorkdirStatus(workdir);
                if (status.clean) {
                    console.log(`   ✅ 工作目錄乾淨`);
                } else {
                    console.log(`   ⚠️  有未提交變更: ${status.modified} 修改, ${status.untracked} 新增`);
                }

                // 檢查最後活動時間
                const lastCommit = this.getLastCommitInfo(ai.branch, workdir);
                console.log(`   ⏰ 最後提交: ${lastCommit.date} (${lastCommit.author})`);

            } catch (error) {
                console.log(`   ❌ 檢查失敗: ${error.message}`);
            }
            
            console.log();
        }

        // 顯示建議動作
        this.showRecommendations();
    }

    // 同步所有分支與 main
    async syncAllBranches() {
        console.log('🔄 同步所有分支與 main 分支\n');

        // 先更新 main 分支
        console.log('📥 更新 main 分支...');
        try {
            execSync('git checkout main', { cwd: this.projectRoot, stdio: 'pipe' });
            execSync('git pull origin main', { cwd: this.projectRoot, stdio: 'pipe' });
            console.log('✅ main 分支已更新\n');
        } catch (error) {
            console.log('❌ 更新 main 分支失敗\n');
            return;
        }

        // 對每個分支執行 rebase
        for (const ai of this.aiAgents) {
            if (ai.branch === 'main') continue;

            console.log(`🔄 同步 ${ai.name} (${ai.branch}):`);
            
            try {
                const workdir = ai.worktree || this.projectRoot;
                
                if (!this.branchExists(ai.branch, workdir)) {
                    console.log(`   ⚠️  分支不存在，跳過`);
                    continue;
                }

                // 切換到對應分支
                execSync(`git checkout ${ai.branch}`, { cwd: workdir, stdio: 'pipe' });
                
                // 檢查是否有未提交變更
                const status = this.getWorkdirStatus(workdir);
                if (!status.clean) {
                    console.log(`   ⚠️  有未提交變更，請先處理`);
                    continue;
                }

                // 執行 rebase
                execSync(`git rebase main`, { cwd: workdir, stdio: 'pipe' });
                console.log(`   ✅ rebase 成功`);

            } catch (error) {
                if (error.message.includes('CONFLICT')) {
                    console.log(`   ⚠️  發現衝突，需要手動解決`);
                    console.log(`   💡 請到 ${ai.worktree || '主目錄'} 解決衝突後執行:`);
                    console.log(`      git add . && git rebase --continue`);
                } else {
                    console.log(`   ❌ rebase 失敗: ${error.message.split('\n')[0]}`);
                }
            }
            
            console.log();
        }
    }

    // 檢查潛在衝突
    async checkConflicts() {
        console.log('🔍 檢查潛在檔案衝突\n');

        const conflictFiles = new Map();
        
        for (const ai of this.aiAgents) {
            if (ai.branch === 'main') continue;
            
            try {
                const workdir = ai.worktree || this.projectRoot;
                const modifiedFiles = this.getModifiedFiles(ai.branch, workdir);
                
                modifiedFiles.forEach(file => {
                    if (!conflictFiles.has(file)) {
                        conflictFiles.set(file, []);
                    }
                    conflictFiles.get(file).push(ai.name);
                });

            } catch (error) {
                console.log(`⚠️  檢查 ${ai.name} 失敗: ${error.message}`);
            }
        }

        // 顯示潛在衝突
        const potentialConflicts = Array.from(conflictFiles.entries())
            .filter(([file, agents]) => agents.length > 1);

        if (potentialConflicts.length === 0) {
            console.log('✅ 沒有發現潛在的檔案衝突\n');
        } else {
            console.log('⚠️  發現潛在衝突檔案:\n');
            potentialConflicts.forEach(([file, agents]) => {
                console.log(`📄 ${file}`);
                console.log(`   👥 修改者: ${agents.join(', ')}`);
                console.log();
            });
            
            console.log('💡 建議協調處理上述檔案的修改\n');
        }

        this.showFileResponsibilities();
    }

    // 交互式 rebase 助手
    async interactiveRebase() {
        console.log('🔄 交互式 Rebase 助手\n');
        
        // 這裡可以加入互動式選擇邏輯
        console.log('選擇要 rebase 的分支:');
        this.aiAgents.forEach((ai, index) => {
            if (ai.branch !== 'main') {
                console.log(`${index + 1}. ${ai.name} (${ai.branch})`);
            }
        });
        
        console.log('\n💡 請手動選擇或直接使用: npm run ai:sync');
    }

    // 同步記憶檔案
    async syncMemoryFiles() {
        console.log('🧠 同步 AI 記憶檔案\n');
        
        const memoryFiles = ['AI_SHARED.md', 'CLAUDE.md', 'GEMINI.md', 'CODEX.md'];
        const sharedMemoryPath = path.join(this.projectRoot, 'AI_SHARED.md');
        
        if (!fs.existsSync(sharedMemoryPath)) {
            console.log('❌ 共用記憶檔案 AI_SHARED.md 不存在');
            return;
        }

        const sharedContent = fs.readFileSync(sharedMemoryPath, 'utf8');
        const lastUpdate = this.extractLastUpdate(sharedContent);
        
        console.log(`📅 共用記憶最後更新: ${lastUpdate}`);
        
        memoryFiles.forEach(file => {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                console.log(`✅ ${file} 存在`);
            } else {
                console.log(`⚠️  ${file} 不存在`);
            }
        });
        
        console.log('\n💡 建議定期檢查記憶檔案同步狀態');
    }

    // 輔助方法
    branchExists(branch, workdir) {
        try {
            execSync(`git rev-parse --verify ${branch}`, { cwd: workdir, stdio: 'pipe' });
            return true;
        } catch {
            return false;
        }
    }

    getCommitsDiff(branch, workdir) {
        try {
            const result = execSync(`git rev-list --left-right --count main...${branch}`, 
                { cwd: workdir, stdio: 'pipe', encoding: 'utf8' });
            const [behind, ahead] = result.trim().split('\t').map(Number);
            return { ahead, behind };
        } catch {
            return { ahead: 0, behind: 0 };
        }
    }

    getWorkdirStatus(workdir) {
        try {
            const result = execSync('git status --porcelain', 
                { cwd: workdir, stdio: 'pipe', encoding: 'utf8' });
            const lines = result.trim().split('\n').filter(line => line);
            const modified = lines.filter(line => line.startsWith(' M') || line.startsWith('M ')).length;
            const untracked = lines.filter(line => line.startsWith('??')).length;
            
            return { clean: lines.length === 0, modified, untracked };
        } catch {
            return { clean: true, modified: 0, untracked: 0 };
        }
    }

    getLastCommitInfo(branch, workdir) {
        try {
            const date = execSync(`git log -1 --format=%cr ${branch}`, 
                { cwd: workdir, stdio: 'pipe', encoding: 'utf8' }).trim();
            const author = execSync(`git log -1 --format=%an ${branch}`, 
                { cwd: workdir, stdio: 'pipe', encoding: 'utf8' }).trim();
            return { date, author };
        } catch {
            return { date: 'N/A', author: 'N/A' };
        }
    }

    getModifiedFiles(branch, workdir) {
        try {
            const result = execSync(`git diff --name-only main...${branch}`, 
                { cwd: workdir, stdio: 'pipe', encoding: 'utf8' });
            return result.trim().split('\n').filter(line => line);
        } catch {
            return [];
        }
    }

    extractLastUpdate(content) {
        const match = content.match(/最後更新[：:]\s*([^\*\n]+)/);
        return match ? match[1].trim() : '未知';
    }

    showRecommendations() {
        console.log('💡 建議動作:\n');
        console.log('• 如果分支落後 main，執行: npm run ai:sync');
        console.log('• 如果有衝突風險，執行: npm run ai:conflicts');
        console.log('• 定期檢查記憶檔案: npm run ai:memory');
        console.log('• 完整狀態檢查: npm run ai:status\n');
    }

    showFileResponsibilities() {
        console.log('📂 檔案責任區域提醒:\n');
        console.log('• /content/blog/ → 內容創建者優先');
        console.log('• /layouts/ → 克勞德主導');
        console.log('• /scripts/ → Codex 主導');  
        console.log('• /themes/hugoplate/ → 需三 AI 協議');
        console.log('• 配置檔案 → 克勞德統一管理\n');
    }

    showUsage() {
        console.log('使用方式:\n');
        console.log('npm run ai:status    - 檢查所有 AI 狀態');
        console.log('npm run ai:sync      - 同步所有分支');
        console.log('npm run ai:conflicts - 檢查潛在衝突');
        console.log('npm run ai:rebase    - 交互式 rebase');
        console.log('npm run ai:memory    - 檢查記憶檔案\n');
    }
}

// 執行
if (require.main === module) {
    const command = process.argv[2] || 'status';
    const manager = new MultiAIManager();
    manager.run(command).catch(console.error);
}

module.exports = MultiAIManager;