@echo off
echo [%date% %time%] Starting ChangeFlow backend... > startup.log

echo [%date% %time%] Starting MongoDB service... >> startup.log
net start MongoDB >> startup.log 2>&1

echo [%date% %time%] Waiting 3 seconds for MongoDB to initialize... >> startup.log
timeout /t 3 /nobreak > nul

echo [%date% %time%] Starting Node.js server... >> startup.log
cd /d %~dp0server

node server.js >> startup.log 2>&1
