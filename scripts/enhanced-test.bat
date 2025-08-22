@echo off
chcp 65001 >nul
echo 🚀 增強版結構化資料測試套件
echo ================================

REM 檢查虛擬環境
if not exist "scripts\venv\Scripts\activate.bat" (
    echo ❌ 虛擬環境不存在，請先執行 setup-validation.bat
    pause
    exit /b 1
)

REM 啟動虛擬環境
call scripts\venv\Scripts\activate.bat

echo.
echo 📊 1. 執行清理和優化分析...
python scripts\cleanup-and-optimize.py

echo.
echo 📊 2. 執行增強版驗證...
python scripts\enhance-validation.py --generate-report

echo.
echo 📊 3. 執行基本驗證...
python scripts\validate-structured-data.py

echo.
echo 📊 4. 執行 Schema 驗證...
python scripts\schema-validator.py

echo.
echo ================================
echo ✅ 增強版測試完成！
echo.
echo 📝 查看報告：
echo   - 優化報告: scripts\optimization-report.md
echo   - 清理建議: scripts\cleanup-suggestions.bat
echo.
pause