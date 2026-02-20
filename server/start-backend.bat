@echo off
echo Backend baslatiliyor...
cd /d "%~dp0"
echo Mevcut dizin: %CD%
echo.
echo Bagimliliklari kontrol ediliyor...
if not exist "node_modules\express" (
    echo Bagimliliklari kuruluyor...
    call npm install
)
echo.
echo Backend baslatiliyor...
echo MongoDB baglantisi kuruluyor...
echo.
call npm run dev
pause

