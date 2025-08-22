@echo off
echo 🔍 開始驗證結構化資料...

REM 檢查虛擬環境是否存在
if not exist "scripts\venv" (
    echo ❌ 找不到虛擬環境，請先執行 scripts\setup-validation.bat
    pause
    exit /b 1
)

REM 檢查 public 目錄是否存在
if not exist "public" (
    echo ❌ 找不到 public 目錄，請先執行 hugo 建置網站
    echo 執行: hugo --gc --minify
    pause
    exit /b 1
)

REM 啟動虛擬環境並執行驗證
call scripts\venv\Scripts\activate.bat
python scripts\validate-structured-data.py %*

pause