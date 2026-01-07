@echo off
REM Startup script for ML Engine
cd /d %~dp0
set PYTHONPATH=%cd%

REM Check if virtual environment exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Run the ML Engine
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
