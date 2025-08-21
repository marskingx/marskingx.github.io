#!/usr/bin/env node

/**
 * 懶得變有錢部落格 - 四位版本號管理系統
 * 版本格式: major.minor.patch.content
 * 
 * 版本號說明：
 * - major: 重大架構更新 (3.0.0.0)
 * - minor: 新功能發布 (2.3.0.0) 
 * - patch: 錯誤修正 (2.2.1.0)
 * - content: 內容更新 (2.2.0.1)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VersionManager {
  constructor() {
    this.packagePath = path.join(__dirname, '..', 'package.json');
    this.versionFilePath = path.join(__dirname, '..', '.version');
    this.pkg = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
    this.loadFullVersion();
  }

  // 載入完整版本號 (包含第四位)
  loadFullVersion() {
    try {
      if (fs.existsSync(this.versionFilePath)) {
        const versionData = JSON.parse(fs.readFileSync(this.versionFilePath, 'utf8'));
        this.fullVersion = versionData.version;
        this.contentVersion = versionData.content || 0;
      } else {
        // 初始化版本檔案
        this.fullVersion = this.pkg.version + '.0';
        this.contentVersion = 0;
        this.saveFullVersion();
      }
    } catch (error) {
      console.error('載入版本檔案失敗:', error);
      this.fullVersion = this.pkg.version + '.0';
      this.contentVersion = 0;
    }
  }

  // 儲存完整版本號
  saveFullVersion() {
    const versionData = {
      version: this.fullVersion,
      content: this.contentVersion,
      lastUpdated: new Date().toISOString(),
      description: this.getVersionDescription()
    };
    
    fs.writeFileSync(this.versionFilePath, JSON.stringify(versionData, null, 2));
  }

  // 取得版本描述
  getVersionDescription() {
    const [major, minor, patch, content] = this.fullVersion.split('.').map(Number);
    
    if (content > 0) return `內容更新版 - 新增 ${content} 次內容更新`;
    if (patch > 0) return `修正版 - 第 ${patch} 次錯誤修正`;
    if (minor > 0) return `功能版 - 第 ${minor} 個新功能發布`;
    return `重大版本 ${major}.0.0.0`;
  }

  // 解析版本號
  parseVersion(version) {
    const parts = version.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
      content: parts[3] || 0
    };
  }

  // 生成版本號字串
  generateVersion(major, minor, patch, content) {
    return `${major}.${minor}.${patch}.${content}`;
  }

  // 內容版本更新 (新文章發布)
  bumpContent() {
    const current = this.parseVersion(this.fullVersion);
    const newVersion = this.generateVersion(
      current.major,
      current.minor, 
      current.patch,
      current.content + 1
    );
    
    this.updateVersion(newVersion, 'content');
    return newVersion;
  }

  // Patch 版本更新 (錯誤修正)
  bumpPatch() {
    const current = this.parseVersion(this.fullVersion);
    const newVersion = this.generateVersion(
      current.major,
      current.minor,
      current.patch + 1,
      0 // 重置內容版本號
    );
    
    // 更新 package.json
    const npmVersion = `${current.major}.${current.minor}.${current.patch + 1}`;
    this.updatePackageVersion(npmVersion);
    this.updateVersion(newVersion, 'patch');
    return newVersion;
  }

  // Minor 版本更新 (新功能)
  bumpMinor() {
    const current = this.parseVersion(this.fullVersion);
    const newVersion = this.generateVersion(
      current.major,
      current.minor + 1,
      0, // 重置 patch
      0  // 重置 content
    );
    
    // 更新 package.json
    const npmVersion = `${current.major}.${current.minor + 1}.0`;
    this.updatePackageVersion(npmVersion);
    this.updateVersion(newVersion, 'minor');
    return newVersion;
  }

  // Major 版本更新 (重大更新)
  bumpMajor() {
    const current = this.parseVersion(this.fullVersion);
    const newVersion = this.generateVersion(
      current.major + 1,
      0, // 重置 minor
      0, // 重置 patch  
      0  // 重置 content
    );
    
    // 更新 package.json
    const npmVersion = `${current.major + 1}.0.0`;
    this.updatePackageVersion(npmVersion);
    this.updateVersion(newVersion, 'major');
    return newVersion;
  }

  // 更新 package.json 版本
  updatePackageVersion(version) {
    this.pkg.version = version;
    fs.writeFileSync(this.packagePath, JSON.stringify(this.pkg, null, 2));
  }

  // 更新版本並提交
  updateVersion(newVersion, type) {
    this.fullVersion = newVersion;
    this.contentVersion = this.parseVersion(newVersion).content;
    this.saveFullVersion();
    
    // Git 提交
    this.commitVersion(newVersion, type);
  }

  // Git 提交和標籤
  commitVersion(version, type) {
    try {
      const messages = {
        content: `content: 發布新內容版本 v${version}`,
        patch: `fix: 發布修正版本 v${version}`, 
        minor: `feat: 發布新功能版本 v${version}`,
        major: `feat!: 發布重大更新版本 v${version}`
      };

      const message = messages[type] + `

${this.getVersionDescription()}

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>`;

      // 添加版本檔案到 Git
      execSync('git add .version package.json', { stdio: 'inherit' });
      
      // 提交變更
      execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
      
      // 創建標籤 (只有非 content 版本才創建標籤)
      if (type !== 'content') {
        const [major, minor, patch] = version.split('.');
        const npmTag = `${major}.${minor}.${patch}`;
        execSync(`git tag v${npmTag}`, { stdio: 'inherit' });
        
        // 推送到遠端
        execSync('git push origin main', { stdio: 'inherit' });
        execSync('git push --tags', { stdio: 'inherit' });
      } else {
        // 內容更新只推送 commit，不創建標籤
        execSync('git push origin main', { stdio: 'inherit' });
      }
      
      console.log(`✅ 版本 v${version} 發布成功！`);
      
    } catch (error) {
      console.error('❌ 版本發布失敗:', error.message);
      process.exit(1);
    }
  }

  // 顯示當前版本資訊
  showVersion() {
    console.log(`📦 當前版本: ${this.pkg.name} v${this.fullVersion}`);
    console.log(`📋 版本描述: ${this.getVersionDescription()}`);
    console.log(`📅 最後更新: ${new Date().toLocaleDateString('zh-TW')}`);
    
    const [major, minor, patch, content] = this.fullVersion.split('.').map(Number);
    console.log(`\n📊 版本組成:`);
    console.log(`   🚀 Major (重大更新): ${major}`);
    console.log(`   ✨ Minor (新功能): ${minor}`);
    console.log(`   🔧 Patch (錯誤修正): ${patch}`);
    console.log(`   📝 Content (內容更新): ${content}`);
  }

  // 顯示版本歷史
  showChangelog() {
    console.log(`📋 懶得變有錢部落格版本管理`);
    console.log(`\n📦 版本號格式: major.minor.patch.content`);
    console.log(`\n🔧 版本管理指令:`);
    console.log(`   npm run version:content  # 📝 內容更新 (${this.fullVersion} → 下一個內容版本)`);
    console.log(`   npm run version:patch    # 🔧 錯誤修正 (${this.fullVersion} → 下一個修正版本)`);
    console.log(`   npm run version:minor    # ✨ 新功能 (${this.fullVersion} → 下一個功能版本)`);
    console.log(`   npm run version:major    # 🚀 重大更新 (${this.fullVersion} → 下一個重大版本)`);
    console.log(`\n📖 使用說明:`);
    console.log(`   📝 發布新文章/Podcast → npm run version:content`);
    console.log(`   🔧 修復 bug/小改動 → npm run version:patch`);
    console.log(`   ✨ 新功能/新模組 → npm run version:minor`);
    console.log(`   🚀 重大架構改變 → npm run version:major`);
  }
}

// 命令行介面
function main() {
  const command = process.argv[2];
  const versionManager = new VersionManager();

  switch (command) {
    case 'content':
      console.log(`📝 更新內容版本...`);
      const contentVersion = versionManager.bumpContent();
      console.log(`✅ 內容版本更新完成: v${contentVersion}`);
      break;
      
    case 'patch':
      console.log(`🔧 更新修正版本...`);
      const patchVersion = versionManager.bumpPatch();
      console.log(`✅ 修正版本更新完成: v${patchVersion}`);
      break;
      
    case 'minor':
      console.log(`✨ 更新功能版本...`);
      const minorVersion = versionManager.bumpMinor();
      console.log(`✅ 功能版本更新完成: v${minorVersion}`);
      break;
      
    case 'major':
      console.log(`🚀 更新重大版本...`);
      const majorVersion = versionManager.bumpMajor();
      console.log(`✅ 重大版本更新完成: v${majorVersion}`);
      break;
      
    case 'show':
      versionManager.showVersion();
      break;
      
    case 'changelog':
      versionManager.showChangelog();
      break;
      
    default:
      console.log(`❌ 未知指令: ${command}`);
      console.log(`\n使用方法:`);
      console.log(`   node version-manager.js [content|patch|minor|major|show|changelog]`);
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = VersionManager;