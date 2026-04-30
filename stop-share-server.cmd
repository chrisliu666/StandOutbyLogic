@echo off
cd /d "%~dp0"
set PORT=5189
if not "%~1"=="" set PORT=%~1
call stop-dev-server.cmd %PORT%
