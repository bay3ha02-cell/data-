// ==============================================
// نموذج السؤال (Question Model)
// كل سؤال ينتمي لفئة واحدة (علاقة Many-to-One مع Category)
// ==============================================

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'يجب ربط السؤال بفئة'],
    },
    text: {
      type: String,
      required: [true, 'نص السؤال مطلوب'],
      trim: true,
      maxlength: [500, 'نص السؤال طويل جداً'],
    },
    // خيارات الإجابة - تُستخدم فقط في أسئلة الاختيار من متعدد (type = mcq)
    options: {
      type: [String],
      default: [],
    },
    // الإجابة الصحيحة: نص مطابق لأحد عناصر options، أو "صح"/"خطأ"، أو إجابة حرة
    correctAnswer: {
      type: String,
      required: [true, 'الإجابة الصحيحة مطلوبة'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['mcq', 'true_false', 'open'], // mcq: اختيار من متعدد | true_false: صح/خطأ | open: إجابة مفتوحة
      default: 'mcq',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'], // سهل | متوسط | صعب
      default: 'medium',
    },
    // نقاط السؤال - تُمنح للفريق عند الإجابة الصحيحة (تُربط عادة بمستوى الصعوبة)
    points: {
      type: Number,
      default: 10,
      min: [1, 'النقاط يجب أن تكون 1 على الأقل'],
    },
    // يسمح بإخفاء سؤال (مثلاً تبيّن أنه خاطئ) دون حذفه نهائياً، حفاظاً على سجل الألعاب السابقة
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// فهرس مركّب (Compound Index) يسرّع كثيراً استعلام "أسئلة فعّالة من فئة معينة"
// وهو الاستعلام الأكثر تكراراً في منطق اللعبة (اختيار سؤال عشوائي أثناء اللعب)
questionSchema.index({ category: 1, isActive: 1 });

// تحقق إضافي قبل الحفظ: سؤال الاختيار من متعدد يجب أن يحتوي خيارين على الأقل
questionSchema.pre('validate', function (next) {
  if (this.type === 'mcq' && this.options.length < 2) {
    return next(new Error('سؤال الاختيار من متعدد يجب أن يحتوي خيارين على الأقل'));
  }
  next();
});

module.exports = mongoose.model('Question', questionSchema);
