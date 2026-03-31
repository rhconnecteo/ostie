@echo off
setlocal enabledelayedexpansion

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set BROWSER="C:\Program Files\Google\Chrome\Application\chrome.exe"
    goto :launch
)
if exist "C:\Program Files\Mozilla Firefox\firefox.exe" (
    set BROWSER="C:\Program Files\Mozilla Firefox\firefox.exe"
    goto :launch
)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    set BROWSER="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    goto :launch
)

echo Aucun navigateur trouve
exit /b 1

:launch
for /f %%A in ('cd') do set CURRENT_DIR=%%A
set HTML_FILE=%CURRENT_DIR%\index.html
start "" !BROWSER! "%HTML_FILE%"
