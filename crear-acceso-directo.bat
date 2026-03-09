@echo off
title PachaMama - Crear acceso directo

:: Crear acceso directo en el escritorio usando PowerShell
set "RUTA_BAT=%~dp0iniciar-pachamama.bat"
set "ESCRITORIO=%USERPROFILE%\Desktop"
set "NOMBRE=PachaMama Dashboard"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $sc = $ws.CreateShortcut('%ESCRITORIO%\%NOMBRE%.lnk'); $sc.TargetPath = '%RUTA_BAT%'; $sc.WorkingDirectory = '%~dp0'; $sc.IconLocation = 'shell32.dll,25'; $sc.Description = 'Iniciar PachaMama Dashboard'; $sc.Save()"

if %errorlevel% equ 0 (
    echo.
    echo  Acceso directo creado en el escritorio.
    echo  Ya podes hacer doble clic en "PachaMama Dashboard" para iniciar.
    echo.
) else (
    echo.
    echo  ❌ No se pudo crear el acceso directo.
    echo  Podés arrastrar manualmente "iniciar-pachamama.bat" al escritorio.
    echo.
)
pause
