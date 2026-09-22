import type { PayMethod, Product, Settings } from '../data/store';
import { formatMoney } from '../data/store';

export type AIContext = {
  settings: Settings;
  products: Product[];
  payMethods: PayMethod[];
  currency: Settings['displayCurrency'];
};

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\u0600-\u06FFa-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAny(t: string, words: string[]) {
  return words.some((w) => t.includes(norm(w)));
}

function findProducts(q: string, products: Product[], limit = 4): Product[] {
  const t = norm(q);
  const scored = products
    .map((p) => {
      const blob = norm(
        `${p.title} ${p.author} ${p.description} ${p.category} ${p.productType} ${p.fileName || ''}`
      );
      let score = 0;
      for (const w of t.split(' ')) {
        if (w.length < 2) continue;
        if (blob.includes(w)) score += w.length > 3 ? 3 : 1;
      }
      if (t.includes('طب') && p.category === 'medicine') score += 5;
      if (t.includes('كتاب') && p.productType === 'book') score += 3;
      if ((t.includes('تطبيق') || t.includes('apk')) && p.productType === 'app')
        score += 4;
      if (t.includes('برنامج') && p.productType === 'software') score += 4;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.p);
}

function listPays(pays: PayMethod[]) {
  const enabled = pays.filter((p) => p.enabled);
  if (!enabled.length) return 'لا توجد طرق دفع مفعّلة حالياً. تواصل مع المتجر.';
  return enabled
    .map((p) => {
      const cur = [
        p.acceptYER ? 'ر.ي' : '',
        p.acceptUSD ? '$' : '',
      ]
        .filter(Boolean)
        .join('/');
      return `• ${p.label}${cur ? ` (${cur})` : ''}: ${p.details}`;
    })
    .join('\n');
}

function listProducts(
  products: Product[],
  currency: Settings['displayCurrency'],
  rate: number,
  limit = 6
) {
  if (!products.length) return 'لا توجد منتجات معروضة حالياً.';
  return products
    .slice(0, limit)
    .map(
      (p) =>
        `• ${p.title} — ${formatMoney(p.priceUsd, currency, rate)}${
          p.fileName ? ` [${p.fileName.split('.').pop()?.toUpperCase()}]` : ''
        }`
    )
    .join('\n');
}

/** محرك ردود ذكي محلي — يجيب من بيانات المتجر بدون API خارجي */
export function answerCustomer(raw: string, ctx: AIContext): string {
  const q = norm(raw);
  const { settings, products, payMethods, currency } = ctx;
  const rate = settings.yerPerUsd || 530;
  const name = settings.storeName || 'المتجر';

  if (!q) {
    return `مرحباً بك في ${name} 👋\nكيف أقدر أساعدك؟ اسأل عن المنتجات، الأسعار، الدفع، أو التحميل.`;
  }

  if (hasAny(q, ['مرحبا', 'السلام', 'اهلا', 'هلا', 'hi', 'hello'])) {
    return `أهلاً وسهلاً في ${name}!\nأنا المساعد الذكي للمتجر. أقدر أجاوبك عن:\n• المنتجات والكتب والتطبيقات\n• الأسعار (ر.ي / $)\n• طرق الدفع اليمنية\n• كيف تشتري وتحمّل بعد التأكيد\nاسألني أي شيء.`;
  }

  if (hasAny(q, ['شكرا', 'مشكور', 'يعطيك'])) {
    return 'العفو! إذا احتجت أي مساعدة ثانية أنا هنا 😊';
  }

  // تحميل / طلب
  if (
    hasAny(q, [
      'تحميل',
      'حمل',
      'تنزيل',
      'ملف',
      'بعد الدفع',
      'تاكيد',
      'تأكيد',
      'مشترياتي',
      'طلب',
    ])
  ) {
    return `طريقة التحميل في ${name}:\n1) أضف المنتج للسلة وأتمم الشراء\n2) حوّل المبلغ بإحدى طرق الدفع اليمنية\n3) ينتظر الطلب تأكيد صاحب المتجر\n4) ادخل «مشترياتي» برقم الطلب + بريدك\n5) بعد التأكيد يظهر زر «تحميل»\n\nملاحظة: التحميل يبقى مقفلاً حتى يؤكد المالك استلام التحويل.`;
  }

  // دفع
  if (
    hasAny(q, [
      'دفع',
      'تحويل',
      'كريمي',
      'تضامن',
      'جوالي',
      'ون كاش',
      'صرافه',
      'صرافة',
      'واتساب',
      'usdt',
      'iban',
      'حساب',
    ])
  ) {
    return `طرق الدفع المتاحة في ${name}:\n${listPays(payMethods)}\n\nبعد التحويل اكتب مرجع العملية في الملاحظات، ثم انتظر تأكيد المالك لفتح التحميل.`;
  }

  // عملة / سعر
  if (hasAny(q, ['عمله', 'عملة', 'ريال', 'دولار', 'ر.ي', 'yer', 'usd', 'صرف'])) {
    return `العملة في المتجر:\n• يمكنك التبديل بين ريال يمني (ر.ي) والدولار ($) من الشريط العلوي\n• سعر الصرف الحالي: 1$ = ${rate.toLocaleString('ar-EG')} ر.ي\n• الأسعار تُعرض حسب اختيارك (ر.ي أو $ أو الاثنين)`;
  }

  // تواصل
  if (hasAny(q, ['تواصل', 'رقم', 'جوال', 'هاتف', 'ايميل', 'بريد', 'واتس'])) {
    return `للتواصل مع ${name}:\n• البريد: ${settings.email}\n• الجوال: ${settings.phone}\n• المالك: ${settings.ownerName}\n\nأو أكمل طلبك من المتجر وسنتأكد من التحويل.`;
  }

  // سلة / شراء
  if (hasAny(q, ['سله', 'سلة', 'شراء', 'كيف اشتري', 'اطلب'])) {
    return `خطوات الشراء:\n1) من «المتجر» اختر كتاباً أو تطبيقاً أو ملفاً\n2) اضغط «أضف للسلة»\n3) من السلة → إتمام الشراء\n4) أدخل بياناتك واختر طريقة دفع يمنية\n5) بعد تأكيد المالك حمّل من «مشترياتي»`;
  }

  // حجم الملف
  if (hasAny(q, ['حجم', 'ميجا', 'mb', '500'])) {
    return `نعم — يمكن رفع/بيع ملفات رقمية حتى 500 ميجابايت (PDF، APK، ZIP، برامج…). رمز نوع الملف (PDF/APK/…) يظهر تلقائياً على بطاقة المنتج.`;
  }

  // أنواع المنتجات
  if (hasAny(q, ['انواع', 'أنواع', 'ماذا تبيعون', 'وش عندكم', 'منتجات'])) {
    return `${name} متجر رقمي شامل للطلاب:\n• كتب PDF\n• تطبيقات (APK)\n• برامج\n• دورات وملفات\n• منتجات طبية رقمية\n\nأحدث المنتجات:\n${listProducts(products, currency, rate)}\n\nتصفح الكل من صفحة المتجر.`;
  }

  // عن المتجر
  if (hasAny(q, ['عن', 'من انتم', 'تعريف', 'وصف المتجر'])) {
    return `${settings.about}\n\nالشعار: ${settings.tagline}`;
  }

  // بحث منتجات
  const found = findProducts(raw, products);
  if (found.length) {
    const lines = found
      .map(
        (p) =>
          `• ${p.title}\n  ${p.description.slice(0, 90)}${p.description.length > 90 ? '…' : ''}\n  السعر: ${formatMoney(p.priceUsd, currency, rate)} — من صفحة المنتج /p/${p.id}`
      )
      .join('\n\n');
    return `هذا ما وجدته لك:\n\n${lines}\n\nافتح «المتجر» للتفاصيل أو أضف للسلة مباشرة.`;
  }

  if (hasAny(q, ['سعر', 'بكم', 'كم', 'رخيص', 'غالي'])) {
    return `الأسعار بالدولار وتُحوَّل لليمني تلقائياً (1$ ≈ ${rate} ر.ي).\nبعض المنتجات:\n${listProducts(products, currency, rate, 5)}\n\nاكتب اسم منتج محدد لأبحث لك عنه.`;
  }

  // افتراضي
  return `لم أجد تطابقاً دقيقاً، لكن أقدر أساعدك في ${name} حول:\n• البحث عن منتج (اكتب اسمه)\n• الدفع والتحويل\n• التحميل بعد تأكيد الطلب\n• العملة ر.ي / $\n• التواصل: ${settings.email}\n\nجرّب سؤالاً أوضح مثل: «كيف أحمّل بعد التحويل؟» أو «طرق الدفع» أو اسم كتاب/تطبيق.`;
}

export const QUICK_PROMPTS = [
  'كيف أشتري وأحمّل؟',
  'طرق الدفع',
  'ما المنتجات المتوفرة؟',
  'العملة ر.ي و $',
  'كيف أتواصل معكم؟',
];
