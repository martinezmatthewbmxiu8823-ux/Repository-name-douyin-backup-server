# 一键部署到免费云服务

## 🎯 最简单方案：使用Vercel + MongoDB Atlas（完全免费）

### 为什么选这个组合？
- ✅ Vercel：完全免费，无限流量
- ✅ MongoDB Atlas：免费512MB数据库
- ✅ 无需信用卡
- ✅ 一键部署

---

## 📋 部署步骤（10分钟完成）

### 第一步：创建MongoDB Atlas数据库

1. 访问：https://www.mongodb.com/cloud/atlas/register
2. 注册账号（可用Google登录）
3. 创建免费集群：
   - 选择 "Shared" (Free)
   - 选择离你最近的区域（如Singapore）
   - 点击 "Create"
4. 等待3-5分钟创建完成
5. 创建数据库用户：
   - 点击 "Database Access"
   - 添加用户（记住用户名和密码）
6. 设置网络访问：
   - 点击 "Network Access"
   - 点击 "Add IP Address"
   - 选择 "Allow Access from Anywhere" (0.0.0.0/0)
7. 获取连接字符串：
   - 回到 "Database"
   - 点击 "Connect"
   - 选择 "Connect your application"
   - 复制连接字符串，类似：
     ```
     mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
     ```

### 第二步：一键部署到Vercel

点击下面的按钮（我会生成）：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的仓库)

或者手动部署：

1. 访问：https://vercel.com/
2. 用GitHub登录
3. 点击 "Add New..." → "Project"
4. 导入你的GitHub仓库
5. 配置环境变量：
   - `MONGO_URL`: 刚才复制的MongoDB连接字符串
   - `DOUYIN_COOKIES`: 你的罗盘Cookie
6. 点击 "Deploy"
7. 等待2-3分钟

### 完成！

你的服务器地址：`https://你的项目名.vercel.app`

测试：访问 `https://你的项目名.vercel.app/api/stats`

---

## 🔄 使用Railway（备选方案）

1. 访问：https://railway.app/
2. 用GitHub登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择你的仓库
6. Railway会自动检测到Dockerfile并部署
7. 添加MongoDB：
   - 点击 "New" → "Database" → "Add MongoDB"
8. 设置环境变量：
   - 自动生成 `MONGO_URL`
   - 手动添加 `DOUYIN_COOKIES`

---

## 💰 免费额度对比

| 服务 | 免费额度 | 限制 |
|------|---------|------|
| Vercel | 无限 | 函数执行10秒 |
| Railway | $5/月 | 500小时运行时间 |
| Render | 无限 | 15分钟无请求会休眠 |
| MongoDB Atlas | 512MB | 无连接限制 |

---

## ⚙️ 针对Vercel的调整

Vercel是Serverless，需要调整代码：

```javascript
// api/index.js - Vercel入口文件
const app = require('../server');

module.exports = app;
```

我现在帮你创建Vercel版本的配置！
