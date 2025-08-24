#!/usr/bin/env node

/**
 * 工作日誌智能分析系統
 * 分析 docs/aimemory/shared/ai-shared.md 中的協作日誌
 */

const fs = require('fs');
const path = require('path');

class LogAnalyzer {
  constructor() {
    this.logFilePath = path.join(process.cwd(), 'docs/aimemory/shared/ai-shared.md');
    this.logEntries = [];
  }

  /**
   * 載入並解析日誌檔案
   */
  loadAndParseLogs() {
    if (!fs.existsSync(this.logFilePath)) {
      console.error(`❌ 找不到日誌檔案: ${this.logFilePath}`);
      return false;
    }

    const content = fs.readFileSync(this.logFilePath, 'utf8');
    const logSection = content.split(/^##\s+協作日誌/im)[1];

    if (!logSection) {
      console.log('💡 找不到協作日誌區段，無需分析。');
      return false;
    }

    const entryRegex = /###\s+\[([\d\s:-]+)\]\s+-\s+([\w\s()]+)([^#]+)/g;
    let match;
    while ((match = entryRegex.exec(logSection)) !== null) {
      const [_, timestamp, agent, body] = match;
      const entry = {
        timestamp: new Date(timestamp.trim()),
        agent: agent.trim(),
        body: body.trim(),
      };

      // 從 body 中解析詳細資訊
      const lines = body.split('\n').map(l => l.trim());
      lines.forEach(line => {
        if (line.startsWith('- 任務:')) entry.task = line.substring(6).trim();
        if (line.startsWith('- 摘要:')) entry.summary = line.substring(6).trim();
        if (line.startsWith('- 變更檔:')) entry.files = line.substring(8).trim().split(',').map(f => f.trim());
        if (line.startsWith('- 狀態:')) entry.status = line.substring(6).trim();
        if (line.startsWith('- 版本:')) entry.version = line.substring(6).trim();
      });

      this.logEntries.push(entry);
    }
    
    console.log(`✅ 成功解析 ${this.logEntries.length} 條日誌記錄。\n`);
    return true;
  }

  /**
   * 主執行函式
   */
  run(command = 'analyze', options = {}) {
    if (!this.loadAndParseLogs()) return;

    switch (command) {
      case 'report':
        this.generateReport(options.days || 7);
        break;
      case 'trends':
        this.analyzeTrends();
        break;
      case 'analyze':
      default:
        this.showGeneralAnalysis();
        break;
    }
  }

  showGeneralAnalysis() {
    console.log('📊 **通用日誌分析**');
    console.log('======================================');

    if (this.logEntries.length === 0) {
      console.log('沒有可分析的日誌。');
      return;
    }

    // 1. 按 AI 統計工作量
    const agentCounts = this.logEntries.reduce((acc, entry) => {
      acc[entry.agent] = (acc[entry.agent] || 0) + 1;
      return acc;
    }, {});

    console.log('\n🤖 **AI 工作量統計:**');
    Object.entries(agentCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([agent, count]) => {
        console.log(`   - ${agent.padEnd(20)}: ${count} 條日誌`);
      });

    // 2. 顯示最新 5 條活動
    console.log('\n🕒 **最新活動:**');
    this.logEntries
      .slice(0, 5)
      .forEach(entry => {
        const task = entry.task || (entry.summary ? entry.summary.slice(0, 30) + '...' : 'N/A');
        console.log(`   - [${entry.timestamp.toLocaleDateString()}] ${entry.agent}: ${task}`);
      });
    console.log('\n======================================');
  }

  generateReport(days) {
    console.log(`📈 **${days} 日協作報告**`);
    console.log('======================================');

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const recentEntries = this.logEntries.filter(entry => entry.timestamp >= sinceDate);

    if (recentEntries.length === 0) {
      console.log(`在過去 ${days} 天內沒有日誌記錄。`);
      return;
    }

    const agentActivity = recentEntries.reduce((acc, entry) => {
      acc[entry.agent] = (acc[entry.agent] || 0) + 1;
      return acc;
    }, {});

    const totalFilesChanged = recentEntries.reduce((acc, entry) => acc + (entry.files ? entry.files.length : 0), 0);

    console.log(`\n**報告期間:** ${sinceDate.toLocaleDateString()} - ${new Date().toLocaleDateString()}`);
    console.log(`**總日誌數:** ${recentEntries.length}`);
    console.log(`**總變更檔案數:** ${totalFilesChanged}`);
    console.log('**參與的 AI:**', Object.keys(agentActivity).join(', '));

    console.log('\n**各 AI 活動量:**');
    Object.entries(agentActivity)
      .forEach(([agent, count]) => {
        console.log(`   - ${agent.padEnd(20)}: ${count} 次貢獻`);
      });
    
    console.log('\n======================================');
  }

  analyzeTrends() {
    console.log('📉 **工作趨勢分析**');
    console.log('======================================');

    const keywords = ['fix', 'feat', 'refactor', 'style', 'docs', 'test', 'seo', 'content', 'chore', 'build'];
    const trendCounts = keywords.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
    let otherCount = 0;

    this.logEntries.forEach(entry => {
      const text = `${entry.task || ''} ${entry.summary || ''}`.toLowerCase();
      let found = false;
      for (const key of keywords) {
        if (text.includes(key)) {
          trendCounts[key]++;
          found = true;
          break; // 每個日誌只計入一個趨勢分類
        }
      }
      if (!found) otherCount++;
    });

    console.log('\n**工作類型分佈:**');
    Object.entries(trendCounts)
      .filter(([, count]) => count > 0) // 只顯示有活動的類型
      .sort(([, a], [, b]) => b - a)
      .forEach(([key, count]) => {
        const percentage = ((count / this.logEntries.length) * 100).toFixed(1);
        console.log(`   - ${key.charAt(0).toUpperCase() + key.slice(1).padEnd(15)}: ${count} 次 (${percentage}%)`);
      });
    
    if (otherCount > 0) {
        const percentage = ((otherCount / this.logEntries.length) * 100).toFixed(1);
        console.log(`   - ${'Other'.padEnd(16)}: ${otherCount} 次 (${percentage}%)`);
    }
    console.log('\n======================================');
  }
}

// --- CLI 介面 ---
function showUsage() {
  console.log('\n📊 工作日誌智能分析系統');
  console.log('\n使用方式:');
  console.log('  node scripts/log-analyzer.js <command> [options]');
  console.log('\n指令:');
  console.log('  analyze     - 顯示通用分析 (預設)');
  console.log('  report      - 生成協作報告');
  console.log('  trends      - 分析工作趨勢');
  console.log('\n選項:');
  console.log('  --days <天數> - (搭配 report) 指定報告的時間範圍，預設 7 天');
  console.log('\n範例:');
  console.log('  node scripts/log-analyzer.js report --days 30');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args.find(arg => !arg.startsWith('--')) || 'analyze';
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i+1] && !args[i+1].startsWith('--') ? args[i+1] : true;
      options[key] = value;
    }
  }
  
  if (command === '--help') {
    showUsage();
  } else {
    const analyzer = new LogAnalyzer();
    analyzer.run(command, options);
  }
}

module.exports = LogAnalyzer;