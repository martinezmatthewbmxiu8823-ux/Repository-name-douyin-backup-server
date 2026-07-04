# Render部署指南

## 步骤1：创建GitHub仓库

1. 访问 https://github.com/new
2. 创建新仓库，名称：douyin-backup-server
3. 设为Public（免费）

## 步骤2：推送代码

```bash
cd C:\Users\Administrator\Desktop\精品\竞品助手_服务器版

# 初始化git
git init
git add .
git commit -m "Initial commit"

# 关联远程仓库
git remote add origin https://github.com/你的用户名/douyin-backup-server.git
git push -u origin main
```

## 步骤3：部署到Render

1. 访问 https://render.com/
2. 注册并登录（可用GitHub登录）
3. 点击 "New +" → "Web Service"
4. 连接GitHub仓库：douyin-backup-server
5. 配置：
   - Name: douyin-backup
   - Environment: Docker
   - Plan: Free
6. 添加环境变量：
   - DOUYIN_COOKIES: [你的Cookie]
7. 点击 "Create Web Service"

## 步骤4：添加MongoDB

1. 在Render控制台，点击 "New +" → "PostgreSQL"
   （免费版只有PostgreSQL，我们改用它）
2. 或者使用MongoDB Atlas（免费）：
   - 访问 https://www.mongodb.com/cloud/atlas/register
   - 创建免费集群
   - 获取连接字符串
   - 在Render环境变量添加：MONGO_URL

## 完成！

你的服务器地址：https://douyin-backup.onrender.com

API地址：
- https://douyin-backup.onrender.com/api/stats
- https://douyin-backup.onrender.com/api/video/2026-07-04
