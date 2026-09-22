import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ImagePlus,
  Layers,
  Trash2,
  Upload,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  COVER_OPTIONS,
  categories,
  productTypes,
  type Category,
  type ProductType,
} from '../../data/store';
import {
  ACCEPT,
  MAX_BYTES,
  compressCover,
  extOf,
  fileBadge,
  formatBytes,
  saveBlob,
} from '../../lib/files';
import FileBadge from '../../components/FileBadge';

type Row = {
  key: string;
  file: File;
  title: string;
  priceUsd: string;
  productType: ProductType;
  category: Exclude<Category, 'all'>;
  author: string;
  /** صورة الغلاف من الهاتف/الجهاز (data URL) */
  cover?: string;
  status: 'ready' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
};

function guessType(file: File): ProductType {
  const e = extOf(file.name);
  if (e === 'pdf' || e === 'epub') return 'book';
  if (e === 'apk' || e === 'aab' || e === 'ipa') return 'app';
  if (e === 'exe' || e === 'msi' || e === 'dmg') return 'software';
  if (e === 'zip' || e === 'rar' || e === '7z') return 'course';
  return 'file';
}

function titleFromName(name: string) {
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || name;
}

function defaultCover(name: string) {
  const list = COVER_OPTIONS.length ? COVER_OPTIONS : ['/images/covers/math.jpg'];
  const idx =
    Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % list.length;
  return list[idx];
}

