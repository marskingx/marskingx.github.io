#!/usr/bin/env node

/**
 * 記憶系統驗證工具
 * 檢查外部記憶系統的完整性和格式正確性
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  '.kiro/steering/project-memory-loader.md',
  '.kiro/steering/project-memory.md',
  '.kiro/steering/memory-tools.md',
  '.kiro/steering/README.md'
];

const REQUIRED_SECTIONS = [
  '## 專案概述',
  '## 重要決策記錄',
  '## 技術配置',
  '## 學習筆記',
  '## 最佳實踐',
  '## 常見問題和解決方案',
  '## 待辦事項和想法',
  '## 重要連結和資源'
];

function checkFileExists(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${filePath} - 存在`);
    return true;
  } else {
    console.log(`❌ ${filePath} - 不存在`);
    return false;
  }
}

function validateMemoryFile() {
  const memoryFile = '.kiro/steering/project-memory.md';
  
  if (!fs.existsSync(memoryFile)) {
    console.log('❌ 核心記憶檔案不存在');
    return false;
  }
  
  const content = fs.readFileSync(memoryFile, 'utf8');
  let allSectionsFound = true;
  
  console.log('\n檢查記憶檔案區段:');
  REQUIRED_SECTIONS.forEach(section => {
    if (content.includes(section)) {
      console.log(`✅ ${section} - 找到`);
    } else {
      console.log(`❌ ${section} - 缺失`);
      allSectionsFound = false;
    }
  });
  
  return allSectionsFound;
}

function validateSteeringLoader() {
  const loaderFile = '.kiro/steering/project-memory-loader.md';
  
  if (!fs.existsSync(loaderFile)) {
    console.log('❌ 記憶載入器不存在');
    return false;
  }
  
  const content = fs.readFileSync(loaderFile, 'utf8');
  
  // 檢查 front matter
  if (!content.includes('inclusion: always')) {
    console.log('❌ 載入器缺少 "inclusion: always" 設定');
    return false;
  }
  
  // 檢查檔案引用
  if (!content.includes('#[[file:project-memory.md]]')) {
    console.log('❌ 載入器缺少記憶檔案引用');
    return false;
  }
  
  console.log('✅ 記憶載入器配置正確');
  return true;
}

function checkPackageScripts() {
  const packageFile = 'package.json';
  
  if (!fs.existsSync(packageFile)) {
    console.log('❌ package.json 不存在');
    return false;
  }
  
  const packageContent = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  const scripts = packageContent.scripts || {};
  
  console.log('\n檢查 npm 腳本:');
  
  if (scripts['memory:update']) {
    console.log('✅ memory:update 腳本已配置');
  } else {
    console.log('❌ memory:update 腳本缺失');
    return false;
  }
  
  if (scripts['memory:backup']) {
    console.log('✅ memory:backup 腳本已配置');
  } else {
    console.log('❌ memory:backup 腳本缺失');
    return false;
  }
  
  return true;
}

function generateReport() {
  console.log('\n=== 外部記憶系統驗證報告 ===\n');
  
  // 檢查檔案存在性
  console.log('檢查必要檔案:');
  let allFilesExist = true;
  REQUIRED_FILES.forEach(file => {
    if (!checkFileExists(file)) {
      allFilesExist = false;
    }
  });
  
  // 驗證記憶檔案結構
  const memoryStructureValid = validateMemoryFile();
  
  // 驗證載入器配置
  const loaderValid = validateSteeringLoader();
  
  // 檢查 package.json 腳本
  const scriptsValid = checkPackageScripts();
  
  // 總結
  console.log('\n=== 驗證結果 ===');
  
  if (allFilesExist && memoryStructureValid && loaderValid && scriptsValid) {
    console.log('🎉 外部記憶系統驗證通過！');
    console.log('✅ 所有必要檔案存在');
    console.log('✅ 記憶檔案結構完整');
    console.log('✅ 載入器配置正確');
    console.log('✅ npm 腳本已配置');
    console.log('\n系統已準備就緒，可以開始使用！');
    return true;
  } else {
    console.log('❌ 外部記憶系統驗證失敗');
    console.log('請檢查上述錯誤並修復後重新驗證');
    return false;
  }
}

// 執行驗證
const isValid = generateReport();
process.exit(isValid ? 0 : 1);