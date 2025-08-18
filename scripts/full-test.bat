@echo off
echo 🧪 完整結構化資料測試套件
echo ================================

REM 建置網站
echo 📦 1. 建置 Hugo 網站...
hugo --gc --minify
if %errorlevel% neq 0 (
    echo ❌ Hugo 建置失敗
    pause
    exit /b 1
)
echo ✅ 網站建置完成

REM 啟動虛擬環境
call scripts\venv\Scripts\activate.bat

echo.
echo 🔍 2. 基本結構化資料驗證...
python scripts\validate-structured-data.py
set validation_result=%errorlevel%

echo.
echo 📋 3. JSON Schema 驗證...
python scripts\schema-validator.py
set schema_result=%errorlevel%

echo.
echo 🧪 4. 測試特定頁面...
echo    測試標籤頁面...
python scripts\validate-structured-data.py --file "public\tags\心理\勵志\index.html"

echo    測試部落格文章...
python scripts\validate-structured-data.py --file "public\blog\book-list-reading-reflection-on-treat-time-as-a-friend\index.html"

echo    測試分類頁面...
python scripts\validate-structured-data.py --file "public\categories\閱讀心得\index.html"

echo.
echo ================================
echo 📊 測試結果摘要
echo ================================

if %validation_result% equ 0 (
    echo ✅ 基本驗證: 通過
) else (
    echo ❌ 基本驗證: 失敗
)

if %schema_result% equ 0 (
    echo ✅ Schema 驗證: 通過
) else (
    echo ❌ Schema 驗證: 失敗
)

echo.
echo 🌐 手動測試連結:
echo   Google 結構化資料測試工具: https://search.google.com/test/rich-results
echo   Schema.org 驗證器: https://validator.schema.org/
echo.

if %validation_result% equ 0 if %schema_result% equ 0 (
    echo 🎉 所有測試通過！可以安全部署。
) else (
    echo ⚠️  部分測試失敗，請檢查上述錯誤。
)

pause