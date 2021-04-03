@echo off
echo Service stopping...
cd /d %~dp0
call ./vars.bat

REM 关闭nginx
cd /d %Nginx_Dir%
.\nginx.exe -s stop

REM 关闭server
pm2 kill

echo Service stopped.
exit
