#!/usr/bin/env node

/**
 * 智能 Context 載入系統
 * 根據任務類型和AI角色自動載入相關記憶和配置
 */

const fs = require('fs');
const path = require('path');

class SmartContextLoader {
  constructor() {
    this.projectRoot = process.cwd();
    this.memoryDir = path.join(this.projectRoot, 'docs/aimemory');

    // AI角色定義
    this.aiRoles = {
      claude: {
        name: 'Claude',
        strengths: ['main-dev', 'version-control', 'project-coordination'],
        memoryFile: 'claude/claude.md',
        contextPriority: ['shared', 'claude', 'version-control']
      },
      codex: {
        name: 'Codex',
        strengths: ['code-generation', 'automation', 'performance'],
        memoryFile: 'codex/codex.md',
        contextPriority: ['shared', 'codex', 'scripts']
      },
      gemini: {
        name: 'Gemini',
        strengths: ['seo-optimization', 'content-analysis', 'experiments'],
        memoryFile: 'gemini/gemini.md',
        contextPriority: ['shared', 'gemini', 'seo']
      }
    };

    // 任務類型與Context映射
    this.taskContextMap = {
      'version-control': {
        priority: ['shared/ai-shared.md', 'claude/claude.md', 'docs/version-control/'],
        description: '版本控制、發布管理相關任務'
      },
      'seo-optimization': {
        priority: ['shared/SEO/', 'gemini/gemini.md', 'shared/ai-shared.md'],
        description: 'SEO優化、結構化資料相關任務'
      },
      'automation-scripts': {
        priority: ['codex/codex.md', 'shared/ai-shared.md', 'scripts/'],
        description: '自動化腳本開發和維護'
      },
      'content-management': {
        priority: ['shared/ai-shared.md', 'gemini/gemini.md', 'content/blog/'],
        description: '內容創建、編輯和管理'
      },
      'collaboration': {
        priority: ['shared/ai-shared.md', 'shared/mission/', 'docs/aimemory/README.md'],
        description: '多AI協作相關任務'
      },
      'hugo-development': {
        priority: ['shared/hugo/', 'claude/claude.md', 'shared/ai-shared.md'],
        description: 'Hugo網站開發和佈局'
      },
      'performance': {
        priority: ['codex/codex.md', 'shared/ai-shared.md', 'scripts/'],
        description: '效能優化和分析'
      }
    };
  }

  /**
   * 智能載入Context
   * @param {string} aiRole - AI角色 (claude/codex/gemini)
   * @param {string} taskType - 任務類型
   * @param {Object} options - 載入選項
   */
  async loadContext(aiRole, taskType, options = {}) {
    console.log(`🧠 智能 Context 載入系統`);
    console.log(`======================================`);
    console.log(`🤖 AI: ${this.aiRoles[aiRole]?.name || aiRole}`);
    console.log(`📋 任務類型: ${taskType}`);
    console.log('');

    const context = {
      aiRole,
      taskType,
      loadedFiles: [],
      coreMemory: {},
      taskSpecificInfo: {},
      suggestions: [],
      timestamp: new Date().toISOString()
    };

    try {
      // 1. 載入AI個人記憶
      await this.loadAIMemory(context);

      // 2. 載入任務相關Context
      await this.loadTaskContext(context);

      // 3. 載入共用記憶
      await this.loadSharedMemory(context);

      // 4. 生成智能建議
      await this.generateSuggestions(context);

      // 5. 輸出Context總結
      this.displayContextSummary(context);

      // 6. 可選：保存Context到暫存檔案
      if (options.save) {
        this.saveContext(context);
      }

      return context;

    } catch (error) {
      console.error('❌ Context載入失敗:', error.message);
      return null;
    }
  }

