@echo off
setlocal
title Lancement - France Student Intelligent UI

echo ========================================================
echo       Demarrage de Intelligent UI (France Student)
echo ========================================================
echo.

cd /d "%~dp0"

REM Verification de Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installe ou n'est pas dans le PATH.
    echo Veuillez installer Node.js depuis https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Verification des dependances npm
if not exist "node_modules" (
    echo [INFO] Premier lancement : installation des dependances npm...
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERREUR] L'installation des dependances a echoue.
        pause
        exit /b %errorlevel%
    )
)

if exist "%~dp0.cert\ca.pem" (
    set "NODE_EXTRA_CA_CERTS=%~dp0.cert\ca.pem"
)

echo [INFO] Demarrage du serveur local sur http://localhost:3000 ...
echo [INFO] Votre navigateur va s'ouvrir automatiquement.
echo.

REM Ouvre le navigateur apres 3 secondes en arriere-plan
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

REM Lance le serveur Next.js
call npm run dev

if errorlevel 1 (
    echo.
    echo [ERREUR] Le serveur s'est arrete avec une erreur.
    pause
)
