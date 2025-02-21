#!/bin/bash

# Redis 安装和配置脚本 for Debian 12

# 设置 Redis 密码（可选）
REDIS_PASSWORD="xiaosan@2020"

# 更新系统包
echo "更新系统包..."
sudo apt update
sudo apt upgrade -y

# 安装 Redis
echo "安装 Redis..."
sudo apt install redis-server -y

# 启动 Redis 服务
echo "启动 Redis 服务..."
sudo systemctl start redis

# 设置 Redis 开机自启
echo "设置 Redis 开机自启..."
sudo systemctl enable redis

# 配置 Redis 监听所有网络接口
echo "配置 Redis 监听所有网络接口..."
sudo sed -i 's/bind 127.0.0.1/bind 0.0.0.0/' /etc/redis/redis.conf

# 设置 Redis 密码
if [ -n "$REDIS_PASSWORD" ]; then
    echo "设置 Redis 密码..."
    sudo sed -i "s/# requirepass foobared/requirepass $REDIS_PASSWORD/" /etc/redis/redis.conf
fi

# 重启 Redis 服务以应用更改
echo "重启 Redis 服务..."
sudo systemctl restart redis

# 开放防火墙端口（如果防火墙已启用）
if command -v ufw &> /dev/null; then
    echo "开放防火墙端口 6379..."
    sudo ufw allow 6379
    sudo ufw reload
fi

# 验证 Redis 安装
echo "验证 Redis 安装..."
redis-cli ping

if [ $? -eq 0 ]; then
    echo "Redis 安装成功！"
else
    echo "Redis 安装失败，请检查日志。"
fi

# 输出 Redis 连接信息
echo "Redis 连接信息："
echo "IP: $(hostname -I | awk '{print $1}')"
echo "端口: 6379"
if [ -n "$REDIS_PASSWORD" ]; then
    echo "密码: $REDIS_PASSWORD"
else
    echo "密码: 未设置"
fi