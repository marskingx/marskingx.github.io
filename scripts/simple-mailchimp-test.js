#!/usr/bin/env node

/**
 * 簡單的 Mailchimp API 測試腳本
 * 直接使用您的 GitHub Secrets 值進行測試
 */

console.log('🔧 簡單 Mailchimp API 測試');
console.log('=======================\n');

// 請將 GitHub Secrets 中的值貼到這裡進行測試
const CONFIG = {
  API_KEY: process.env.MAILCHIMP_API_KEY || 'c6e6c7f6acde3625b54a7538d7048cfa-us14',
  SERVER_PREFIX: process.env.MAILCHIMP_SERVER_PREFIX || 'us14', 
  AUDIENCE_ID: process.env.MAILCHIMP_AUDIENCE_ID || '517a8482e3'
};

async function testMailchimp() {
  if (!CONFIG.API_KEY || CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
    console.log('❌ 請設定環境變數或修改腳本中的 API 憑證');
    console.log('\n設定環境變數方式:');
    console.log('set MAILCHIMP_API_KEY=your-api-key');
    console.log('set MAILCHIMP_SERVER_PREFIX=us14');
    console.log('set MAILCHIMP_AUDIENCE_ID=your-audience-id');
    console.log('node scripts/simple-mailchimp-test.js');
    return;
  }

  try {
    // 動態載入 axios
    const axios = require('axios');
    
    console.log('1️⃣ 測試 Mailchimp API 基本連線...');
    const pingUrl = `https://${CONFIG.SERVER_PREFIX}.api.mailchimp.com/3.0/ping`;
    
    const pingResponse = await axios.get(pingUrl, {
      headers: {
        'Authorization': `Bearer ${CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API 連線成功!');
    console.log('   狀態:', pingResponse.data.health_status);
    
    console.log('\n2️⃣ 測試受眾清單存取...');
    const listUrl = `https://${CONFIG.SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${CONFIG.AUDIENCE_ID}`;
    
    const listResponse = await axios.get(listUrl, {
      headers: {
        'Authorization': `Bearer ${CONFIG.API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 受眾清單存取成功!');
    console.log('   清單名稱:', listResponse.data.name);
    console.log('   訂閱者數量:', listResponse.data.stats.member_count);
    
    console.log('\n🎉 所有測試通過！Mailchimp API 設定正確。');
    
  } catch (error) {
    console.log('\n❌ 測試失敗!');
    
    if (error.response) {
      console.log('   HTTP 狀態:', error.response.status);
      console.log('   錯誤訊息:', error.response.data?.title || error.response.data?.detail || '未知錯誤');
      
      switch (error.response.status) {
        case 401:
          console.log('\n💡 解決建議: 檢查 API Key 是否正確或過期');
          break;
        case 404:
          console.log('\n💡 解決建議: 檢查 Audience ID 或 Server Prefix 是否正確');
          break;
        default:
          console.log('\n💡 解決建議: 檢查網路連線或稍後重試');
      }
    } else {
      console.log('   錯誤:', error.message);
    }
  }
}

testMailchimp();