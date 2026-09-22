export type ProductType = 'book' | 'app' | 'software' | 'course' | 'template' | 'file';
export type Category =
  | 'all'
  | 'books'
  | 'apps'
  | 'software'
  | 'medicine'
  | 'courses'
  | 'files';

export type CurrencyMode = 'YER' | 'USD' | 'both';

export interface Product {
  id: string;
  title: string;
  author: string;
  description: string;
  priceUsd: number;
  originalUsd?: number;
  category: Exclude<Category, 'all'>;
  productType: ProductType;
  cover: string;
  rating: number;
  reviews: number;
  featured?: boolean;
  bestseller?: boolean;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  platform?: string;
}

export interface PayMethod {
  id: string;
  label: string;
  enabled: boolean;
  details: string;
  acceptYER: boolean;
  acceptUSD: boolean;
  /** يحتاج تأكيد المالك قبل التحميل */
  manual: boolean;
}

export interface OrderItem {
  productId: string;
  title: string;
  cover: string;
  priceUsd: number;
  quantity: number;
  fileId?: string;
  fileName?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  payMethod: string;
  note?: string;
  items: OrderItem[];
  totalUsd: number;
  status: 'بانتظار' | 'مؤكد';
}

export interface Settings {
  storeName: string;
  tagline: string;
  ownerName: string;
  email: string;
  phone: string;
  about: string;
  yerPerUsd: number;
  displayCurrency: CurrencyMode;
}

export const categories: { id: Category; label: string; icon: string }[] = [
  { id: 'all', label: 'الكل', icon: '🛒' },
  { id: 'books', label: 'كتب', icon: '📚' },
  { id: 'apps', label: 'تطبيقات', icon: '📱' },
  { id: 'software', label: 'برامج', icon: '💻' },
  { id: 'medicine', label: 'طب', icon: '🩺' },
  { id: 'courses', label: 'دورات', icon: '🎓' },
  { id: 'files', label: 'ملفات', icon: '📦' },
];

export const productTypes: {
  id: ProductType;
  label: string;
  cat: Exclude<Category, 'all'>;
}[] = [
  { id: 'book', label: 'كتاب / PDF', cat: 'books' },
  { id: 'app', label: 'تطبيق', cat: 'apps' },
  { id: 'software', label: 'برنامج', cat: 'software' },
  { id: 'course', label: 'دورة', cat: 'courses' },
  { id: 'template', label: 'قالب', cat: 'files' },
  { id: 'file', label: 'ملف', cat: 'files' },
];

export const COVERS = [
  '/images/covers/math.jpg',
  '/images/covers/cs.jpg',
  '/images/covers/medicine.jpg',
  '/images/covers/physics.jpg',
  '/images/covers/chemistry.jpg',
  '/images/covers/biology.jpg',
  '/images/covers/pharmacy.jpg',
  '/images/covers/english.jpg',
  '/images/covers/economics.jpg',
  '/images/covers/literature.jpg',
];

export const defaultPayMethods: PayMethod[] = [
  {
    id: 'kuraimi',
    label: 'بنك الكريمي',
    enabled: true,
    details: 'حوّل للحساب ثم أدخل مرجع التحويل',
    acceptYER: true,
    acceptUSD: true,
    manual: true,
  },
  {
    id: 'tadhamon',
    label: 'بنك التضامن',
    enabled: true,
    details: 'تحويل بنكي — اكتب رقم الطلب في الملاحظة',
    acceptYER: true,
    acceptUSD: true,
    manual: true,
  },
  {
    id: 'jawali',
    label: 'جوالي / فلوسك',
    enabled: true,
    details: 'حوّل لرقم المحفظة الظاهر في الإعدادات',
    acceptYER: true,
    acceptUSD: false,
    manual: true,
  },
  {
    id: 'onecash',
    label: 'ون كاش',
    enabled: true,
    details: 'ادفع عبر ون كاش ثم أرسل المرجع',
    acceptYER: true,
    acceptUSD: true,
    manual: true,
  },
  {
    id: 'exchange',
    label: 'حوالة صرافة',
    enabled: true,
    details: 'أرسل حوالة باسم المستلم والمدينة',
    acceptYER: true,
    acceptUSD: true,
    manual: true,
  },
  {
    id: 'whatsapp',
    label: 'واتساب + إيصال',
    enabled: true,
    details: 'أرسل صورة الإيصال على واتساب المتجر',
    acceptYER: true,
    acceptUSD: true,
    manual: true,
  },
  {
    id: 'usdt',
    label: 'USDT',
    enabled: true,
    details: 'حوّل USDT (TRC20) لعنوان المحفظة',
    acceptYER: false,
    acceptUSD: true,
    manual: true,
  },
];

export const defaultSettings: Settings = {
  storeName: 'كتبي',
  tagline: 'متجر رقمي للطلاب',
  ownerName: 'صاحب المتجر',
  email: 'support@kitabi.ye',
  phone: '9677xxxxxxx',
  about:
    'متجر إلكتروني رقمي بسيط: كتب PDF وتطبيقات وملفات. دفع يمني، أسعار بالريال والدولار، وتحميل بعد تأكيد المالك.',
  yerPerUsd: 530,
  displayCurrency: 'both',
};

