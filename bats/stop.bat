@echo off
echo Service stopping...
cd /d %~dp0
call ./vars.bat

REM 关闭nginx
cd /d %Nginx_Dir% || goto error_nginx_dir
.\nginx.exe -s stop || goto error_nginx_stopping

REM 关闭server
pm2 delete all || goto error_server_Stopping

echo Service stopped.
exit

:error_nginx_dir
echo nginx file dir was not found.
exit
:error_nginx_stopping
echo nginx stop failed.
exit

:error_server_dir
echo server file dir was not found.
exit
:error_server_Stopping
echo server start failed.
exit