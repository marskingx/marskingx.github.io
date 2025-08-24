@echo off
echo 🧪 測試特定頁面的結構化資料...

REM 建置網站
echo 📦 建置 Hugo 網站...
hugo --gc --minify
if %errorlevel% neq 0 (
    echo ❌ Hugo 建置失敗
    pause
    exit /b 1
)

echo.
echo 🔍 測試標籤頁面...
call scripts\venv\Scripts\activate.bat
python scripts\validate-structured-data.py --file "public\tags\心理\勵志\index.html"

echo.
echo 🔍 測試部落格文章...
python scripts\validate-structured-data.py --file "public\blog\book-list-reading-reflection-on-treat-time-as-a-friend\index.html"

echo.
echo 🔍 測試分類頁面...
python scripts\validate-structured-data.py --file "public\categories\閱讀心得\index.html"

echo.
echo 🎉 特定頁面測試完成！
pause