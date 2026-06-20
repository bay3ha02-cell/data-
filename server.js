const config = require('./config');
const connectDatabase = require('./database');
const app = require('./app');

// أخطاء مفاجئة
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // الاتصال بقاعدة البيانات
    await connectDatabase();

    // تشغيل السيرفر
    const server = app.listen(PORT, () => {
      console.log('==========================================');
      console.log(`🚀 الخادم يعمل الآن على المنفذ: ${PORT}`);
      console.log(`🌍 بيئة التشغيل: ${config.env}`);
      console.log(`🔗 Health: https://YOUR-URL/api/health`);
      console.log('==========================================');
    });

    // أخطاء async
    process.on('unhandledRejection', (error) => {
      console.error('❌ Unhandled Rejection:', error.message);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error('❌ فشل تشغيل السيرفر:', error.message);
    process.exit(1);
  }
};

// تشغيل السيرفر
startServer();
