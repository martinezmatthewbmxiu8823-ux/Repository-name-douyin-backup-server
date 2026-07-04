// 服务器主程序
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// MongoDB连接
let db;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = 'douyin_backup';

async function connectDB() {
  try {
    const client = await MongoClient.connect(mongoUrl);
    db = client.db(dbName);
    console.log('✅ MongoDB连接成功');
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error);
    process.exit(1);
  }
}

// API路由

// 获取指定日期的数据
app.get('/api/videos/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const collection = db.collection('videos');

    const data = await collection.findOne({ date });

    if (data) {
      res.json({
        success: true,
        data: data
      });
    } else {
      res.status(404).json({
        success: false,
        message: '该日期没有数据'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取日期范围的数据
app.get('/api/videos', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const collection = db.collection('videos');

    const query = {};
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const data = await collection.find(query).sort({ date: -1 }).toArray();

    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取统计信息
app.get('/api/stats', async (req, res) => {
  try {
    const collection = db.collection('videos');

    const totalDays = await collection.countDocuments();
    const latestData = await collection.findOne({}, { sort: { date: -1 } });
    const oldestData = await collection.findOne({}, { sort: { date: 1 } });

    res.json({
      success: true,
      stats: {
        totalDays: totalDays,
        latestDate: latestData?.date,
        oldestDate: oldestData?.date,
        totalVideos: latestData?.videos?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 手动触发全量备份
app.post('/api/backup/trigger', async (req, res) => {
  try {
    const { runFullBackup } = require('./scripts/full-backup');
    const results = await runFullBackup(db);

    res.json({
      success: true,
      message: '全量备份任务已触发',
      results: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取指定榜单的数据
app.get('/api/:rankType/:date', async (req, res) => {
  try {
    const { rankType, date } = req.params;
    const { RANKS } = require('./scripts/full-backup');

    const rankConfig = RANKS[rankType];
    if (!rankConfig) {
      return res.status(404).json({
        success: false,
        message: '未知的榜单类型'
      });
    }

    const collection = db.collection(rankConfig.collection);
    const data = await collection.findOne({ date });

    if (data) {
      res.json({
        success: true,
        data: data
      });
    } else {
      res.status(404).json({
        success: false,
        message: '该日期没有数据'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// 获取所有榜单类型
app.get('/api/ranks', (req, res) => {
  const { RANKS } = require('./scripts/full-backup');
  res.json({
    success: true,
    ranks: Object.keys(RANKS).map(key => ({
      key: key,
      name: RANKS[key].name,
      collection: RANKS[key].collection
    }))
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
async function startServer() {
  await connectDB();

  // 设置定时任务 - 每天凌晨2点执行全量备份
  cron.schedule('0 2 * * *', async () => {
    console.log('⏰ 定时备份任务启动...');
    try {
      const { runFullBackup } = require('./scripts/full-backup');
      await runFullBackup(db);
      console.log('✅ 定时备份完成');
    } catch (error) {
      console.error('❌ 定时备份失败:', error);
    }
  });

  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 API文档: http://localhost:${PORT}/health`);
    console.log(`⏰ 定时备份: 每天凌晨2点`);
  });
}

startServer();
