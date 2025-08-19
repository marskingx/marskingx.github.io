#!/usr/bin/env node

/**
 * Claude Code 記憶管理工具
 * 用於管理 CLAUDE.md 檔案的內容更新與維護
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CLAUDE_MEMORY_PATH = path.join(process.cwd(), 'CLAUDE.md');
const BACKUP_DIR = path.join(process.cwd(), '.claude-backups');

class ClaudeMemoryManager {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.ensureBackupDir();
    }

    ensureBackupDir() {
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }
    }

    async prompt(question) {
        return new Promise((resolve) => {
            this.rl.question(question, resolve);
        });
    }

    createBackup() {
        if (fs.existsSync(CLAUDE_MEMORY_PATH)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
            const backupPath = path.join(BACKUP_DIR, `CLAUDE-${timestamp}.md`);
            fs.copyFileSync(CLAUDE_MEMORY_PATH, backupPath);
            console.log(`✅ 備份已建立: ${backupPath}`);
            return backupPath;
        }
        return null;
    }

    readMemoryFile() {
        if (!fs.existsSync(CLAUDE_MEMORY_PATH)) {
            console.log('❌ CLAUDE.md 檔案不存在');
            return null;
        }
        return fs.readFileSync(CLAUDE_MEMORY_PATH, 'utf8');
    }

    writeMemoryFile(content) {
        fs.writeFileSync(CLAUDE_MEMORY_PATH, content, 'utf8');
        console.log('✅ CLAUDE.md 已更新');
    }

    async addCommand() {
        const content = this.readMemoryFile();
        if (!content) return;

        console.log('\\n📝 新增開發指令');
        const command = await this.prompt('指令名稱: ');
        const description = await this.prompt('指令說明: ');
        const code = await this.prompt('指令內容: ');

        const newCommand = `
# ${description}
${code}`;

        // 在重要開發指令區段後添加
        const commandSection = '## 重要開發指令';
        const insertPos = content.indexOf('```', content.indexOf(commandSection)) + 3;
        
        const updatedContent = content.slice(0, insertPos) + newCommand + content.slice(insertPos);
        
        this.createBackup();
        this.writeMemoryFile(updatedContent);
    }

    async addSolution() {
        const content = this.readMemoryFile();
        if (!content) return;

        console.log('\\n🔧 新增解決方案');
        const problem = await this.prompt('問題描述: ');
        const solution = await this.prompt('解決方案: ');
        const steps = await this.prompt('執行步驟 (用 ; 分隔): ');

        const stepsArray = steps.split(';').map((step, i) => `${i + 1}. ${step.trim()}`);
        
        const newSolution = `
### ${problem}
${solution}
${stepsArray.join('\\n')}
`;

        // 在常用操作與解決方案區段添加
        const solutionSection = '## 常用操作與解決方案';
        const nextSection = content.indexOf('##', content.indexOf(solutionSection) + solutionSection.length);
        const insertPos = nextSection > 0 ? nextSection : content.length;
        
        const updatedContent = content.slice(0, insertPos) + newSolution + '\\n' + content.slice(insertPos);
        
        this.createBackup();
        this.writeMemoryFile(updatedContent);
    }

    async addTodo() {
        const content = this.readMemoryFile();
        if (!content) return;

        console.log('\\n📋 新增待辦事項');
        const todo = await this.prompt('待辦事項: ');
        
        const todoLine = `- [ ] ${todo}`;
        
        // 在待辦事項區段添加
        const todoSection = '## 待辦事項';
        const nextSection = content.indexOf('---', content.indexOf(todoSection));
        const insertPos = nextSection > 0 ? nextSection : content.length;
        
        const updatedContent = content.slice(0, insertPos) + todoLine + '\\n' + content.slice(insertPos);
        
        this.createBackup();
        this.writeMemoryFile(updatedContent);
    }

    async updateConfig() {
        const content = this.readMemoryFile();
        if (!content) return;

        console.log('\\n⚙️ 更新配置資訊');
        const configType = await this.prompt('配置類型 (hugo/service/other): ');
        const configName = await this.prompt('配置名稱: ');
        const configValue = await this.prompt('配置值: ');
        
        const newConfig = `- **${configName}**: ${configValue}`;
        
        let section;
        if (configType === 'hugo') {
            section = '### Hugo 基本配置 (hugo.toml)';
        } else if (configType === 'service') {
            section = '### 服務整合';
        } else {
            section = '## 重要配置設定';
        }
        
        const sectionEnd = content.indexOf('###', content.indexOf(section) + section.length);
        const insertPos = sectionEnd > 0 ? sectionEnd : content.indexOf('##', content.indexOf(section) + section.length);
        
        const updatedContent = content.slice(0, insertPos) + newConfig + '\\n' + content.slice(insertPos);
        
        this.createBackup();
        this.writeMemoryFile(updatedContent);
    }

    showStatus() {
        const content = this.readMemoryFile();
        if (!content) return;

        console.log('\\n📊 CLAUDE.md 狀態');
        console.log('━━━━━━━━━━━━━━━━━━━━');
        
        const lines = content.split('\\n');
        const sections = lines.filter(line => line.startsWith('##')).length;
        const todos = lines.filter(line => line.includes('- [ ]')).length;
        const commands = (content.match(/```bash[\\s\\S]*?```/g) || []).length;
        
        console.log(`📁 區段數量: ${sections}`);
        console.log(`📋 待辦事項: ${todos}`);
        console.log(`⚡ 開發指令: ${commands}`);
        console.log(`📄 檔案大小: ${Math.round(fs.statSync(CLAUDE_MEMORY_PATH).size / 1024 * 100) / 100} KB`);
        
        const backups = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('CLAUDE-'));
        console.log(`💾 備份數量: ${backups.length}`);
    }

    async showMenu() {
        console.log('\\n🤖 Claude Code 記憶管理工具');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('1. 新增開發指令');
        console.log('2. 新增解決方案');
        console.log('3. 新增待辦事項');
        console.log('4. 更新配置資訊');
        console.log('5. 查看狀態');
        console.log('6. 建立備份');
        console.log('0. 退出');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const choice = await this.prompt('請選擇操作 (0-6): ');

        switch (choice) {
            case '1':
                await this.addCommand();
                break;
            case '2':
                await this.addSolution();
                break;
            case '3':
                await this.addTodo();
                break;
            case '4':
                await this.updateConfig();
                break;
            case '5':
                this.showStatus();
                break;
            case '6':
                this.createBackup();
                break;
            case '0':
                console.log('\\n👋 再見！');
                this.rl.close();
                return;
            default:
                console.log('❌ 無效的選擇');
        }

        await this.showMenu();
    }

    async start() {
        console.log('\\n🚀 歡迎使用 Claude Code 記憶管理工具');
        await this.showMenu();
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    const manager = new ClaudeMemoryManager();
    manager.start().catch(console.error);
}

module.exports = ClaudeMemoryManager;