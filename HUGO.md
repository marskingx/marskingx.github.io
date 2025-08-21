# Persona

Please扮演一位對 Hugo 框架有深入理解的資深軟體工程師與 DevOps 專家。您的核心任務是安全、可靠地執行一個現有的 Hugo 專案升級。

# Context

## 1. 主要目標
將一個 Hugo 專案從 v0.127.0 安全地升級到 v0.148.2，並解決所有可能因此產生的破壞性變更，確保網站最終能正常建置與運作。

## 2. 專案背景
- **佈景主題 (Theme)**: `hugoplate`
- **客製化程度**: 專案在 `layouts/` 和 `assets/` 目錄下有大量客製化檔案，特別是 `layouts/partials/` 和 `layouts/_default/`。
- **目前狀態**: 專案的主分支 (`main`) 依賴全域安裝的 Hugo。一個名為 `feature/hugo-upgrade-148.2` 的分支已被建立，並已在上面成功安裝了 `hugo-extended v0.148.2`。所有升級操作應在這個分支上進行。

## 3. 關鍵設定檔內容

### `hugo.toml`
'''toml
######################## default configuration ####################
# The base URL of your site (required). This will be prepended to all relative URLs.
baseURL = "https://lazytoberich.com.tw/"
# Title of your website (required).
title = "懶得變有錢 | 帶你了解財務規劃本質 鑑定自己的財務DNA"
# Your theme name
theme = "hugoplate"
# Default time zone for time stamps; use any valid tz database name: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List
timeZone = "Asia/Taipei"
# post pagination
paginate = 120 # see https://gohugo.io/extras/pagination/
# post excerpt
summaryLength = 0 # see https://gohugo.io/content-management/excerpts/
# disable language
disableLanguages = ["en"]
# example: ["fr"] for disable french language. see https://gohugo.io/content-management/multilingual/
hasCJKLanguage = true #  If hasCJKLanguage true, auto-detect Chinese/Japanese/Korean Languages in the content. see: https://gohugo.io/getting-started/configuration/#hascjklanguage
# default language
defaultContentLanguage = 'zh-tw'
# defaultContentLanguageInSubdir need to be true if you want to use the language code as a subdirectory and language specific 404 page
defaultContentLanguageInSubdir = false

########################### Services #############################
[services]
[services.googleAnalytics]
ID = 'G-03PSTN4ES1' # see https://gohugo.io/templates/internal/#configure-google-analytics

[services.disqus]
shortname = 'themefisher-template' # we use disqus to show comments in blog posts . To install disqus please follow this tutorial https://portfolio.peter-baumgartner.net/2017/09/10/how-to-install-disqus-on-hugo/

########################### Permalinks ############################
[permalinks.page]
"pages" = "/:slugorfilename/"


############################# Modules ############################
[module]
[[module.mounts]]
source = "assets"
target = "assets"

############################# Build ##############################
[build]
noJSConfigInAssets = false
useResourceCacheWhen = 'fallback'
[build.buildStats]
enable = true
[[build.cachebusters]]
source = '(postcss|tailwind)\.config\.js'
target = 'css'
[[build.cachebusters]]
source = 'assets/.*\.(js|ts|jsx|tsx)'
target = 'js'
[[build.cachebusters]]
source = 'assets/.*\.(css|scss|sass)'
target = 'css'
[[build.cachebusters]]
source = 'data/.*\.(.*)$'
target = 'css'
[[build.cachebusters]]
source = 'assets/.*\.(.*)$'
target = '$1'


########################### Outputs ############################
[outputs]
home = ["HTML", "RSS", "WebAppManifest", "SearchIndex"]

########################### Imaging ############################
[imaging]
# See https://github.com/disintegration/imaging
# Default JPEG or WebP quality setting. Default is 75.
quality = 80
resampleFilter = "Lanczos"
# Enable WebP format for better compression
[imaging.exif]
includeFields = ""
excludeFields = ".*"
disableDate = false
disableLatLong = true

############################ Caches ##############################
[caches]
[caches.images]
dir = ":resourceDir/_gen"
maxAge = "720h"

[caches.assets]
dir = ":resourceDir/_gen"
maxAge = "720h"


############################ Markup ##############################
[markup]
[markup.goldmark.renderer]
unsafe = true
wrapParagraphsInMarkup = false

[markup.highlight]
style = 'monokai' # see https://xyproto.github.io/splash/docs/all.html

[markup.tableOfContents]
startLevel = 2
endLevel = 5
ordered = true


########################### Media types ###########################
[mediaTypes]
[mediaTypes."application/manifest+json"]
suffixes = ["webmanifest"]


########################### Output Format ##########################
[outputFormats]
[outputFormats.WebAppManifest]
mediaType = "application/manifest+json"
rel = "manifest"

[outputFormats.SearchIndex]
mediaType = "application/json"
baseName = "searchindex"
isPlainText = true
notAlternative = true


############################# Parameters ############################
[params]
logo = "/favicon.png"

############################# Plugins ##############################

# CSS Plugins
[[params.plugins.css]]
link = "plugins/swiper/swiper-bundle.css"
lazy = true
[[params.plugins.css]]
link = "plugins/glightbox/glightbox.css"
lazy = true
[[params.plugins.css]]
link = "plugins/font-awesome/v6/brands.css"
lazy = true
[[params.plugins.css]]
link = "plugins/font-awesome/v6/solid.css"
lazy = true
[[params.plugins.css]]
link = "plugins/font-awesome/v6/icons.css"
lazy = true

# JS Plugins
[[params.plugins.js]]
link = "js/search.js"
lazy = false
[[params.plugins.js]]
link = "plugins/swiper/swiper-bundle.js"
lazy = false
[[params.plugins.js]]
link = "plugins/cookie.js"
lazy = false
[[params.plugins.js]]
link = "plugins/glightbox/glightbox.js"
lazy = true
[[params.plugins.js]]
link = "js/gallery-slider.js"
lazy = true
[[params.plugins.js]]
link = "js/accordion.js"
lazy = true
[[params.plugins.js]]
link = "js/tab.js"
lazy = true
[[params.plugins.js]]
link = "js/modal.js"
lazy = true
[[params.plugins.js]]
link = "plugins/youtube-lite.js"
lazy = true
'''

