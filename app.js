// ==============================================
// ملف تطبيق Express (app.js)
// مسؤوليته: تجهيز كائن Express وربط كل الـ middleware العام
// وربط الـ routes (سيتم إضافتها تباعاً في المراحل القادمة)
// فصل هذا الملف عن server.js يسهّل كتابة اختبارات (Tests) للتطبيق
// دون الحاجة لفتح اتصال حقيقي بالشبكة في كل مرة
// ==============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const config = require('./config');
const { notFound, errorHandler } = require('./errorMiddleware');

// إنشاء تطبيق Express
const app = express();

// ----- Middleware العام (يُطبّق على كل الطلبات) -----

// Helmet: يضيف رؤوس HTTP أمنية (Security Headers) لحماية التطبيق من ثغرات شائعة
app.use(helmet());

// CORS: السماح للواجهة الأمامية (Frontend) بالتواصل مع الـ API من نطاق مختلف
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Compression: ضغط الردود (Responses) لتسريع الاستجابة وتقليل استهلاك الشبكة
app.use(compression());

// Morgan: تسجيل (Logging) كل طلب HTTP في الـ console، مفيد جداً أثناء التطوير وتتبع الأخطاء
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// تمكين قراءة JSON من جسم الطلب (Body) مع حد أقصى لحجم البيانات (حماية من إغراق الخادم)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ----- مسار فحص صحة الخادم (Health Check) -----
// مفيد جداً عند النشر (Render/Vercel/VPS) للتأكد أن الخادم يعمل
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'الخادم يعمل بنجاح ✅',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// ----- ربط الـ Routes (سيتم تفعيلها تباعاً في المراحل القادمة) -----
// مثال لما سنضيفه لاحقاً:
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/categories', require('./routes/categoryRoutes'));
// app.use('/api/questions', require('./routes/questionRoutes'));
// app.use('/api/game', require('./routes/gameRoutes'));
// app.use('/api/payment', require('./routes/paymentRoutes'));

// ----- معالجة الأخطاء (يجب أن تبقى دائماً في آخر الملف) -----
app.use(notFound);
app.use(errorHandler);

module.exports = app;
