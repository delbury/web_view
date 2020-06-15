@echo off
echo Script starting...
cd /d %~dp0
call ./vars.bat

cd /d %Scripts_Dir%
node %Script_Clear_Posters% || goto error
exit

:error
echo failed
pause
exit