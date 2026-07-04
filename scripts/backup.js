// 数据采集脚本
const puppeteer = require('puppeteer');

async function runBackup(db) {
  console.log('[备份] 开始执行备份任务...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 设置Cookie（需要提前获取有效的登录Cookie）
    const cookies = loadCookies();
    if (cookies.length > 0) {
      await page.setCookie(...cookies);
      console.log('[备份] Cookie已设置');
    }

    // 访问短视频榜
    const url = 'https://compass.jinritemai.com/shop/chance/video-rank';
    console.log('[备份] 访问:', url);

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForTimeout(5000);

    // 提取视频数据
    const videos = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('table tbody tr');

      rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 0) return;

        const video = {
          rank: index + 1,
          title: '',
          author: '',
          cover: '',
          url: '',
          plays: '',
          likes: '',
          comments: ''
        };

        // 提取封面
        const img = row.querySelector('img');
        if (img) video.cover = img.src || img.dataset.src || '';

        // 提取标题和链接
        const link = row.querySelector('a');
        if (link) {
          video.title = link.textContent.trim();
          video.url = link.href;
        }

        // 提取作者
        const authorEl = row.querySelector('[class*="author"]');
        if (authorEl) video.author = authorEl.textContent.trim();

        // 提取数据
        if (cells.length >= 3) {
          video.plays = cells[cells.length - 3]?.textContent.trim() || '';
          video.likes = cells[cells.length - 2]?.textContent.trim() || '';
          video.comments = cells[cells.length - 1]?.textContent.trim() || '';
        }

        if (video.title) {
          results.push(video);
        }
      });

      return results;
    });

    console.log(`[备份] 提取到 ${videos.length} 个视频`);

    // 保存到数据库
    if (videos.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const collection = db.collection('videos');

      const data = {
        date: today,
        timestamp: Date.now(),
        videos: videos,
        count: videos.length
      };

      await collection.updateOne(
        { date: today },
        { $set: data },
        { upsert: true }
      );

      console.log(`[备份] ✅ 已保存 ${today} 的数据`);
      return { success: true, date: today, count: videos.length };
    } else {
      console.log('[备份] ⚠️ 未提取到数据');
      return { success: false, message: '未提取到数据' };
    }

  } catch (error) {
    console.error('[备份] ❌ 失败:', error);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// 加载Cookie（从文件或环境变量）
function loadCookies() {
  // 这里需要你提供有效的罗盘登录Cookie
  // 可以从浏览器中提取，或者从环境变量读取

  const cookieString = process.env.DOUYIN_COOKIES;
  if (!cookieString) {
    console.warn('[备份] ⚠️ 未设置Cookie，可能无法访问');
    return [];
  }

  try {
    return JSON.parse(cookieString);
  } catch (e) {
    console.error('[备份] Cookie解析失败:', e);
    return [];
  }
}

// 导出
module.exports = { runBackup };

// 如果直接运行此脚本
if (require.main === module) {
  const { MongoClient } = require('mongodb');
  require('dotenv').config();

  (async () => {
    const client = await MongoClient.connect(process.env.MONGO_URL || 'mongodb://localhost:27017');
    const db = client.db('douyin_backup');

    await runBackup(db);

    await client.close();
    process.exit(0);
  })();
}
