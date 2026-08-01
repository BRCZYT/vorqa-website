@echo off
chcp 65001 >nul 2>&1
title Mira - Vorqa Akademi
color 0A

cd /d "%~dp0"

echo.
echo  ================================================
echo   Mira Blog Generator - Vorqa Akademi
echo  ================================================
echo.

:: Node.js kontrolu
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [HATA] Node.js bulunamadi!
    echo  Lutfen https://nodejs.org adresinden indirin.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODEVER=%%v
echo  Node.js bulundu: %NODEVER%

:: server.mjs dosyasi var mi?
if not exist "vorqa-blog\server.mjs" (
    echo  [HATA] vorqa-blog\server.mjs bulunamadi!
    pause
    exit /b 1
)

:: Port 3001 bos mu?
netstat -ano 2>nul | find ":3001 " >nul
if %errorlevel% equ 0 (
    echo  Port 3001 zaten kullaniliyor.
    echo  Mira zaten calisiyor olmali - panel aciliyor...
    echo.
    start http://localhost:3001
    pause
    exit /b 0
)

:: Ana site sunucusu (port 3000)
netstat -ano 2>nul | find ":3000 " >nul
if %errorlevel% neq 0 (
    echo  Site sunucusu baslatiliyor...
    start "" /B node serve.mjs
    timeout /t 2 /nobreak >nul
)

echo  Mira paneli baslatiliyor...
echo.
echo  Panel adresi  : http://localhost:3001
echo  Site adresi   : http://localhost:3000/akademi.html
echo.
echo  Bu pencereyi KAPATMAYIN - Mira burada calisiyor.
echo  Durdurmak icin bu pencereyi kapatabilirsiniz.
echo  ================================================
echo.

:: 2 saniye sonra paneli ac
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3001"

:: Mira sunucusunu baslat (on planda - loglar burada gorunur)
node vorqa-blog\server.mjs

echo.
echo  Mira durduruldu.
pause
