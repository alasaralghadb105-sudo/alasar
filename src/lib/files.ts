const DB = 'digistore-files';
const STORE = 'files';
export const MAX_BYTES = 500 * 1024 * 1024;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => {
      if (!r.result.objectStoreNames.contains(STORE)) {
        r.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export async function saveBlob(
  id: string,
  blob: Blob,
  name: string,
  typeOrProgress?: string | ((p: number) => void),
  onProgress?: (p: number) => void
) {
  if (blob.size > MAX_BYTES) {
    throw new Error(`الحد الأقصى ${formatBytes(MAX_BYTES)}`);
  }
  const type =
    typeof typeOrProgress === 'string'
      ? typeOrProgress
      : blob.type || 'application/octet-stream';
  const progress =
    typeof typeOrProgress === 'function' ? typeOrProgress : onProgress;

  // شريط تقدّم تقريبي للملفات الكبيرة (IndexedDB لا يعطي تقدمًا حقيقيًا)
  if (progress) {
    progress(8);
    await new Promise((r) => setTimeout(r, 30));
    progress(35);
  }

  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({
      id,
      name,
      type,
      size: blob.size,
      blob,
      at: Date.now(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  if (progress) {
    progress(100);
  }
}

export async function getBlob(id: string) {
  const db = await open();
  const row = await new Promise<{
    name: string;
    blob: Blob;
  } | null>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return row;
}

export async function removeBlob(id: string) {
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function downloadBlob(id: string) {
  const row = await getBlob(id);
  if (!row) return false;
  const url = URL.createObjectURL(row.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = row.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}

export function formatBytes(n: number) {
  if (!n) return '0 B';
  const u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), u.length - 1);
  return `${(n / 1024 ** i).toFixed(i ? 1 : 0)} ${u[i]}`;
}

export function extOf(name?: string) {
  if (!name || !name.includes('.')) return '';
  return name.split('.').pop()!.toLowerCase();
}

export type FileBadge = { label: string; bg: string; text: string };

const MAP: Record<string, FileBadge> = {
  pdf: { label: 'PDF', bg: 'bg-rose-600', text: 'text-white' },
  epub: { label: 'EPUB', bg: 'bg-orange-600', text: 'text-white' },
  apk: { label: 'APK', bg: 'bg-emerald-600', text: 'text-white' },
  aab: { label: 'AAB', bg: 'bg-emerald-700', text: 'text-white' },
  ipa: { label: 'IPA', bg: 'bg-slate-800', text: 'text-white' },
  exe: { label: 'EXE', bg: 'bg-sky-700', text: 'text-white' },
  msi: { label: 'MSI', bg: 'bg-sky-600', text: 'text-white' },
  dmg: { label: 'DMG', bg: 'bg-indigo-600', text: 'text-white' },
  zip: { label: 'ZIP', bg: 'bg-amber-500', text: 'text-navy' },
  rar: { label: 'RAR', bg: 'bg-violet-600', text: 'text-white' },
  '7z': { label: '7Z', bg: 'bg-violet-700', text: 'text-white' },
  mp4: { label: 'MP4', bg: 'bg-fuchsia-600', text: 'text-white' },
  mp3: { label: 'MP3', bg: 'bg-pink-600', text: 'text-white' },
  fig: { label: 'FIG', bg: 'bg-violet-500', text: 'text-white' },
  psd: { label: 'PSD', bg: 'bg-blue-700', text: 'text-white' },
  docx: { label: 'DOCX', bg: 'bg-blue-600', text: 'text-white' },
  xlsx: { label: 'XLSX', bg: 'bg-green-700', text: 'text-white' },
  pptx: { label: 'PPTX', bg: 'bg-orange-600', text: 'text-white' },
};

const TYPE_FALLBACK: Record<string, FileBadge> = {
  book: { label: 'PDF', bg: 'bg-rose-600', text: 'text-white' },
  app: { label: 'APK', bg: 'bg-emerald-600', text: 'text-white' },
  software: { label: 'EXE', bg: 'bg-sky-700', text: 'text-white' },
  file: { label: 'FILE', bg: 'bg-slate-600', text: 'text-white' },
  course: { label: 'ZIP', bg: 'bg-amber-500', text: 'text-navy' },
  template: { label: 'ZIP', bg: 'bg-amber-500', text: 'text-navy' },
};

export function fileBadge(fileName?: string, productType?: string): FileBadge {
  const e = extOf(fileName);
  if (e && MAP[e]) return MAP[e];
  return TYPE_FALLBACK[productType || 'file'] || TYPE_FALLBACK.file;
}

export const ACCEPT =
  '.pdf,.epub,.zip,.rar,.7z,.apk,.aab,.ipa,.exe,.msi,.dmg,.mp3,.mp4,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.fig,.psd,application/pdf,application/zip,application/octet-stream';

export function compressCover(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 640 / img.width);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('صورة غير صالحة'));
    };
    img.src = url;
  });
}
