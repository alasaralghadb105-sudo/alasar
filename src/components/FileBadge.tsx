import { fileBadge } from '../lib/files';

export default function FileBadge({
  fileName,
  productType,
  size = 'sm',
}: {
  fileName?: string;
  productType?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const b = fileBadge(fileName, productType);
  const box =
    size === 'lg'
      ? 'w-14 h-16 text-sm'
      : size === 'md'
        ? 'w-11 h-13 text-[11px]'
        : 'px-1.5 py-0.5 text-[10px]';
  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center rounded-md font-black shadow ${b.bg} ${b.text} ${box}`}
      >
        {b.label}
      </span>
    );
  }
  return (
    <div
      className={`relative ${box} rounded-md shadow-md ${b.bg} ${b.text} flex items-center justify-center font-black overflow-hidden`}
      title={b.label}
    >
      <div className="absolute top-0 left-0 border-t-[6px] border-l-[6px] border-t-white/90 border-l-transparent" />
      {b.label}
    </div>
  );
}
