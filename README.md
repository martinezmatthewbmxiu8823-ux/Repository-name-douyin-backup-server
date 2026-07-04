# 抖音短视频榜单自动备份服务器

## 📋 功能介绍

这是一个**独立的服务器系统**，可以：

- ✅ 每天**自动**访问抖音罗盘短视频榜
- ✅ 提取并保存视频数据到数据库
- ✅ 提供API接口查询历史数据
- ✅ 支持日期范围查询
- ✅ 360天后拥有完整历史数据

---

## 🚀 快速部署

### 方法1：Docker部署（推荐）

```bash
# 1. 克隆或复制整个目录
cd 竞品助手_服务器版

# 2. 复制环境变量配置
cp .env.example .env

# 3. 编辑.env，设置你的Cookie
nano .env

# 4. 启动服务
docker-compose up -d

# 5. 查看日志
docker-compose logs -f
```

### 方法2：本地部署

```bash
# 1. 安装MongoDB
# Windows: 下载安装 https://www.mongodb.com/try/download/community
# Linux: sudo apt install mongodb

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
nano .env

# 4. 启动服务
npm start
```

---

## 🔧 配置Cookie

这是**最关键**的一步！你需要从浏览器中提取罗盘的登录Cookie：

### 提取Cookie步骤：

1. 打开Chrome，访问罗盘并登录
2. 按F12打开开发者工具
3. 切换到Application标签
4. 左侧选择Cookies → https://compass.jinritemai.com
5. 复制所有Cookie

### 在Console执行提取脚本：

```javascript
// 自动提取所有Cookie
copy(JSON.stringify(
  document.cookie.split(';').map(c => {
    const [name, ...v] = c.trim().split('=');
    return {
      name: name,
      value: v.join('='),
      domain: '.jinritemai.com'
    };
  })
));
```

执行后，Cookie已复制到剪贴板，粘贴到`.env`文件的`DOUYIN_COOKIES`中。

---

## 📊 API接口

### 1. 获取指定日期的数据

```bash
GET http://localhost:3000/api/videos/2026-07-04
```

响应：
```json
{
  "success": true,
  "data": {
    "date": "2026-07-04",
    "videos": [...],
    "count": 50
  }
}
```

### 2. 获取日期范围的数据

```bash
GET http://localhost:3000/api/videos?startDate=2025-01-01&endDate=2026-01-31
```

### 3. 获取统计信息

```bash
GET http://localhost:3000/api/stats
```

响应：
```json
{
  "success": true,
  "stats": {
    "totalDays": 360,
    "latestDate": "2026-07-04",
    "oldestDate": "2025-07-10",
    "totalVideos": 50
  }
}
```

### 4. 手动触发备份

```bash
POST http://localhost:3000/api/backup/trigger
```

---

## ⏰ 自动备份

系统会在**每天凌晨2点**自动执行备份任务。

可以通过修改`server.js`中的cron表达式来调整时间：

```javascript
// 每天凌晨2点
cron.schedule('0 2 * * *', ...);

// 每6小时
cron.schedule('0 */6 * * *', ...);

// 每小时
cron.schedule('0 * * * *', ...);
```

---

## 📁 数据存储

数据存储在MongoDB中：

- **数据库名**: `douyin_backup`
- **集合名**: `videos`
- **数据结构**:
  ```json
  {
    "date": "2026-07-04",
    "timestamp": 1720051200000,
    "videos": [
      {
        "rank": 1,
        "title": "视频标题",
        "author": "作者",
        "cover": "封面URL",
        "url": "视频URL",
        "plays": "100w",
        "likes": "10w",
        "comments": "1w"
      }
    ],
    "count": 50
  }
  ```

---

## 🔄 查看备份状态

```bash
# 查看服务器日志
docker-compose logs -f backup_server

# 查看MongoDB数据
docker exec -it douyin_mongodb mongosh
> use douyin_backup
> db.videos.countDocuments()
> db.videos.find().limit(1)
```

---

## 💡 Chrome扩展配合使用

创建一个Chrome扩展，从服务器API读取历史数据：

```javascript
// 查询历史数据
fetch('http://localhost:3000/api/videos/2025-01-01')
  .then(r => r.json())
  .then(data => {
    console.log('历史数据:', data);
  });
```

---

## ⚠️ 注意事项

1. **Cookie有效期**：Cookie会过期，需要定期更新
2. **服务器稳定性**：确保服务器24小时运行
3. **数据备份**：定期备份MongoDB数据
4. **网络环境**：服务器需要能访问罗盘网站

---

## 🎯 最终效果

部署后：
- ✅ 服务器每天自动备份数据
- ✅ 360天后拥有完整历史数据
- ✅ 通过API随时查询
- ✅ 不依赖任何权限，完全自主控制

---

## 📞 故障排查

### 问题1：备份失败

```bash
# 查看日志
docker-compose logs backup_server

# 检查Cookie是否有效
# 手动执行备份
docker exec -it douyin_backup_server node scripts/backup.js
```

### 问题2：无法访问罗盘

- 检查Cookie是否过期
- 检查网络连接
- 检查罗盘是否更新了验证机制

### 问题3：数据库连接失败

```bash
# 检查MongoDB状态
docker-compose ps

# 重启MongoDB
docker-compose restart mongodb
```

---

## 🚀 立即开始

1. 复制`竞品助手_服务器版`整个目录到服务器
2. 提取浏览器Cookie
3. 配置`.env`文件
4. 运行`docker-compose up -d`
5. 等待每天自动备份

**360天后，你就是数据之王！** 📚🔥

---

作者：海鸥  
版本：1.0.0  
日期：2026-07-04
