@echo off
title PachaMama - Iniciando...
color 0A

echo.
echo  =============================================
echo    PachaMama Dashboard - Iniciando...
echo  =============================================
echo.

:: Verificar que Node.js esté instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  ❌ ERROR: Node.js no está instalado.
    echo.
    echo  Por favor instalalo desde:
    echo  https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Ir a la carpeta del proyecto (donde está el .bat)
cd /d "%~dp0"

:: Verificar que existan las dependencias
if not exist "node_modules" (
    echo  📦 Primera vez: instalando dependencias...
    echo  (Esto puede demorar unos minutos, solo pasa una vez)
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo  ❌ Error al instalar dependencias.
        pause
        exit /b 1
    )
)

:: Esperar que el servidor levante y abrir el browser
echo  Iniciando servidor...
echo.
echo  El navegador se abrira automaticamente en unos segundos.
echo  NO cierres esta ventana mientras usas la aplicacion.
echo.
echo  Para cerrar la aplicacion: cerra esta ventana.
echo  =============================================
echo.

:: Abrir el browser después de 3 segundos en background
start /b cmd /c "timeout /t 3 >nul && start http://localhost:5173"

:: Levantar Vite (bloqueante — mantiene el servidor activo)
call npm run dev

:: Si llega acá, el servidor se cerró
echo.
echo  La aplicacion fue cerrada.
pause