// 多榜单备份脚本
const puppeteer = require('puppeteer');

// 榜单配置
const RANKS = {
  video: {
    name: '短视频榜',
    url: '/shop/chance/video-rank',
    collection: 'videos'
  },
  product: {
    name: '商品榜',
    url: '/shop/chance/product-rank',
    collection: 'products'
  },
  live: {
    name: '直播榜',
    url: '/shop/chance/live-rank',
    collection: 'lives'
  },
  creator: {
    name: '达人榜',
    url: '/shop/chance/creator-rank',
    collection: 'creators'
  }
};

async function runFullBackup(db) {
  console.log('[全量备份] 开始执行所有榜单备份...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {};

  try {
    const page = await browser.newPage();

    // 设置Cookie
    const cookies = loadCookies();
    if (cookies.length > 0) {
      await page.setCookie(...cookies);
    }

    // 备份每个榜单
    for (const [key, config] of Object.entries(RANKS)) {
      console.log(`\n[备份] 开始备份: ${config.name}`);

      try {
        const data = await backupRank(page, config, db);
        results[key] = data;
        console.log(`[备份] ✅ ${config.name} 完成 - ${data.count} 条数据`);
      } catch (error) {
        console.error(`[备份] ❌ ${config.name} 失败:`, error.message);
        results[key] = { success: false, error: error.message };
      }

      // 等待一下，避免请求过快
      await page.waitForTimeout(3000);
    }

  } finally {
    await browser.close();
  }

  console.log('\n[全量备份] 完成！');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

async function backupRank(page, config, db) {
  const url = `https://compass.jinritemai.com${config.url}`;

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForTimeout(5000);

  // 提取数据
  const items = await page.evaluate(() => {
    const results = [];
    const rows = document.querySelectorAll('table tbody tr');

    rows.forEach((row, index) => {
      const cells = row.querySelectorAll('td');
      if (cells.length === 0) return;

      const item = {
        rank: index + 1,
        data: {}
      };

      // 提取所有单元格数据
      cells.forEach((cell, i) => {
        const text = cell.textContent.trim();
        if (text) {
          item.data[`col_${i}`] = text;
        }
      });

      // 提取图片
      const img = row.querySelector('img');
      if (img) {
        item.image = img.src || img.dataset.src || '';
      }

      // 提取链接
      const link = row.querySelector('a');
      if (link) {
        item.title = link.textContent.trim();
        item.url = link.href;
      }

      if (Object.keys(item.data).length > 0) {
        results.push(item);
      }
    });

    return results;
  });

  // 保存到数据库
  if (items.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const collection = db.collection(config.collection);

    const data = {
      date: today,
      timestamp: Date.now(),
      type: config.name,
      items: items,
      count: items.length
    };

    await collection.updateOne(
      { date: today },
      { $set: data },
      { upsert: true }
    );

    return { success: true, date: today, count: items.length };
  }

  return { success: false, count: 0 };
}

function loadCookies() {
  const cookieString = process.env.DOUYIN_COOKIES;
  if (!cookieString) return [];

  try {
    return JSON.parse(cookieString);
  } catch (e) {
    return [];
  }
}

module.exports = { runFullBackup, RANKS };

// 直接运行
if (require.main === module) {
  const { MongoClient } = require('mongodb');
  require('dotenv').config();

  (async () => {
    const client = await MongoClient.connect(process.env.MONGO_URL || 'mongodb://localhost:27017');
    const db = client.db('douyin_backup');

    await runFullBackup(db);

    await client.close();
    process.exit(0);
  })();
}
