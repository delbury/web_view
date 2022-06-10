#!/usr/bin/bash

# 停止 nginx 进程，忽略报错
nginx -s quit 2>/dev/null
pkill -9 nginx
echo "nginx was killed"

pm2 stop all
pm2 kill
pkill -9 pm2
echo "server was killed"

echo "all cleared"