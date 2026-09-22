import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Save, Upload } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  COVER_OPTIONS,
  categories,
  productTypes,
  type Category,
  type Product,
  type ProductType,
} from '../../data/store';
import {
  MAX_BYTES,
  compressCover,
  formatBytes,
  removeBlob,
  saveBlob,
} from '../../lib/files';
import FileBadge from '../../components/FileBadge';

type Form = {
  title: string;
  author: string;
  description: string;
  priceUsd: string;
  category: Exclude<Category, 'all'>;
  productType: ProductType;
  cover: string;
  platform: string;
  featured: boolean;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  hasFile?: boolean;
};

const empty: Form = {
  title: '',
  author: '',
  description: '',
  priceUsd: '10',
  category: 'books',
  productType: 'book',
  cover: COVER_OPTIONS[0],
  platform: '',
  featured: false,
};

export default function OwnerProductForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const { getProduct, addProduct, updateProduct } = useStore();
  const nav = useNavigate();
  const [form, setForm] = useState<Form>(empty);
  const [prog, setProg] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isNew && id) {
      const p = getProduct(id);
      if (p) {
        setForm({
          title: p.title,
          author: p.author,
          description: p.description,
          priceUsd: String(p.priceUsd),
          category: p.category,
          productType: p.productType,
          cover: p.cover,
          platform: p.platform || '',
          featured: !!p.featured,
          fileId: p.fileId,
          fileName: p.fileName,
          fileSize: p.fileSize,
          hasFile: p.hasFile,
        });
      }
    }
  }, [id, isNew, getProduct]);

  const set =
    (k: keyof Form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const v =
        e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm((f) => {
        const next = { ...f, [k]: v };
        if (k === 'productType') {
          const t = productTypes.find((x) => x.id === v);
          if (t) next.category = t.cat;
        }
        return next;
      });
    };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setErr(`الحد ${formatBytes(MAX_BYTES)}`);
      return;
    }
    setBusy(true);
    setErr('');
    setProg(0);
    try {
      if (form.fileId) await removeBlob(form.fileId).catch(() => undefined);
      const fid = `f-${Date.now().toString(36)}`;
      await saveBlob(fid, file, file.name, (p) => setProg(p));
      setForm((f) => ({
        ...f,
        fileId: fid,
        fileName: file.name,
        fileSize: file.size,
        hasFile: true,
      }));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'فشل الرفع');
    } finally {
      setBusy(false);
      setProg(0);
    }
  };

  const onCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = await compressCover(file);
      setForm((f) => ({ ...f, cover: data }));
    } catch {
      setErr('فشل الغلاف');
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload: Omit<Product, 'id'> = {
      title: form.title.trim(),
      author: form.author.trim() || 'المتجر',
      description: form.description.trim() || form.title,
      priceUsd: Math.max(0, Number(form.priceUsd) || 0),
      category: form.category,
      productType: form.productType,
      cover: form.cover,
      rating: 5,
      reviews: 0,
      featured: form.featured,
      platform: form.platform || undefined,
      fileId: form.fileId,
      fileName: form.fileName,
      fileSize: form.fileSize,
      hasFile: !!(form.fileId || form.hasFile),
    };
    if (isNew) {
      const p = addProduct(payload);
      nav(`/owner/products/${p.id}`);
    } else if (id) {
      updateProduct(id, payload);
      nav('/owner/products');
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <Link to="/owner/products" className="inline-flex items-center gap-1 text-sm text-muted">
        <ArrowRight className="w-4 h-4" />
        المنتجات
      </Link>
      <h1 className="font-display text-2xl font-bold text-navy">
        {isNew ? 'إضافة منتج' : 'تعديل منتج'}
      </h1>

      <form onSubmit={submit} className="rounded-2xl bg-white border border-navy/8 p-5 space-y-3 shadow-sm">
        {/* File upload first - key feature */}
        <div className="rounded-xl border-2 border-dashed border-navy/20 bg-cream p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-sm font-bold text-navy">ملف المنتج (حتى 500MB)</p>
            {(form.fileName || form.productType) && (
              <FileBadge fileName={form.fileName} productType={form.productType} size="md" />
            )}
          </div>
          <input ref={ref} type="file" className="hidden" onChange={onFile} />
          {form.fileName ? (
            <div className="flex items-center justify-between gap-2 bg-white rounded-lg p-3 border border-emerald-200">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy truncate" dir="ltr">
                  {form.fileName}
                </p>
                <p className="text-[11px] text-muted">
                  {form.fileSize ? formatBytes(form.fileSize) : ''} · رمز{' '}
                  {form.fileName.split('.').pop()?.toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => ref.current?.click()}
                className="text-xs font-bold text-navy underline shrink-0"
              >
                استبدال
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => ref.current?.click()}
              className="w-full flex flex-col items-center gap-1 py-6 text-navy"
            >
              <Upload className="w-8 h-8 text-gold" />
              <span className="text-sm font-bold">اختر PDF / APK / ZIP / …</span>
              <span className="text-[11px] text-muted">الرمز يظهر تلقائيًا حسب الامتداد</span>
            </button>
          )}
          {busy && (
            <div className="mt-2 h-2 rounded-full bg-navy/10 overflow-hidden">
              <div className="h-full bg-gold transition-all" style={{ width: `${prog}%` }} />
            </div>
          )}
          {err && <p className="text-xs text-rose-600 mt-2">{err}</p>}
        </div>

        <input className="field" required placeholder="اسم المنتج" value={form.title} onChange={set('title')} />
        <input className="field" placeholder="الناشر / المطوّر" value={form.author} onChange={set('author')} />
        <textarea className="field resize-y" rows={2} placeholder="وصف قصير" value={form.description} onChange={set('description')} />

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="label">النوع</span>
            <select className="field" value={form.productType} onChange={set('productType')}>
              {productTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="label">التصنيف</span>
            <select className="field" value={form.category} onChange={set('category')}>
              {categories
                .filter((c) => c.id !== 'all')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
            </select>
          </label>
          <label className="block">
            <span className="label">السعر بالدولار $</span>
            <input className="field" type="number" min={0} step={0.01} value={form.priceUsd} onChange={set('priceUsd')} dir="ltr" />
          </label>
          <label className="block">
            <span className="label">المنصة (اختياري)</span>
            <input className="field" placeholder="Android / Windows" value={form.platform} onChange={set('platform')} />
          </label>
        </div>

        <div>
          <span className="label">الغلاف</span>
          <div className="flex flex-wrap gap-2 mb-2">
            {COVER_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((f) => ({ ...f, cover: c }))}
                className={`w-12 h-14 rounded-lg overflow-hidden border-2 ${
                  form.cover === c ? 'border-gold' : 'border-transparent'
                }`}
              >
                <img src={c} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={onCover} />
          <button type="button" onClick={() => coverRef.current?.click()} className="text-xs font-bold text-navy underline">
            رفع صورة غلاف
          </button>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" checked={form.featured} onChange={set('featured')} />
          مميز في الرئيسية
        </label>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-navy text-white font-bold px-5 py-2.5 text-sm"
        >
          <Save className="w-4 h-4" />
          {isNew ? 'نشر' : 'حفظ'}
        </button>
      </form>
    </div>
  );
}
