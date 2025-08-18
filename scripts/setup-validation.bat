@echo off
echo 🚀 設定結構化資料驗證環境...

REM 檢查 Python 是否安裝
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 找不到 Python，請先安裝 Python 3.7+
    pause
    exit /b 1
)

REM 建立虛擬環境（如果不存在）
if not exist "scripts\venv" (
    echo 📦 建立虛擬環境...
    python -m venv scripts\venv
)

REM 啟動虛擬環境並安裝套件
echo 📦 安裝必要套件...
call scripts\venv\Scripts\activate.bat
pip install -r scripts\requirements.txt

echo ✅ 設定完成！
echo.
echo 使用方法：
echo   驗證所有檔案：scripts\validate.bat
echo   驗證特定檔案：scripts\validate.bat --file public\blog\example\index.html
echo.
pause