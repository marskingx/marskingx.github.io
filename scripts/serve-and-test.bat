@echo off
echo 🚀 啟動本地開發伺服器並測試結構化資料...

REM 建置網站
echo 📦 建置 Hugo 網站...
hugo --gc --minify
if %errorlevel% neq 0 (
    echo ❌ Hugo 建置失敗
    pause
    exit /b 1
)

REM 啟動本地伺服器（背景執行）
echo 🌐 啟動本地伺服器 http://localhost:1313
start /B hugo server --port 1313 --bind 127.0.0.1

REM 等待伺服器啟動
echo ⏳ 等待伺服器啟動...
timeout /t 3 /nobreak >nul

REM 驗證結構化資料
echo.
echo 🔍 驗證結構化資料...
call scripts\validate.bat

echo.
echo 📋 測試完成！
echo 🌐 本地伺服器: http://localhost:1313
echo 📊 Google 結構化資料測試工具: https://search.google.com/test/rich-results
echo.
echo 按任意鍵關閉伺服器...
pause

REM 關閉 Hugo 伺服器
taskkill /f /im hugo.exe >nul 2>&1