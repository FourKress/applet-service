#!/bin/bash

echo '---开始执行git pull---'
git pull
echo '---git pull执行完毕，开始yarn build---'
yarn build
exho '---yarn build 执行完毕---'
