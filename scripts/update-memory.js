#!/usr/bin/env node

/**
 * 記憶檔案更新工具
 * 用於快速添加決策記錄、學習筆記等內容到專案記憶檔案
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const MEMORY_FILE = '.kiro/steering/project-memory.md';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

function addDecisionRecord() {
  console.log('\n=== 添加決策記錄 ===');
  
  const questions = [
    '決策標題: ',
    '背景描述: ',
    '考慮的選項 (用逗號分隔): ',
    '最終決定: ',
    '選擇理由: ',
    '預期影響: '
  ];
  
  const answers = [];
  let currentQuestion = 0;
  
  function askQuestion() {
    if (currentQuestion < questions.length) {
      rl.question(questions[currentQuestion], (answer) => {
        answers.push(answer);
        currentQuestion++;
        askQuestion();
      });
    } else {
      const [title, background, options, decision, rationale, impact] = answers;
      const optionsList = options.split(',').map(opt => `- ${opt.trim()}`).join('\n');
      
      const record = `
### [${getCurrentDate()}] ${title}
**背景**: ${background}
**選項**: 
${optionsList}
**決定**: ${decision}
**理由**: ${rationale}
**影響**: ${impact}
`;
      
      appendToMemoryFile(record, '## 重要決策記錄');
      console.log('\n✅ 決策記錄已添加到記憶檔案');
      rl.close();
    }
  }
  
  askQuestion();
}

function addLearningNote() {
  console.log('\n=== 添加學習筆記 ===');
  
  const questions = [
    '學習主題: ',
    '遇到的問題: ',
    '解決方案: ',
    '程式碼範例 (可選): ',
    '參考資料 (可選): ',
    '標籤 (用空格分隔): '
  ];
  
  const answers = [];
  let currentQuestion = 0;
  
  function askQuestion() {
    if (currentQuestion < questions.length) {
      rl.question(questions[currentQuestion], (answer) => {
        answers.push(answer);
        currentQuestion++;
        askQuestion();
      });
    } else {
      const [topic, problem, solution, code, references, tags] = answers;
      
      let note = `
### ${topic}
**問題**: ${problem}
**解決方案**: ${solution}`;

      if (code.trim()) {
        note += `
**程式碼範例**:
\`\`\`
${code}
\`\`\``;
      }

      if (references.trim()) {
        const refList = references.split(',').map(ref => `- ${ref.trim()}`).join('\n');
        note += `
**參考資料**: 
${refList}`;
      }

      if (tags.trim()) {
        note += `
**標籤**: ${tags.split(' ').map(tag => `#${tag.trim()}`).join(' ')}`;
      }
      
      appendToMemoryFile(note, '## 學習筆記');
      console.log('\n✅ 學習筆記已添加到記憶檔案');
      rl.close();
    }
  }
  
  askQuestion();
}

function appendToMemoryFile(content, section) {
  try {
    let memoryContent = fs.readFileSync(MEMORY_FILE, 'utf8');
    
    // 找到指定區段的位置
    const sectionIndex = memoryContent.indexOf(section);
    if (sectionIndex === -1) {
      console.error(`❌ 找不到區段: ${section}`);
      return;
    }
    
    // 找到下一個 ## 區段的位置
    const nextSectionIndex = memoryContent.indexOf('\n## ', sectionIndex + section.length);
    const insertPosition = nextSectionIndex === -1 ? memoryContent.length : nextSectionIndex;
    
    // 插入新內容
    const newContent = memoryContent.slice(0, insertPosition) + content + '\n' + memoryContent.slice(insertPosition);
    
    fs.writeFileSync(MEMORY_FILE, newContent, 'utf8');
  } catch (error) {
    console.error('❌ 更新記憶檔案時發生錯誤:', error.message);
  }
}

function showMenu() {
  console.log('\n=== 記憶檔案更新工具 ===');
  console.log('1. 添加決策記錄');
  console.log('2. 添加學習筆記');
  console.log('3. 退出');
  
  rl.question('\n請選擇操作 (1-3): ', (choice) => {
    switch (choice) {
      case '1':
        addDecisionRecord();
        break;
      case '2':
        addLearningNote();
        break;
      case '3':
        console.log('👋 再見！');
        rl.close();
        break;
      default:
        console.log('❌ 無效選擇，請重新選擇');
        showMenu();
    }
  });
}

// 檢查記憶檔案是否存在
if (!fs.existsSync(MEMORY_FILE)) {
  console.error(`❌ 記憶檔案不存在: ${MEMORY_FILE}`);
  process.exit(1);
}

// 啟動選單
showMenu();