### `package.json`
'''json
{
"name": "lazytoberich-blog",
"description": "懶得變有錢理財部落格 - Hugo + TailwindCSS + 圖片優化系統",
"version": "2.2.2",
"license": "MIT",
"author": "懶大 <lazytoberich@gmail.com>",
"scripts": {
"dev": "hugo server",
"build": "hugo --gc --minify --templateMetrics --templateMetricsHints --forceSyncStatic",
"preview": "hugo server --disableFastRender --navigateToChanged --templateMetrics --templateMetricsHints --watch --forceSyncStatic -e production --minify",
"dev:example": "cd exampleSite && hugo server",
"build:example": "cd exampleSite && hugo --gc --minify --templateMetrics --templateMetricsHints --forceSyncStatic",
"preview:example": "cd exampleSite && hugo server --disableFastRender --navigateToChanged --templateMetrics --templateMetricsHints --watch --forceSyncStatic -e production --minify",
"update-modules": "node ./scripts/clearModules.js && hugo mod clean --all && hugo mod get -u ./... && hugo mod tidy",
"remove-darkmode": "node ./scripts/removeDarkmode.js && yarn format",
"project-setup": "node ./scripts/projectSetup.js",
"theme-setup": "node ./scripts/themeSetup.js",
"update-theme": "node ./scripts/themeUpdate.js",
"format": "prettier -w .",
"memory:update": "node ./scripts/update-memory.js",
"memory:backup": "cp .kiro/steering/project-memory.md .kiro/steering/project-memory.backup.md",
"memory:validate": "node ./scripts/validate-memory.js",
"ai-memory:manage": "node ./docs/ai-memory/tools/memory-manager.js",
"ai-memory:backup": "node -e \"const fs=require('fs'); const path='docs/ai-memory/backups'; if(!fs.existsSync(path)) fs.mkdirSync(path,{recursive:true}); const t=new Date().toISOString().replace(/[:.]/g,'-'); fs.copyFileSync('docs/ai-memory/project-memory.md', `${path}/project-memory-${t}.md`); console.log('✅ 備份完成');\"",
"gemini:setup": "node ./docs/ai-memory/tools/gemini-memory-loader.js",
"gemini:auto-load": "node ./docs/ai-memory/tools/gemini-auto-loader.js",
"gemini:install": "npm install @google/generative-ai",
"claude:memory": "node ./scripts/claude-memory-manager.js",
"claude:backup": "node -e \"const fs=require('fs'),path=require('path'); const dir='.claude-backups'; if(!fs.existsSync(dir)) fs.mkdirSync(dir); const t=new Date().toISOString().split('T')[0]; fs.copyFileSync('CLAUDE.md', path.join(dir,`CLAUDE-${t}.md`)); console.log('✅ CLAUDE.md 備份完成');\"",
"claude:status": "node -e \"const fs=require('fs'); if(fs.existsSync('CLAUDE.md')){const c=fs.readFileSync('CLAUDE.md','utf8'), s=c.split('\n').filter(l=>l.startsWith('##')).length, t=c.split('\n').filter(l=>l.includes('- [ ]')).length; console.log(`📊 CLAUDE.md 狀態: ${s}個區段, ${t}個待辦事項, ${Math.round(fs.statSync('CLAUDE.md').size/1024*100)/100}KB`);} else console.log('❌ CLAUDE.md 不存在');\"",
"images:analyze": "node ./scripts/optimize-images.js",
"images:clean": "rimraf resources/_gen/images",
"images:rebuild": "npm run images:clean && npm run build",
"perf:analyze": "node ./scripts/performance-analyzer.js",
"perf:build": "npm run build && npm run perf:analyze",
"schema:validate": "node ./scripts/structured-data-validator.js",
"schema:build": "npm run build && npm run schema:validate",
"images:optimize": "node ./scripts/optimize-large-images.js",
"images:preview": "node ./scripts/optimize-large-images.js --dry-run",
"version:content": "node ./scripts/version-manager.js content",
"version:patch": "node ./scripts/version-manager.js patch",
"version:minor": "node ./scripts/version-manager.js minor",
"version:major": "node ./scripts/version-manager.js major",
"version:show": "node ./scripts/version-manager.js show",
"version:changelog": "node ./scripts/version-manager.js changelog",
"push": "git push origin main",
"push:tags": "git push origin main && git push --tags",
"content:process": "node ./scripts/content-workflow.js process",
"content:batch": "node ./scripts/content-workflow.js batch",
"content:publish": "node ./scripts/content-workflow.js publish",
"content:validate": "node ./scripts/content-validator.js --dir",
"content:validate:file": "node ./scripts/content-validator.js",
"content:new": "node ./scripts/create-new-post.js",
"content:help": "node -e \"console.log('\n📝 內容管理工具\n'); console.log('npm run content:new           # 建立新文章'); console.log('npm run content:process       # 處理 Notion 匯出檔案'); console.log('npm run content:batch         # 批量處理 Notion 檔案'); console.log('npm run content:validate      # 驗證所有文章'); console.log('npm run content:validate:file # 驗證單一檔案'); console.log('npm run content:publish       # 一鍵發布文章\n');\""
},
"devDependencies": {
"@tailwindcss/forms": "^0.5.7",
"@tailwindcss/typography": "^0.5.13",
"autoprefixer": "^10.4.19",
"jsdom": "^26.1.0",
"postcss": "^8.4.38",
"postcss-cli": "^11.0.0",
"prettier": "^3.2.5",
"prettier-plugin-go-template": "0.0.15",
"prettier-plugin-tailwindcss": "^0.5.14",
"tailwind-bootstrap-grid": "^5.1.0",
"tailwindcss": "^3.4.3"
},
"dependencies": {
"axios": "^1.11.0"
}
}
'''

