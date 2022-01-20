#!/bin/bash

echo '---开始执行git checkout master---'
git checkout master
echo '---开始执行git pull---'
git pull
echo '---git pull执行完毕，开始执行yarn install---'
yarn
echo '---yarn install执行完毕，开始执行yarn build---'
yarn build
echo '---yarn build执行完毕 开始设置环境变量---'
export NODE_ENV=prod
echo '---环境变量设置完毕 开始执行yarn pm2---'
yarn pm2:prod
echo '---yarn pm2执行完毕 服务启动成功---'