export const initialProducts: Product[] = [
  {
    id: 'p-calc',
    title: 'أساسيات التفاضل والتكامل',
    author: 'د. أحمد المنصوري',
    description: 'مرجع جامعي واضح مع أمثلة محلولة.',
    priceUsd: 9,
    originalUsd: 14,
    category: 'books',
    productType: 'book',
    cover: '/images/covers/math.jpg',
    rating: 4.9,
    reviews: 1200,
    featured: true,
    bestseller: true,
    fileName: 'calculus.pdf',
  },
  {
    id: 'p-python',
    title: 'بايثون من الصفر',
    author: 'م. كريم العلي',
    description: 'تعلّم البرمجة بمشاريع عملية للطلاب.',
    priceUsd: 11,
    originalUsd: 16,
    category: 'books',
    productType: 'book',
    cover: '/images/covers/cs.jpg',
    rating: 4.95,
    reviews: 2100,
    featured: true,
    bestseller: true,
    fileName: 'python.pdf',
  },
  {
    id: 'p-anatomy',
    title: 'التشريح البشري المبسّط',
    author: 'د. هدى الإبراهيم',
    description: 'أطلس دراسي لطلاب الطب والعلوم الصحية.',
    priceUsd: 12,
    originalUsd: 18,
    category: 'medicine',
    productType: 'book',
    cover: '/images/covers/medicine.jpg',
    rating: 4.9,
    reviews: 1500,
    featured: true,
    bestseller: true,
    fileName: 'anatomy.pdf',
  },
  {
    id: 'p-pharma',
    title: 'دليل علم الأدوية',
    author: 'د. سارة القحطاني',
    description: 'جداول مجموعات دوائية سهلة الحفظ.',
    priceUsd: 11,
    category: 'medicine',
    productType: 'book',
    cover: '/images/covers/pharmacy.jpg',
    rating: 4.85,
    reviews: 980,
    featured: true,
    fileName: 'pharma.pdf',
  },
  {
    id: 'p-timer',
    title: 'تطبيق مؤقت المذاكرة',
    author: 'فريق كتبي',
    description: 'APK أندرويد بتقنية بومودورو.',
    priceUsd: 4,
    originalUsd: 7,
    category: 'apps',
    productType: 'app',
    cover: '/images/covers/cs.jpg',
    rating: 4.7,
    reviews: 540,
    featured: true,
    bestseller: true,
    fileName: 'study-timer.apk',
    platform: 'Android',
  },
  {
    id: 'p-notes',
    title: 'برنامج NoteMaster',
    author: 'أدوات الطالب',
    description: 'برنامج ويندوز لتنظيم الملاحظات.',
    priceUsd: 8,
    category: 'software',
    productType: 'software',
    cover: '/images/covers/cs.jpg',
    rating: 4.6,
    reviews: 310,
    featured: true,
    fileName: 'notemaster-setup.exe',
    platform: 'Windows',
  },
  {
    id: 'p-cv',
    title: 'حزمة قوالب سيرة ذاتية',
    author: 'استوديو التوظيف',
    description: 'قوالب Word جاهزة للخريجين.',
    priceUsd: 3,
    originalUsd: 6,
    category: 'files',
    productType: 'template',
    cover: '/images/covers/economics.jpg',
    rating: 4.8,
    reviews: 890,
    bestseller: true,
    fileName: 'cv-pack.zip',
  },
  {
    id: 'p-course',
    title: 'دورة بايثون — ملفات',
    author: 'م. كريم العلي',
    description: 'أكواد وتمارين PDF داخل ZIP.',
    priceUsd: 15,
    originalUsd: 22,
    category: 'courses',
    productType: 'course',
    cover: '/images/covers/cs.jpg',
    rating: 4.9,
    reviews: 1100,
    featured: true,
    fileName: 'python-course.zip',
  },
];

export const OWNER = { user: 'admin', pass: 'kitabi2024' };

export const COVER_OPTIONS = [
  '/images/covers/math.jpg',
  '/images/covers/physics.jpg',
  '/images/covers/cs.jpg',
  '/images/covers/medicine.jpg',
  '/images/covers/pharmacy.jpg',
  '/images/covers/nursing.jpg',
  '/images/covers/economics.jpg',
  '/images/covers/english.jpg',
];

export function createId(title: string) {
  const s = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .slice(0, 24);
  return `${s || 'p'}-${Date.now().toString(36)}`;
}

export function usdToYer(usd: number, rate: number) {
  return Math.round(usd * rate);
}

export function formatMoney(
  usd: number,
  mode: CurrencyMode,
  rate: number
): string {
  const yer = usdToYer(usd, rate);
  if (mode === 'YER') return `${yer.toLocaleString('ar-EG')} ر.ي`;
  if (mode === 'USD') return `$${usd % 1 ? usd.toFixed(2) : usd}`;
  return `${yer.toLocaleString('ar-EG')} ر.ي · $${usd % 1 ? usd.toFixed(2) : usd}`;
}