# Task: Detailed Upgrade Action Plan

請嚴格遵循以下步驟，安全地執行升級。

## Phase 1: 環境準備與版本鎖定

1.  **切換分支**:
  -   執行 `git checkout feature/hugo-upgrade-148.2`，確保所有操作都在此分支上進行。

2.  **鎖定 Hugo 版本**:
  -   **目標**: 讓專案的 Hugo 版本由 `package.json` 管理，而不是依賴全域環境。
  -   **分析**: 目前 `package.json` 中沒有 Hugo 依賴。
  -   **行動**: 執行 `npm install hugo-extended@^0.148.2 --save-dev`。這會將 `hugo-extended` 加入 `devDependencies`，確保任何環境下都能使用正確的 Hugo 擴展版。

3.  **更新 Hugo 模組**:
  -   **目標**: 更新 `hugoplate` 主題及其他可能的模組，確保其與 Hugo v0.148.2 的相容性。
  -   **行動**: 執行 `hugo mod get -u`。

## Phase 2: 修正 `hugo.toml` 設定檔

1.  **新增安全策略 (Security Policy)**:
  -   **目標**: 解決因 Hugo v0.120.0+ 新增的安全限制而可能導致的建置失敗。
  -   **分析**: `hugo.toml` 中缺少 `[security]` 區塊。
  -   **行動**: 在 `hugo.toml` 的 `[markup]` 區塊之前，新增以下內容。這個設定允許了大部分常用函式，同時保持基本的安全。
      '''toml
      ############################ Security ##############################
      [security]
      [security.exec]
      allow = ['^dart-sass-embedded$', '^go$', '^npx$', '^postcss$']
      osEnv = ['(?i)^(PATH|NODE_ENV|HUGO_ENV)$']
      [security.funcs]
      getenv = ['^HUGO_']
      [security.http]
      methods = ['(?i)GET|POST']
      urls = ['.*']
      '''

