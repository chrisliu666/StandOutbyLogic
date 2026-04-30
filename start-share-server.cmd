@echo off
cd /d "%~dp0"
set PORT=5189
if not "%~1"=="" set PORT=%~1
echo Stand Out by Logic share server
echo.
echo Local URL: http://127.0.0.1:%PORT%/
echo LAN URL:   http://192.168.10.107:%PORT%/
echo.
echo Keep this window open while sharing.
node dev-server.js %PORT% 0.0.0.0
