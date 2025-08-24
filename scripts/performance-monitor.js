#!/usr/bin/env node

/**
 * AI 效能監控系統
 * 基於協作日誌分析 AI 工作效率
 */

const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.aiAuthorMap = {
      'Claude': ['Claude', 'claude@anthropic.com'],
      'Codex': ['Codex', 'codex@openai.com'],
      'Gemini': ['Gemini', 'gemini@google.com', 'Mars', 'Marskingx'],
    };

    this.logFilePath = path.join(process.cwd(), 'docs/aimemory/shared/ai-shared.md');
    this.performanceData = {};
  }

  async run() {
    console.log('🤖 **AI 效能監控系統 (基於協作日誌)**');
    console.log('======================================');

    this.initializeData();
    this.analyzeCollaborationLogs();
    this.displayPerformanceDashboard();

    console.log('======================================');
  }

  initializeData() {
    for (const aiName in this.aiAuthorMap) {
      this.performanceData[aiName] = {
        contributions: 0,
        filesChanged: 0,
        tasksCompleted: 0,
      };
    }
  }

  analyzeCollaborationLogs() {
    if (!fs.existsSync(this.logFilePath)) {
      console.warn('⚠️  找不到協作日誌檔案。');
      return;
    }

    const content = fs.readFileSync(this.logFilePath, 'utf8');
    const logSection = content.split(/^##\s+協作日誌/im)[1];

    if (!logSection) return;

    const entryRegex = /###\s+\[[\d\s:-]+\]\s+-\s+([\w\s()]+)([^#]+)/g;
    let match;
    while ((match = entryRegex.exec(logSection)) !== null) {
      const [_, agent, body] = match;
      const aiName = this.getAINameByAuthor(agent.trim());

      if (aiName) {
        const data = this.performanceData[aiName];
        data.contributions++;

        if (body.includes('- 狀態: done')) {
          data.tasksCompleted++;
        }

        const filesMatch = body.match(/- 變更檔: ([^\n]+)/);
        if (filesMatch && filesMatch[1]) {
          data.filesChanged += filesMatch[1].split(',').length;
        }
      }
    }
  }

  displayPerformanceDashboard() {
    console.log('\n📊 **效能儀表板**');
    for (const aiName in this.performanceData) {
      const data = this.performanceData[aiName];
      console.log(`\n--- ${aiName} ---\n`);
      console.log(`   - 總貢獻數 (日誌): ${data.contributions}`);
      console.log(`   - 總變更檔案數 (日誌): ${data.filesChanged}`);
      console.log(`   - 已完成任務數 (日誌): ${data.tasksCompleted}`);
    }
  }

  getAINameByAuthor(author) {
    for (const aiName in this.aiAuthorMap) {
      if (this.aiAuthorMap[aiName].includes(author) || author.startsWith(aiName)) {
        return aiName;
      }
    }
    return null;
  }
}

if (require.main === module) {
  const monitor = new PerformanceMonitor();
  monitor.run().catch(console.error);
}

module.exports = PerformanceMonitor;