from flask import Flask, request, jsonify
import redis
import os
import time
from dotenv import load_dotenv
from waitress import serve

# 加载 .env 文件中的环境变量
load_dotenv()

app = Flask(__name__)

# 连接 Redis
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST'),
    port=int(os.getenv('REDIS_PORT')),
)

# 登录接口
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')

    if not username:
        return jsonify({'error': 'Username is required'}), 400

    return jsonify({'message': 'Login successful', 'username': username})

# 需要验证权限的接口
@app.route('/protected', methods=['GET'])
def protected():
    # 从请求头中获取用户名
    username = request.headers.get('X-Username')

    if not username:
        return jsonify({'error': 'no token find'}), 400

    # 检查用户名是否存在且未过期
    expiration_time = redis_client.get(username)
    if not expiration_time:
        return jsonify({'error': 'Unauthorized: User not logged in or session expired'}), 401

    # expiration_time = int(expiration_time.decode('utf-8'))
    # if time.time() > expiration_time:
    #     return jsonify({'error': 'Unauthorized: Session expired'}), 401

    return jsonify({'message': f'Hello, {username}! This is a protected route.'})

if __name__ == '__main__':
    # 使用 waitress 运行应用，绑定到 8765 端口
    print("Starting server on port 8765...")
    serve(app, host='0.0.0.0', port=8765)