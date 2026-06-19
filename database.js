// ==============================================
// ملف الاتصال بقاعدة بيانات MongoDB
// مسؤوليته الوحيدة: فتح اتصال موثوق بقاعدة البيانات
// وإنهاء التطبيق بشكل آمن عند فشل الاتصال الأولي
// ==============================================

const mongoose = require('mongoose');

/**
 * دالة الاتصال بقاعدة البيانات
 * تُستدعى مرة واحدة فقط عند تشغيل الخادم (داخل server.js)
 */
const connectDatabase = async () => {
  try {
    // رابط الاتصال يُقرأ من متغيرات البيئة (.env) - لا نكتبه مباشرة في الكود أبداً
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ تم الاتصال بقاعدة البيانات بنجاح: ${connection.connection.host}`);

    // الاستماع لأحداث الاتصال بعد نجاح الاتصال الأول (مفيد لمراقبة الانقطاعات)
    mongoose.connection.on('error', (error) => {
      console.error('❌ خطأ في اتصال قاعدة البيانات أثناء التشغيل:', error.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ تم فصل الاتصال بقاعدة البيانات');
    });
  } catch (error) {
    // إذا فشل الاتصال الأولي، لا فائدة من تشغيل خادم بدون قاعدة بيانات
    console.error('❌ فشل الاتصال الأولي بقاعدة البيانات:', error.message);
    process.exit(1); // إنهاء العملية برمز خطأ (1)
  }
};

module.exports = connectDatabase;
