#!/usr/bin/bash
set -e

# 获取当前脚本的绝对路径
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )"

# nginx 文件的配置路径
NGINX_CONF_PATH="${SCRIPT_DIR}/../nginx/nginx.conf"
# nginx 渲染后的临时文件
NGINX_TEMP_PATH="${SCRIPT_DIR}/../nginx/temp.conf"

# server 入口
SERVER_APP_PATH="${SCRIPT_DIR}/../server/app.js"

# web 静态资源目录
WEB_DIST="${SCRIPT_DIR}/../build"

# 替换 index 目录，渲染临时的 nginx 配置文件
NGINX_ROOT_KEY='{{root_page_dir}}'
echo "`sed "s#${NGINX_ROOT_KEY}#${WEB_DIST}#" ${NGINX_CONF_PATH}`" > ${NGINX_TEMP_PATH}

# 先停止
bash "${SCRIPT_DIR}/stop.sh"

# 启动 nginx
nginx -c ${NGINX_TEMP_PATH}
rm ${NGINX_TEMP_PATH}
echo "nginx started successfully"

# # 启动 server
pm2 start ${SERVER_APP_PATH} -i 1
echo "server started successfully"
