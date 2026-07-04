# 🚀 Railway部署完整指南

## 第一步：创建GitHub仓库

1. 访问：https://github.com/new
2. 仓库名：`douyin-backup-server`
3. 设为 **Public**（免费部署需要公开仓库）
4. 不要勾选任何初始化选项
5. 点击 **Create repository**

## 第二步：推送代码

在PowerShell执行：

```powershell
cd C:\Users\Administrator\Desktop\精品\竞品助手_服务器版

# 设置主分支为main
git branch -M main

# 关联远程仓库（替换成你的GitHub用户名）
git remote add origin https://github.com/你的用户名/douyin-backup-server.git

# 推送
git push -u origin main
```

如果推送失败，可能需要配置GitHub认证：
```powershell
# 配置用户名和邮箱
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"

# 重新推送
git push -u origin main
```

## 第三步：部署到Railway

1. 访问：https://railway.app/
2. 点击右上角 **Login**
3. 选择 **Login with GitHub**
4. 授权Railway访问你的GitHub

### 创建项目

1. 点击 **New Project**
2. 选择 **Deploy from GitHub repo**
3. 如果是第一次，点击 **Configure GitHub App**
4. 选择你的仓库：`douyin-backup-server`
5. 点击 **Deploy Now**

### 添加MongoDB数据库

1. 在项目页面，点击 **New**
2. 选择 **Database**
3. 选择 **Add MongoDB**
4. Railway会自动创建数据库并生成连接字符串

### 配置环境变量

1. 点击你的服务（douyin-backup-server）
2. 切换到 **Variables** 标签
3. 添加环境变量：
   - **MONGO_URL**: 自动生成（MongoDB服务会自动注入）
   - **DOUYIN_COOKIES**: [需要手动添加]

### 获取Cookie

在罗盘页面Console执行：
```javascript
copy(JSON.stringify(document.cookie.split(';').map(c => {
  const [name, ...v] = c.trim().split('=');
  return {name, value: v.join('='), domain: '.jinritemai.com'};
})));
```

Cookie已复制，粘贴到 **DOUYIN_COOKIES** 变量中。

### 生成公开域名

1. 点击 **Settings**
2. 找到 **Networking**
3. 点击 **Generate Domain**
4. 你会得到一个域名，类似：`https://douyin-backup-server-production.up.railway.app`

## 第四步：测试部署

访问你的域名：
```
https://你的域名.railway.app/health
```

应该返回：
```json
{"status":"ok","timestamp":"2026-07-04T..."}
```

### 查看所有榜单

```
https://你的域名.railway.app/api/ranks
```

### 手动触发备份

```bash
curl -X POST https://你的域名.railway.app/api/backup/trigger
```

### 查看统计信息

```
https://你的域名.railway.app/api/stats
```

## 第五步：监控和日志

### 查看日志

1. 在Railway项目页面
2. 点击你的服务
3. 切换到 **Deployments** 标签
4. 点击最新部署
5. 查看实时日志

应该看到：
```
✅ MongoDB连接成功
🚀 服务器运行在 http://localhost:3000
⏰ 定时备份: 每天凌晨2点
```

### 查看资源使用

在 **Metrics** 标签查看：
- CPU使用率
- 内存使用
- 网络流量

## 🎉 完成！

你的服务器现在：
- ✅ 24小时运行
- ✅ 每天凌晨2点自动备份
- ✅ 数据永久保存
- ✅ 通过API随时查询

## 💰 费用说明

Railway免费版：
- **$5/月**免费额度
- 约**500小时**运行时间
- 如果每月运行720小时（30天），超出部分每小时约$0.02

建议：
- 定期检查余额
- 可以添加信用卡获得更多额度
- 或者在用完前暂停服务

## 🔄 更新代码

修改代码后：
```bash
cd C:\Users\Administrator\Desktop\精品\竞品助手_服务器版

git add .
git commit -m "更新说明"
git push

# Railway会自动重新部署
```

## ⚠️ 注意事项

1. **Cookie过期**：每隔一段时间需要更新DOUYIN_COOKIES
2. **数据备份**：定期导出MongoDB数据
3. **监控日志**：检查是否有备份失败

---

**立即开始部署！360天后你就拥有完整历史数据！** 🚀🔥
