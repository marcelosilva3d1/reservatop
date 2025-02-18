@echo off
echo Iniciando o Reserva Top...

:: Muda para o diretório do projeto
cd /d "%~dp0"

:: Inicia o servidor backend em uma nova janela
start "Backend Server" cmd /k "cd /d "%~dp0" && npm run server"

:: Aguarda 2 segundos para ter certeza que o servidor iniciou
timeout /t 2 /nobreak

:: Inicia o frontend em uma nova janela
start "Frontend Server" cmd /k "cd /d "%~dp0" && npm run dev"

echo Sistema iniciado! Acesse http://localhost:4000 no seu navegador
pause
