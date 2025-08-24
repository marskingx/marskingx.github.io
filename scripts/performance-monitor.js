#!/usr/bin/env node

/**
 * AI 效能監控系統
 * 基於 Git 歷史和協作日誌分析 AI 工作效率
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    // AI 名稱與 Git 作者的映射關係 (可擴充)
    this.aiAuthorMap = {
      'Claude': ['Claude', 'claude@anthropic.com'],
      'Codex': ['Codex', 'codex@openai.com'],
      'Gemini': ['Gemini', 'gemini@google.com', 'Mars', 'Marskingx'], // 將 Mars 和 Marskingx 視為 Gemini 的別名
    };

    this.logFilePath = path.join(process.cwd(), 'docs/aimemory/shared/ai-shared.md');
    this.performanceData = {};
  }

  /**
   * 主執行函式
   */
  async run() {
    console.log('🤖 **AI 效能監控系統**');
    console.log('======================================');

    this.initializeData();
    await this.analyzeGitHistory();
    await this.analyzeCollaborationLogs();
    this.displayPerformanceDashboard();

    console.log('======================================');
  }

  initializeData() {
    for (const aiName in this.aiAuthorMap) {
      this.performanceData[aiName] = {
        commits: 0,
        filesChanged: 0,
        insertions: 0,
        deletions: 0,
        tasksCompleted: 0,
      };
    }
  }

  /**
   * 分析 Git 歷史
   */
  async analyzeGitHistory() {
    console.log('\n🔍 正在分析 Git 提交歷史...');
    try {
      // 使用 --numstat 來獲取每個提交的新增/刪除行數和檔案列表
      const logOutput = execSync('git log --pretty=format:"%an---COMMIT_END---" --numstat', { encoding: 'utf8' });
      const entries = logOutput.split(/---COMMIT_END---\n?/);

      entries.forEach(entry => {
        if (!entry.trim()) return;

        const lines = entry.trim().split('\n');
        const author = lines[0].trim();
        const aiName = this.getAINameByAuthor(author);

        if (aiName) {
          this.performanceData[aiName].commits++;
          lines.slice(1).forEach(line => {
            const parts = line.split('\t');
            if (parts.length === 3) {
              this.performanceData[aiName].insertions += parseInt(parts[0], 10) || 0;
              this.performanceData[aiName].deletions += parseInt(parts[1], 10) || 0;
              this.performanceData[aiName].filesChanged++;
            }
          });
        }
      });
    } catch (error) {
      console.error('❌ 分析 Git 歷史失敗:', error.message);
    }
  }

  /**
   *分析協作日誌
   */
  async analyzeCollaborationLogs() {
    console.log('\n📝 正在分析協作日誌...');
    if (!fs.existsSync(this.logFilePath)) {
      console.warn('⚠️  找不到協作日誌檔案，跳過分析。');
      return;
    }

    const content = fs.readFileSync(this.logFilePath, 'utf8');
    const logSection = content.split(/^##\s+協作日誌/im)[1];

    if (!logSection) return;

    const entryRegex = /###\s+\[[\d\s:-]+\]\s+-\s+([\w\s()]+)([^#]+)/g;
    let match;
    while ((match = entryRegex.exec(logSection)) !== null) {
      const [_, agent, body] = match;
      const aiName = this.getAINameByAuthor(agent.trim()); // 使用 Author 映射來歸一化名稱

      if (aiName && body.includes('- 狀態: done')) {
        if (this.performanceData[aiName]) {
          this.performanceData[aiName].tasksCompleted++;
        }
      }
    }
  }

  /**
   * 顯示效能儀表板
   */
  displayPerformanceDashboard() {
    console.log('\n📊 **效能儀表板**');
    for (const aiName in this.performanceData) {
      const data = this.performanceData[aiName];
      console.log(`\n--- ${aiName} ---
`);
      console.log(`   - 總提交數: ${data.commits}`);
      console.log(`   - 總變更檔案數: ${data.filesChanged}`);
      console.log(`   - 總新增行數: ${data.insertions}`);
      console.log(`   - 總刪除行數: ${data.deletions}`);
      console.log(`   - 已完成任務數: ${data.tasksCompleted} (來自日誌)`);
    }
  }

  getAINameByAuthor(author) {
    for (const aiName in this.aiAuthorMap) {
      if (this.aiAuthorMap[aiName].includes(author)) {
        return aiName;
      }
    }
    return null;
  }
}

// --- CLI 介面 ---
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  monitor.run().catch(console.error);
}

module.exports = PerformanceMonitor;
