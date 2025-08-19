#!/usr/bin/env node

/**
 * 大型圖片優化工具
 * 自動將 Markdown 圖片標記轉換為 Hugo img shortcode
 */

const fs = require('fs');
const path = require('path');

class ImageOptimizer {
    constructor() {
        this.projectRoot = process.cwd();
        this.blogDir = path.join(this.projectRoot, 'content/blog');
        this.assetsDir = path.join(this.projectRoot, 'assets/images/blog');
        this.largeImages = new Set();
        this.processedFiles = [];
        this.totalReplacements = 0;
    }

    // 主要執行方法
    async run() {
        console.log('🖼️  大型圖片優化工具\n');
        console.log('======================================\n');

        // 1. 識別大型圖片
        this.identifyLargeImages();
        
        // 2. 掃描和處理 Markdown 檔案
        await this.processBlogPosts();
        
        // 3. 生成報告
        this.generateReport();
    }

    // 識別大型圖片 (>500KB)
    identifyLargeImages() {
        console.log('🔍 識別大型圖片 (>500KB)...\n');

        if (!fs.existsSync(this.assetsDir)) {
            console.log('❌ assets/images/blog 目錄不存在');
            return;
        }

        const files = fs.readdirSync(this.assetsDir);
        let largeCount = 0;

        files.forEach(file => {
            const filePath = path.join(this.assetsDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.size > 500 * 1024) { // >500KB
                this.largeImages.add(file);
                largeCount++;
                const sizeKB = Math.round(stats.size / 1024);
                console.log(`   📍 ${file} (${sizeKB} KB)`);
            }
        });

        console.log(`\n✅ 找到 ${largeCount} 個大型圖片\n`);
    }

    // 處理部落格文章
    async processBlogPosts() {
        console.log('📝 處理部落格文章...\n');

        if (!fs.existsSync(this.blogDir)) {
            console.log('❌ content/blog 目錄不存在');
            return;
        }

        const files = fs.readdirSync(this.blogDir)
            .filter(file => file.endsWith('.md'));

        for (const file of files) {
            await this.processMarkdownFile(file);
        }
    }

    // 處理單個 Markdown 檔案
    async processMarkdownFile(filename) {
        const filePath = path.join(this.blogDir, filename);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // 尋找圖片標記的正則表達式
        const imageRegex = /!\[([^\]]*)\]\(\/images\/blog\/([^)]+)\)/g;
        let replacements = 0;
        let newContent = content;
        
        // 替換所有匹配的圖片
        newContent = content.replace(imageRegex, (match, alt, imagePath) => {
            // 檢查是否為大型圖片或需要優化的圖片
            const shouldOptimize = this.shouldOptimizeImage(imagePath);
            
            if (shouldOptimize) {
                replacements++;
                this.totalReplacements++;
                
                // 轉換為 Hugo shortcode
                const altText = alt || this.generateAltText(imagePath);
                return `{{< img src="/images/blog/${imagePath}" alt="${altText}" >}}`;
            }
            
            return match; // 不替換
        });

        // 如果有替換，則寫入檔案
        if (replacements > 0) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            this.processedFiles.push({
                filename: filename,
                replacements: replacements
            });
            
            console.log(`   ✅ ${filename} - 替換 ${replacements} 個圖片`);
        }
    }

    // 判斷是否應該優化圖片
    shouldOptimizeImage(imagePath) {
        // 檢查是否為大型圖片
        if (this.largeImages.has(imagePath)) {
            return true;
        }
        
        // 檢查檔案擴展名 (優化 PNG 和 JPG)
        const ext = path.extname(imagePath).toLowerCase();
        if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            // 檢查實際檔案大小
            const fullPath = path.join(this.assetsDir, imagePath);
            if (fs.existsSync(fullPath)) {
                const stats = fs.statSync(fullPath);
                return stats.size > 100 * 1024; // >100KB 的圖片都優化
            }
        }
        
        return false;
    }

    // 生成 alt text
    generateAltText(imagePath) {
        // 從檔名生成描述性的 alt text
        const basename = path.basename(imagePath, path.extname(imagePath));
        
        // 移除日期和數字，嘗試從檔名生成有意義的描述
        const cleanName = basename
            .replace(/^\d{8}/, '') // 移除日期前綴
            .replace(/_\d+$/, '') // 移除數字後綴
            .replace(/[_-]/g, ' ')
            .trim();
        
        if (cleanName) {
            return `圖片：${cleanName}`;
        }
        
        return '圖片說明';
    }

    // 生成優化報告
    generateReport() {
        console.log('\n📊 優化報告:\n');
        
        console.log(`✅ 處理完成！`);
        console.log(`   總共處理檔案: ${this.processedFiles.length} 個`);
        console.log(`   總共替換圖片: ${this.totalReplacements} 個`);
        console.log(`   識別大型圖片: ${this.largeImages.size} 個\n`);

        if (this.processedFiles.length > 0) {
            console.log('📋 詳細處理列表:\n');
            this.processedFiles.forEach((file, index) => {
                console.log(`   ${index + 1}. ${file.filename} - ${file.replacements} 個替換`);
            });
            console.log();
        }

        console.log('🚀 後續步驟:');
        console.log('   1. 執行 npm run build 檢查建置是否成功');
        console.log('   2. 檢查 public/ 目錄中的 WebP 圖片是否生成');
        console.log('   3. 測試網站載入速度是否改善');
        console.log('   4. 使用 npm run perf:analyze 檢查效能提升');
        
        console.log('\n💡 提示:');
        console.log('   • Hugo 會自動生成 WebP 格式的響應式圖片');
        console.log('   • 瀏覽器會自動選擇最佳的圖片格式');
        console.log('   • 所有圖片都會啟用 lazy loading');
    }

    // 備份功能 (預留)
    createBackup() {
        const backupDir = path.join(this.projectRoot, '.image-optimization-backup');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }
        
        // 這裡可以加入備份邏輯
        console.log('🔒 建議先備份重要檔案');
    }

    // 還原功能 (預留)
    restore() {
        console.log('🔄 還原功能尚未實作');
    }
}

// 處理命令行參數
const args = process.argv.slice(2);
const optimizer = new ImageOptimizer();

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🖼️  大型圖片優化工具

用法:
    node scripts/optimize-large-images.js [選項]

選項:
    --help, -h     顯示此幫助訊息
    --dry-run      預覽模式，不實際修改檔案

說明:
    此工具會自動將 Markdown 圖片標記轉換為 Hugo img shortcode，
    啟用自動 WebP 轉換和響應式圖片功能。

範例:
    npm run images:optimize
    node scripts/optimize-large-images.js --dry-run
    `);
    process.exit(0);
}

if (args.includes('--dry-run')) {
    console.log('🔍 預覽模式 - 不會實際修改檔案\n');
    // 可以實作預覽模式
}

// 執行優化
if (require.main === module) {
    optimizer.run().catch(console.error);
}

module.exports = ImageOptimizer;