@echo off
echo ===================================================
echo   Bhagat Group of Construction - Automated Backup Setup Utility
echo ===================================================
echo.
echo This script will configure Windows Task Scheduler to
echo automatically backup your database and media files 
echo every day at 2:00 AM.
echo.

:: Get the directory where this script is running
set "BACKEND_DIR=%~dp0"
:: Assuming the python environment in the venv_win folder
set "PYTHON_EXE=%BACKEND_DIR%venv_win\Scripts\python.exe"
set "BACKUP_SCRIPT=%BACKEND_DIR%backup_data.py"

echo Checking for requirements...
if not exist "%PYTHON_EXE%" (
    echo [ERROR] Virtual environment python not found at %PYTHON_EXE%.
    echo Please ensure you are running this in the construction_backend folder.
    pause
    exit /b 1
)

if not exist "%BACKUP_SCRIPT%" (
    echo [ERROR] Backup script not found at %BACKUP_SCRIPT%.
    pause
    exit /b 1
)

echo.
echo Creating Scheduled Task...
:: Delete existing task if it exists (to avoid duplicates)
schtasks /delete /tn "ConstructionApp_DailyBackup" /f >nul 2>&1

:: Create the new scheduled task wrapper running silently
schtasks /create /tn "ConstructionApp_DailyBackup" /tr "\"%PYTHON_EXE%\" \"%BACKUP_SCRIPT%\"" /sc daily /st 02:00 /ru "SYSTEM" /f

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] The daily backup task has been successfully scheduled!
    echo Backups will run automatically in the background every day at 2:00 AM.
    echo.
    echo Next Steps:
    echo 1. Install Google Drive or Dropbox on this computer.
    echo 2. Sync the continuous folder: 
    echo    %BACKEND_DIR%backups
    echo.
) else (
    echo.
    echo [ERROR] Failed to create the scheduled task. 
    echo Please RIGHT-CLICK this script and select "Run as Administrator".
)

pause
