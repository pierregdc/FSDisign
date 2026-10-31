@echo off
chcp 65001 >nul
title FranceStudent CANVA - Push GitHub
echo ========================================================
echo   Publication du projet sur GitHub (extraopaa/intelligent-ui-frstd)
echo ========================================================
echo.
cd /d "%~dp0"

echo Verification de l'etat Git...
git status
echo.
echo Envoi en cours vers origin main...
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   [SUCCES] Projet publie avec succes sur GitHub !
    echo   Depot : https://github.com/extraopaa/intelligent-ui-frstd
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   [ATTENTION] La connexion GitHub requiert une authentification.
    echo   Connectez-vous via la fenetre de votre navigateur ou utilisez
    echo   un Personal Access Token (PAT) GitHub.
    echo ========================================================
)

echo.
pause
