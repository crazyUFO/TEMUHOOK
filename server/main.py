from flask import Flask, request, jsonify
import redis
import os
import time
from dotenv import load_dotenv
from waitress import serve
import logging

# 加载 .env 文件中的环境变量
load_dotenv()

app = Flask(__name__)

# 连接 Redis
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT")),
    password=os.getenv("REDIS_PASSWORD")
)


# 登录接口
@app.route("/login", methods=["POST"])
def login():
    # 获取用户的IP地址
    user_ip = request.remote_addr
    data = request.get_json()
    username = data.get("username")
    logging.warning(f"用户名 {username} ip {user_ip}正在请求登录...")
    if not username:
        return jsonify({"error": "username require"}), 400
    user = redis_client.get(username)
    if not user:
        return jsonify({"error": "username not find"}), 400
    ttl = int(redis_client.ttl(user))

    return jsonify(
        {
            "message": "Login successful",
            "username": username,
            "ip": user_ip,
            ttl: "无期限" if ttl == -1 else ttl,
        }
    ),200


# 需要验证权限的接口
@app.route("/protected", methods=["GET"])
def protected():
    # 从请求头中获取用户名
    username = request.headers.get("X-Username")
    user_ip = request.remote_addr
    logging.warning(f"用户名 {username} ip {user_ip}正在请求鉴权")
    if not username:
        return jsonify({"error": "token require"}), 400
    user = redis_client.get(username)
    if not user:
        return jsonify({"error": "no token find"}), 400
    # # 检查用户名是否存在且未过期
    # stored_ip = redis_client.get(username)
    # if not stored_ip:
    #     return jsonify({'error': 'Unauthorized: User not logged in or session expired'}), 401

    # # 获取当前请求的IP地址
    # current_ip = request.remote_addr

    # # 验证当前IP地址是否与登录时的IP地址一致
    # if current_ip != stored_ip.decode('utf-8'):
    #     return jsonify({'error': 'Unauthorized: IP address mismatch'}), 401

    return jsonify({"message": f"{username}!"}),200


if __name__ == "__main__":
    # 使用 waitress 运行应用，绑定到 8765 端口
    logging.info("Starting server on port 8765...")
    serve(app, host="0.0.0.0", port=8765)