  /**
   * 載入AI個人記憶
   */
  async loadAIMemory(context) {
    const aiRole = this.aiRoles[context.aiRole];
    if (!aiRole) return;

    const memoryPath = path.join(this.memoryDir, aiRole.memoryFile);
    if (fs.existsSync(memoryPath)) {
      const content = fs.readFileSync(memoryPath, 'utf8');
      context.coreMemory.personal = {
        path: memoryPath,
        content,
        strengths: aiRole.strengths,
        contextPriority: aiRole.contextPriority
      };
      context.loadedFiles.push(memoryPath);
      console.log(`✅ 載入個人記憶: ${aiRole.memoryFile}`);
    }
  }

  /**
   * 載入任務相關Context
   */
  async loadTaskContext(context) {
    const taskInfo = this.taskContextMap[context.taskType];
    if (!taskInfo) {
      console.log(`⚠️  未知任務類型: ${context.taskType}`);
      return;
    }

    console.log(`📋 任務描述: ${taskInfo.description}`);
    context.taskSpecificInfo.description = taskInfo.description;
    context.taskSpecificInfo.files = [];

    // 載入任務優先檔案
    for (const filePath of taskInfo.priority) {
      const fullPath = path.join(this.memoryDir, filePath);

      if (fs.existsSync(fullPath)) {
        if (fs.statSync(fullPath).isDirectory()) {
          // 載入目錄中的重要檔案
          const files = fs.readdirSync(fullPath)
            .filter(f => f.endsWith('.md'))
            .slice(0, 3); // 限制數量避免過載

          for (const file of files) {
            const fileFullPath = path.join(fullPath, file);
            const content = fs.readFileSync(fileFullPath, 'utf8');
            context.taskSpecificInfo.files.push({
              path: fileFullPath,
              content: content.slice(0, 2000) // 限制內容長度
            });
            context.loadedFiles.push(fileFullPath);
          }
          console.log(`✅ 載入目錄: ${filePath} (${files.length} 檔案)`);
        } else {
          // 載入單一檔案
          const content = fs.readFileSync(fullPath, 'utf8');
          context.taskSpecificInfo.files.push({
            path: fullPath,
            content: content.slice(0, 3000) // 重要檔案允許更多內容
          });
          context.loadedFiles.push(fullPath);
          console.log(`✅ 載入檔案: ${filePath}`);
        }
      } else {
        console.log(`⚠️  檔案不存在: ${filePath}`);
      }
    }
  }

