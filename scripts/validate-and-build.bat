@echo off
echo 🚀 建置網站並驗證結構化資料...

REM 建置網站
echo 📦 建置 Hugo 網站...
hugo --gc --minify
if %errorlevel% neq 0 (
    echo ❌ Hugo 建置失敗
    pause
    exit /b 1
)

echo ✅ 網站建置完成

REM 驗證結構化資料
echo.
echo 🔍 驗證結構化資料...
call scripts\validate.bat

echo.
echo 🎉 建置和驗證完成！