export default function OwnerBulkUpload() {
  const { addProducts, settings } = useStore();
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverTargetKey, setCoverTargetKey] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [sharedAuthor, setSharedAuthor] = useState(
    settings.ownerName || 'المتجر'
  );
  const [sharedPrice, setSharedPrice] = useState('10');
  const [running, setRunning] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [msg, setMsg] = useState('');

  const totalSize = useMemo(
    () => rows.reduce((s, r) => s + r.file.size, 0),
    [rows]
  );

  const addFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    const next: Row[] = [];
    const errors: string[] = [];

    for (const file of list) {
      if (file.size > MAX_BYTES) {
        errors.push(`${file.name}: أكبر من 500MB`);
        continue;
      }
      const productType = guessType(file);
      const meta = productTypes.find((t) => t.id === productType);
      next.push({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 6)}`,
        file,
        title: titleFromName(file.name),
        priceUsd: sharedPrice,
        productType,
        category: meta?.cat || 'files',
        author: sharedAuthor,
        cover: undefined,
        status: 'ready',
        progress: 0,
      });
    }

    if (errors.length) setMsg(errors.slice(0, 3).join(' · '));
    else setMsg('');

    setRows((prev) => {
      const names = new Set(prev.map((r) => `${r.file.name}:${r.file.size}`));
      const unique = next.filter(
        (r) => !names.has(`${r.file.name}:${r.file.size}`)
      );
      return [...prev, ...unique];
    });
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const updateRow = (key: string, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const removeRow = (key: string) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
  };

  const openCoverPicker = (key: string) => {
    if (running) return;
    setCoverTargetKey(key);
    // تأخير بسيط لضمان تحديث الـ ref قبل النقر على أجهزة الجوال
    requestAnimationFrame(() => coverInputRef.current?.click());
  };

  const onCoverPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = coverTargetKey;
    e.target.value = '';
    setCoverTargetKey(null);
    if (!file || !key) return;

    if (!file.type.startsWith('image/')) {
      setMsg('اختر صورة فقط (JPG / PNG / WEBP…)');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setMsg('صورة الغلاف كبيرة — الحد 12MB');
      return;
    }

    try {
      const dataUrl = await compressCover(file);
      updateRow(key, { cover: dataUrl });
      setMsg('');
    } catch {
      setMsg('تعذّر قراءة الصورة — جرّب صورة أخرى');
    }
  };

  const applyShared = () => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        author: sharedAuthor || r.author,
        priceUsd: sharedPrice || r.priceUsd,
      }))
    );
  };

  const publish = async () => {
    if (!rows.length || running) return;
    const invalid = rows.find((r) => !r.title.trim() || Number(r.priceUsd) < 0);
    if (invalid) {
      setMsg('أكمل اسم المنتج والسعر لكل صف');
      return;
    }

    setRunning(true);
    setDoneCount(0);
    setMsg('');
    const createdPayload: Parameters<typeof addProducts>[0] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      updateRow(row.key, { status: 'uploading', progress: 5, error: undefined });
      try {
        const fileId = `f-${Date.now().toString(36)}-${i}-${Math.random().toString(36).slice(2, 6)}`;
        await saveBlob(fileId, row.file, row.file.name, (p) =>
          updateRow(row.key, { progress: p })
        );
        const cover = row.cover || defaultCover(row.file.name);

        createdPayload.push({
          title: row.title.trim(),
          author: row.author.trim() || settings.ownerName || 'المتجر',
          description: `${row.title.trim()} — ملف رقمي ${fileBadge(row.file.name).label}`,
          priceUsd: Math.max(0, Number(row.priceUsd) || 0),
          category: row.category,
          productType: row.productType,
          cover,
          fileId,
          fileName: row.file.name,
          fileSize: row.file.size,
          featured: false,
        });
        updateRow(row.key, { status: 'done', progress: 100 });
        setDoneCount((c) => c + 1);
      } catch (err) {
        updateRow(row.key, {
          status: 'error',
          error: err instanceof Error ? err.message : 'فشل الرفع',
          progress: 0,
        });
      }
    }

    if (createdPayload.length) {
      addProducts(createdPayload);
      setMsg(`تم نشر ${createdPayload.length} منتج بنجاح`);
      setTimeout(() => nav('/owner/products'), 900);
    } else {
      setMsg('لم يُرفع أي منتج — راجع الأخطاء');
    }
    setRunning(false);
  };

  return (
    <div className="max-w-3xl space-y-4 pb-8">
      {/* input مخفي لاختيار صورة من الهاتف لكل منتج */}
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onCoverPick}
      />

      <Link
        to="/owner/products"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-navy"
      >
        <ArrowRight className="w-4 h-4" />
        المنتجات
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-navy flex items-center gap-2">
          <Layers className="w-6 h-6 text-gold" />
          رفع عدة منتجات
        </h1>
        <p className="text-sm text-muted mt-1">
          ارفع الملفات ثم اختر{' '}
          <strong className="text-navy">صورة لكل منتج من هاتفك</strong> لتميّزها
          عن بعضها
        </p>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="rounded-2xl border-2 border-dashed border-navy/20 bg-white p-6 text-center shadow-sm"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={onPick}
        />
        <Upload className="w-10 h-10 text-gold mx-auto mb-2" />
        <p className="font-display font-bold text-navy mb-1">
          اسحب الملفات هنا أو اخترها
        </p>
        <p className="text-xs text-muted mb-4">
          عدة ملفات معًا · ثم صورة غلاف لكل منتج من المعرض أو الكاميرا
        </p>
        <button
          type="button"
          disabled={running}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-navy text-white font-bold px-5 py-2.5 text-sm disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          اختيار ملفات متعددة
        </button>
      </div>

      {rows.length > 0 && (
        <div className="rounded-2xl bg-white border border-navy/8 p-4 shadow-sm">
          <p className="text-sm font-bold text-navy mb-3">
            قيم مشتركة ({rows.length} ملف · {formatBytes(totalSize)})
          </p>
          <div className="grid sm:grid-cols-3 gap-2">
            <label className="block">
              <span className="label">الناشر</span>
              <input
                className="field"
                value={sharedAuthor}
                onChange={(e) => setSharedAuthor(e.target.value)}
                disabled={running}
              />
            </label>
            <label className="block">
              <span className="label">سعر افتراضي $</span>
              <input
                className="field"
                type="number"
                min={0}
                step={0.01}
                value={sharedPrice}
                onChange={(e) => setSharedPrice(e.target.value)}
                dir="ltr"
                disabled={running}
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={applyShared}
                disabled={running}
                className="w-full rounded-xl border border-navy/15 text-navy font-bold py-2.5 text-sm hover:bg-navy/5 disabled:opacity-50"
              >
                تطبيق على الكل
              </button>
            </div>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((r, index) => {
            const preview = r.cover || defaultCover(r.file.name);
            const locked = running || r.status === 'done';
            return (
              <div
                key={r.key}
                className={`rounded-2xl border bg-white p-3 shadow-sm ${
                  r.status === 'error'
                    ? 'border-rose-200'
                    : r.status === 'done'
                      ? 'border-emerald-200'
                      : 'border-navy/8'
                }`}
              >
                <div className="flex gap-3 items-start">
                  {/* صورة المنتج — قابلة للتحميل من الهاتف */}
                  <div className="shrink-0 w-[4.5rem] space-y-1.5">
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => openCoverPicker(r.key)}
                      className="relative block w-[4.5rem] h-[5.5rem] rounded-xl overflow-hidden border-2 border-dashed border-navy/20 bg-cream group disabled:opacity-70"
                      title="تحميل صورة من الهاتف"
                    >
                      <img
                        src={preview}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {!locked && (
                        <span className="absolute inset-0 bg-navy/45 opacity-0 group-hover:opacity-100 group-active:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                          <Camera className="w-5 h-5 mb-0.5" />
                          <span className="text-[9px] font-bold">صورة</span>
                        </span>
                      )}
                      {r.cover && (
                        <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white" />
                      )}
                    </button>
                    {!locked && (
                      <button
                        type="button"
                        onClick={() => openCoverPicker(r.key)}
                        className="w-full inline-flex items-center justify-center gap-0.5 rounded-lg bg-navy/5 text-navy text-[10px] font-bold py-1.5 active:bg-navy/10"
                      >
                        <ImagePlus className="w-3 h-3" />
                        {r.cover ? 'تغيير' : 'من الهاتف'}
                      </button>
                    )}
                    {r.cover && !locked && (
                      <button
                        type="button"
                        onClick={() => updateRow(r.key, { cover: undefined })}
                        className="w-full text-[10px] text-muted underline"
                      >
                        إزالة
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-navy/50">
                        #{index + 1}
                      </span>
                      <FileBadge
                        fileName={r.file.name}
                        productType={r.productType}
                      />
                      <p
                        className="text-[11px] font-mono text-muted truncate flex-1"
                        dir="ltr"
                      >
                        {r.file.name} · {formatBytes(r.file.size)}
                      </p>
                      {r.status === 'done' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          تم
                        </span>
                      )}
                      {r.status === 'error' && (
                        <span className="text-[10px] font-bold text-rose-600">
                          {r.error || 'خطأ'}
                        </span>
                      )}
                    </div>

                    <input
                      className="field py-2"
                      value={r.title}
                      onChange={(e) =>
                        updateRow(r.key, { title: e.target.value })
                      }
                      disabled={locked}
                      placeholder="اسم المنتج"
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <select
                        className="field py-2 text-xs"
                        value={r.productType}
                        disabled={locked}
                        onChange={(e) => {
                          const productType = e.target.value as ProductType;
                          const meta = productTypes.find(
                            (t) => t.id === productType
                          );
                          updateRow(r.key, {
                            productType,
                            category: meta?.cat || r.category,
                          });
                        }}
                      >
                        {productTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <select
                        className="field py-2 text-xs"
                        value={r.category}
                        disabled={locked}
                        onChange={(e) =>
                          updateRow(r.key, {
                            category: e.target
                              .value as Exclude<Category, 'all'>,
                          })
                        }
                      >
                        {categories
                          .filter((c) => c.id !== 'all')
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                      </select>
                      <input
                        className="field py-2 text-xs"
                        type="number"
                        min={0}
                        step={0.01}
                        value={r.priceUsd}
                        dir="ltr"
                        disabled={locked}
                        onChange={(e) =>
                          updateRow(r.key, { priceUsd: e.target.value })
                        }
                        placeholder="السعر $"
                      />
                      <input
                        className="field py-2 text-xs"
                        value={r.author}
                        disabled={locked}
                        onChange={(e) =>
                          updateRow(r.key, { author: e.target.value })
                        }
                        placeholder="الناشر"
                      />
                    </div>

                    {!r.cover && !locked && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 rounded-lg px-2 py-1.5">
                        لم تُضف صورة بعد — اضغط «من الهاتف» لتمييز هذا المنتج
                      </p>
                    )}

                    {r.status === 'uploading' && (
                      <div className="h-1.5 rounded-full bg-navy/10 overflow-hidden">
                        <div
                          className="h-full bg-gold transition-all"
                          style={{ width: `${r.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {!running && r.status !== 'done' && (
                    <button
                      type="button"
                      onClick={() => removeRow(r.key)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
                      aria-label="إزالة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {msg && (
        <p
          className={`text-sm rounded-xl px-3 py-2 ${
            msg.includes('نجاح') || msg.includes('تم نشر')
              ? 'bg-emerald-50 text-emerald-800'
              : 'bg-amber-50 text-amber-900'
          }`}
        >
          {msg}
          {running && doneCount > 0 ? ` (${doneCount}/${rows.length})` : ''}
        </p>
      )}

      {rows.length > 0 && (
        <div className="flex flex-wrap gap-2 sticky bottom-4 z-10">
          <button
            type="button"
            onClick={publish}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-xl bg-gold text-navy font-bold px-6 py-3 text-sm shadow-lg disabled:opacity-60"
          >
            <Layers className="w-4 h-4" />
            {running
              ? `جارٍ الرفع… ${doneCount}/${rows.length}`
              : `نشر ${rows.length} منتج الآن`}
          </button>
          {!running && (
            <button
              type="button"
              onClick={() => setRows([])}
              className="rounded-xl border border-navy/15 bg-white text-navy font-bold px-4 py-3 text-sm shadow"
            >
              مسح القائمة
            </button>
          )}
        </div>
      )}
    </div>
  );
}
