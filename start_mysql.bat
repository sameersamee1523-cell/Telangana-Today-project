@echo off
:: Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo You have administrator privileges. Starting MySQL...
    net start MYSQL80
    echo.
    echo If it says the service is already started or was started successfully, you can close this window!
    pause
) else (
    echo Requesting administrative privileges to start MySQL...
    powershell -Command "Start-Process '%~dpnx0' -Verb RunAs"
    exit
)
