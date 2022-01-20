#!/bin/bash

echo '---开始执行git checkout test---'
git checkout test
echo '---开始执行git pull---'
git pull
echo '---git pull执行完毕，开始执行yarn install---'
yarn
echo '---yarn install执行完毕，开始执行yarn build---'
yarn build
echo '---yarn build执行完毕 开始设置环境变量---'
export NODE_ENV=test
echo '---环境变量设置完毕 开始执行yarn pm2---'
yarn pm2:test
echo '---yarn pm2执行完毕 服务启动成功---'
