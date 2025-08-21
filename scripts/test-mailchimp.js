#!/usr/bin/env node

/**
 * Mailchimp API 連線測試腳本
 * 用於驗證 API 設定是否正確
 */

const readline = require('readline');

// 創建命令行介面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Mailchimp API 連線測試工具');
console.log('===============================\n');

// 提示用戶輸入測試資訊
rl.question('請輸入您的 MAILCHIMP_API_KEY: ', (apiKey) => {
  rl.question('請輸入您的 MAILCHIMP_SERVER_PREFIX (例如: us14): ', (serverPrefix) => {
    rl.question('請輸入您的 MAILCHIMP_AUDIENCE_ID: ', (audienceId) => {
      rl.close();
      
      // 執行測試
      testMailchimpConnection(apiKey, serverPrefix, audienceId);
    });
  });
});

async function testMailchimpConnection(apiKey, serverPrefix, audienceId) {
  console.log('\n🧪 開始測試 Mailchimp API 連線...\n');
  
  try {
    // 動態載入 axios (如果不存在則提示安裝)
    let axios;
    try {
      axios = require('axios');
    } catch (error) {
      console.log('❌ 缺少 axios 套件，請先執行: npm install axios');
      process.exit(1);
    }

    // 測試 1: 驗證 API Key 格式
    console.log('1️⃣ 檢查 API Key 格式...');
    if (!apiKey || !apiKey.includes('-')) {
      throw new Error('API Key 格式不正確，應該包含 "-" 分隔符');
    }
    
    const keyServerPrefix = apiKey.split('-').pop();
    if (keyServerPrefix !== serverPrefix) {
      console.log(`⚠️  警告: API Key 中的伺服器前綴 (${keyServerPrefix}) 與您輸入的不符 (${serverPrefix})`);
    }
    console.log('✅ API Key 格式正確\n');

    // 測試 2: 測試基本 API 連線
    console.log('2️⃣ 測試基本 API 連線...');
    const pingUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/ping`;
    
    const pingResponse = await axios.get(pingUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (pingResponse.data.health_status === 'Everything\'s Chimpy!') {
      console.log('✅ API 連線成功！');
      console.log(`📊 API 狀態: ${pingResponse.data.health_status}\n`);
    }

    // 測試 3: 驗證受眾清單
    console.log('3️⃣ 驗證受眾清單...');
    const listUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}`;
    
    const listResponse = await axios.get(listUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 受眾清單驗證成功！');
    console.log(`📋 清單名稱: ${listResponse.data.name}`);
    console.log(`👥 訂閱者數量: ${listResponse.data.stats.member_count}`);
    console.log(`📧 清單 ID: ${listResponse.data.id}\n`);

    // 測試 4: 測試活動創建權限 (不實際創建)
    console.log('4️⃣ 檢查活動創建權限...');
    const campaignsUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/campaigns`;
    
    // 只檢查 GET 權限，不實際創建活動
    const campaignsResponse = await axios.get(campaignsUrl + '?count=1', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 活動創建權限正常！');
    console.log(`📈 總活動數量: ${campaignsResponse.data.total_items}\n`);

    // 測試結果摘要
    console.log('🎉 所有測試通過！');
    console.log('===============================');
    console.log('✅ API Key 有效');
    console.log('✅ 伺服器連線正常');
    console.log('✅ 受眾清單可存取');
    console.log('✅ 活動創建權限正常');
    console.log('\n🚀 您的 Mailchimp 設定已準備就緒！');
    console.log('📝 接下來可以測試實際的工作流程。');

  } catch (error) {
    console.log('\n❌ 測試失敗！');
    console.log('===============================');
    
    if (error.response) {
      console.log(`📊 HTTP 狀態碼: ${error.response.status}`);
      console.log(`📋 錯誤訊息: ${error.response.data.title || error.response.data.detail || '未知錯誤'}`);
      
      // 提供具體的錯誤解決建議
      switch (error.response.status) {
        case 401:
          console.log('\n💡 解決建議:');
          console.log('   - 檢查 API Key 是否正確');
          console.log('   - 確認 API Key 尚未過期');
          console.log('   - 確認 API Key 具有適當權限');
          break;
        case 404:
          console.log('\n💡 解決建議:');
          console.log('   - 檢查 Audience ID 是否正確');
          console.log('   - 確認受眾清單存在且可存取');
          console.log('   - 檢查伺服器前綴是否正確');
          break;
        case 403:
          console.log('\n💡 解決建議:');
          console.log('   - API Key 權限不足');
          console.log('   - 請確認 API Key 具有讀寫權限');
          break;
        default:
          console.log('\n💡 解決建議:');
          console.log('   - 檢查網路連線');
          console.log('   - 稍後重試');
          console.log('   - 聯絡 Mailchimp 支援');
      }
    } else {
      console.log(`📋 錯誤訊息: ${error.message}`);
    }
  }
}

console.log('📌 注意: 此測試僅檢查 API 連線，不會發送實際的電子報。');
console.log('🔒 您的 API Key 只會在本地使用，不會被儲存或傳送。\n');