  /**
   * 載入共用記憶
   */
  async loadSharedMemory(context) {
    const sharedPath = path.join(this.memoryDir, 'shared/ai-shared.md');
    if (fs.existsSync(sharedPath)) {
      const content = fs.readFileSync(sharedPath, 'utf8');
      context.coreMemory.shared = {
        path: sharedPath,
        content,
        // 提取重要資訊
        lastUpdate: this.extractLastUpdate(content),
        activeProjects: this.extractActiveProjects(content),
        collaborationRules: this.extractCollaborationRules(content)
      };
      context.loadedFiles.push(sharedPath);
      console.log(`✅ 載入共用記憶: ai-shared.md`);
    }

    // 載入readme
    const readmePath = path.join(this.memoryDir, 'README.md');
    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, 'utf8');
      context.coreMemory.readme = { path: readmePath, content };
      context.loadedFiles.push(readmePath);
      console.log(`✅ 載入系統說明: README.md`);
    }
  }

  /**
   * 生成智能建議
   */
  async generateSuggestions(context) {
    const aiRole = this.aiRoles[context.aiRole];
    const taskInfo = this.taskContextMap[context.taskType];

    // 基於AI角色和任務類型的建議
    if (aiRole && taskInfo) {
      // 檢查AI是否適合此任務
      const isOptimalMatch = aiRole.strengths.some(strength =>
        context.taskType.includes(strength.replace('-', ''))
      );

      if (isOptimalMatch) {
        context.suggestions.push('✅ 此任務非常適合你的專業領域');
      } else {
        context.suggestions.push('⚠️ 此任務可能需要與其他AI協作');
      }

      // 基於載入的Context生成建議
      if (context.loadedFiles.length > 5) {
        context.suggestions.push('📚 已載入較多Context，建議分批處理重要資訊');
      }

      if (context.taskType === 'collaboration') {
        context.suggestions.push('🤝 協作任務建議先執行: npm run ai:status');
      }

      if (context.taskType === 'version-control') {
        context.suggestions.push('🏷️ 版本控制建議先執行: npm run version:show');
      }

      if (context.taskType === 'automation-scripts') {
        context.suggestions.push('🔧 腳本開發建議先執行: npm run test:system');
      }
    }
  }

  /**
   * 顯示Context載入總結
   */
  displayContextSummary(context) {
    console.log('\n📊 Context 載入總結');
    console.log('======================================');
    console.log(`📁 載入檔案數: ${context.loadedFiles.length}`);
    console.log(`💡 智能建議數: ${context.suggestions.length}`);

    if (context.suggestions.length > 0) {
      console.log('\n🎯 智能建議:');
      context.suggestions.forEach(suggestion => {
        console.log(`   ${suggestion}`);
      });
    }

    console.log('\n📋 載入的檔案:');
    context.loadedFiles.forEach(file => {
      const relativePath = path.relative(this.projectRoot, file);
      console.log(`   📄 ${relativePath}`);
    });

    console.log('\n🎯 下一步建議:');
    console.log('   1. 檢視載入的記憶內容');
    console.log('   2. 根據任務類型執行對應指令');
    console.log('   3. 完成後記錄協作日誌: npm run 記憶');
  }

  /**
   * 保存Context到暫存檔案
   */
  saveContext(context) {
    const tempDir = path.join(this.projectRoot, '.temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const contextFile = path.join(tempDir, `context-${context.aiRole}-${Date.now()}.json`);
    fs.writeFileSync(contextFile, JSON.stringify(context, null, 2));
    console.log(`\n💾 Context已保存: ${path.relative(this.projectRoot, contextFile)}`);
  }

  // 輔助方法：從內容中提取資訊
  extractLastUpdate(content) {
    const match = content.match(/最後更新[:\s]*(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
  }

  extractActiveProjects(content) {
    // 簡單提取近期協作日誌
    const logs = content.match(/### \[[\d-\s:]+\] - \w+/g);
    return logs ? logs.slice(0, 3) : [];
  }

  extractCollaborationRules(content) {
    // 提取重要規則
    const rulesSection = content.match(/## 檔案責任區域([\s\S]*?)##/);
    return rulesSection ? rulesSection[1].trim() : null;
  }

  /**
   * 顯示使用說明
   */
  static showUsage() {
    console.log('\n🧠 智能 Context 載入系統');
    console.log('======================================');
    console.log('\n使用方式:');
    console.log('  node scripts/smart-context-loader.js <ai-role> <task-type> [options]');
    console.log('\nAI 角色:');
    console.log('  claude  - 主要開發、版本管理');
    console.log('  codex   - 程式碼生成、自動化');
    console.log('  gemini  - SEO優化、實驗功能');
    console.log('\n任務類型:');
    console.log('  version-control    - 版本控制管理');
    console.log('  seo-optimization   - SEO優化');
    console.log('  automation-scripts - 自動化腳本');
    console.log('  content-management - 內容管理');
    console.log('  collaboration      - 多AI協作');
    console.log('  hugo-development   - Hugo開發');
    console.log('  performance        - 效能優化');
    console.log('\n選項:');
    console.log('  --save  - 保存Context到暫存檔案');
    console.log('\n範例:');
    console.log('  node scripts/smart-context-loader.js claude version-control');
    console.log('  node scripts/smart-context-loader.js gemini seo-optimization --save');
  }
}

// 命令行界面
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args.includes('--help')) {
    SmartContextLoader.showUsage();
    return;
  }

  const [aiRole, taskType] = args;
  const options = {
    save: args.includes('--save')
  };

  const loader = new SmartContextLoader();
  await loader.loadContext(aiRole, taskType, options);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = SmartContextLoader;
