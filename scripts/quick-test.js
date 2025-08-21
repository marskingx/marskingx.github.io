#!/usr/bin/env node

/**
 * 快速 Mailchimp API 測試腳本
 * 使用 curl 命令測試 API 連線
 */

const { execSync } = require('child_process');

console.log('🔧 Mailchimp API 快速測試');
console.log('========================\n');

// 請您手動填入這些值進行測試
const CONFIG = {
  // 從 GitHub Secrets 中複製您的實際值
  API_KEY: 'YOUR_API_KEY_HERE',           // 格式: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us14
  SERVER_PREFIX: 'YOUR_SERVER_PREFIX',    // 格式: us14
  AUDIENCE_ID: 'YOUR_AUDIENCE_ID'         // 格式: 1234567890
};

function testAPI() {
  if (CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
    console.log('❌ 請先在腳本中填入您的實際 API 憑證');
    console.log('請編輯 scripts/quick-test.js 檔案');
    return;
  }

  try {
    console.log('1️⃣ 測試基本 API 連線...');
    
    const pingCmd = `curl -s -X GET "https://${CONFIG.SERVER_PREFIX}.api.mailchimp.com/3.0/ping" -H "Authorization: Bearer ${CONFIG.API_KEY}"`;
    
    const pingResult = execSync(pingCmd, { encoding: 'utf8' });
    console.log('✅ Ping 結果:', pingResult);
    
    console.log('\n2️⃣ 測試受眾清單存取...');
    
    const listCmd = `curl -s -X GET "https://${CONFIG.SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${CONFIG.AUDIENCE_ID}" -H "Authorization: Bearer ${CONFIG.API_KEY}"`;
    
    const listResult = execSync(listCmd, { encoding: 'utf8' });
    console.log('✅ 受眾清單結果:', listResult);
    
    console.log('\n🎉 API 測試完成！');
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    console.log('\n💡 常見問題排除:');
    console.log('   1. 確認 API Key 格式正確');
    console.log('   2. 確認 Server Prefix 與 API Key 匹配');
    console.log('   3. 確認 Audience ID 存在');
  }
}

// 顯示使用說明
console.log('📋 使用說明:');
console.log('1. 編輯此檔案，填入您的 API 憑證');
console.log('2. 執行: node scripts/quick-test.js');
console.log('3. 查看測試結果\n');

testAPI();