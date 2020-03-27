@echo off
echo Service starting...
cd /d %~dp0
call ./vars.bat

REM REM 启动nginx
cd /d %Nginx_Dir% || goto error_nginx_dir
start %Nginx_Dir%\nginx.exe || goto error_nginx_starting

REM 删除原有的文件信息
cd /d %~dp0
cd %Stat_File_Dir%
del .\%Stat_File_Name%

REM REM 启动server
cd /d %~dp0
cd %Server_Dir% || goto error_server_dir

pm2 start %Server_Main% || goto error_server_starting

echo Service started.
exit

:error_nginx_dir
echo nginx file dir was not found.
pause
exit
:error_nginx_starting
echo nginx start failed.
pause
exit

:error_server_dir
echo server file dir was not found.
pause
exit
:error_server_starting
echo server start failed.
pause
exit