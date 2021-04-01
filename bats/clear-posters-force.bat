@REM 强制清除所有的视频 poster
@echo off
echo Script starting...
cd /d %~dp0
call ./vars.bat

cd /d %Scripts_Dir%
node %Script_Clear_Posters% -f || goto error
exit

:error
echo failed
pause
exit