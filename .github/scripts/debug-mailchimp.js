#!/usr/bin/env node

/**
 * Debug 版本的 Mailchimp 腳本
 * 用於 GitHub Actions 環境的詳細除錯
 */

console.log('🔧 Mailchimp Debug 腳本啟動');
console.log('============================');

// 檢查環境變數
console.log('\n📋 環境變數檢查:');
console.log('MAILCHIMP_API_KEY:', process.env.MAILCHIMP_API_KEY ? '✅ 已設定' : '❌ 未設定');
console.log('MAILCHIMP_SERVER_PREFIX:', process.env.MAILCHIMP_SERVER_PREFIX || '❌ 未設定');
console.log('MAILCHIMP_AUDIENCE_ID:', process.env.MAILCHIMP_AUDIENCE_ID ? '✅ 已設定' : '❌ 未設定');
console.log('SITE_BASE_URL:', process.env.SITE_BASE_URL || '❌ 未設定');

// 檢查 API Key 格式
if (process.env.MAILCHIMP_API_KEY) {
  const keyParts = process.env.MAILCHIMP_API_KEY.split('-');
  if (keyParts.length === 2) {
    console.log('API Key 格式: ✅ 正確');
    console.log('Server Prefix (從 API Key):', keyParts[1]);
  } else {
    console.log('API Key 格式: ❌ 不正確');
  }
}

// 嘗試載入依賴
console.log('\n📦 依賴套件檢查:');
try {
  const axios = require('axios');
  console.log('axios: ✅ 已載入');
} catch (e) {
  console.log('axios: ❌ 載入失敗', e.message);
}

try {
  const matter = require('front-matter');
  console.log('front-matter: ✅ 已載入');
} catch (e) {
  console.log('front-matter: ❌ 載入失敗', e.message);
}

// 測試基本 API 連線
async function testAPI() {
  if (!process.env.MAILCHIMP_API_KEY) {
    console.log('\n❌ 無法測試 API - 缺少 API Key');
    return;
  }

  try {
    const axios = require('axios');
    const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX || process.env.MAILCHIMP_API_KEY.split('-')[1];
    
    console.log('\n🌐 測試 API 連線...');
    console.log('使用 Server Prefix:', serverPrefix);
    
    const pingUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/ping`;
    const response = await axios.get(pingUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API 連線成功!');
    console.log('回應:', response.data);
    
    // 測試受眾清單（如果有設定）
    if (process.env.MAILCHIMP_AUDIENCE_ID) {
      console.log('\n👥 測試受眾清單存取...');
      const listUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_AUDIENCE_ID}`;
      
      const listResponse = await axios.get(listUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ 受眾清單存取成功!');
      console.log('清單名稱:', listResponse.data.name);
      console.log('訂閱者數量:', listResponse.data.stats.member_count);
    }
    
  } catch (error) {
    console.log('\n❌ API 測試失敗');
    if (error.response) {
      console.log('HTTP 狀態:', error.response.status);
      console.log('錯誤回應:', error.response.data);
    } else {
      console.log('錯誤:', error.message);
    }
  }
}

// 檢查 Git 環境
console.log('\n🔧 Git 環境檢查:');
try {
  const { execSync } = require('child_process');
  const gitVersion = execSync('git --version', { encoding: 'utf8' });
  console.log('Git 版本:', gitVersion.trim());
  
  try {
    const currentCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' });
    console.log('當前 Commit:', currentCommit.trim());
  } catch (e) {
    console.log('無法取得 Commit ID:', e.message);
  }
  
} catch (error) {
  console.log('Git 不可用:', error.message);
}

// 執行測試
testAPI();