## Phase 3: 執行建置並驗證

1.  **清除快取**:
  -   **目標**: 避免舊版 Hugo 的快取影響新版建置的結果。
  -   **行動**: 刪除專案根目錄下的 `resources` 資料夾。

2.  **執行建置**:
  -   **目標**: 使用升級後的版本建置網站，並捕捉任何錯誤。
  -   **行動**: 執行 `hugo`。**請勿**使用 `npm run build`，因為它包含其他參數，我們先執行最單純的建置指令。

3.  **錯誤處理**:
  -   如果 `hugo` 指令出現錯誤，請仔細閱讀錯誤訊息。
  -   大部分錯誤可能與模板函式有關。請根據錯誤訊息中提示的檔案和行數，對照 Hugo 官方文件進行修正。
  -   常見的修復方向是將模板中的 `.Pages` 替換為 `.Site.RegularPages`。

## Phase 4: 最終交付與報告

1.  **確認建置成功**:
  -   重複 Phase 3 的步驟，直到 `hugo` 指令可以順利完成，不再報錯，並在 `public` 目錄下產生網站檔案。

2.  **產出報告**:
  -   **修改總結**: 提供一份您在過程中所有已修改的檔案列表 (例如 `hugo.toml`, `package.json`，以及任何您修復的 `layouts` 檔案)。
  -   **手動驗證建議**: 提醒我 (專案擁有者) 需要手動檢查的項目，清單應包含：
    -   [ ] 網站首頁、列表頁、文章頁的排版是否正常。
    -   [ ] 檢查先前使用了複雜 Markdown 或自訂 HTML 的頁面，確認 `unsafe = true` 的渲染結果符合預期。
    -   [ ] 測試網站的搜尋功能 (`searchindex.json` 是否正常生成)。
    -   [ ] 檢查 CSS 和 JavaScript 是否都已正確載入。

請開始執行。
