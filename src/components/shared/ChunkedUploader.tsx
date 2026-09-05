'use client';

import { useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useChunkedUpload } from '@/hooks/useMeta';

interface ChunkedUploaderProps {
  value: string;
  label?: string;
  category?: 'image' | 'video' | 'document';
  accept?: string;
  onChange: (url: string) => void;
  helperText?: string;
}

export default function ChunkedUploader({
  value,
  label = 'Upload File',
  category = 'image',
  accept,
  onChange,
  helperText,
}: ChunkedUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, abort, progress, reset } = useChunkedUpload();
  const [error, setError] = useState('');

  const isBusy =
    progress.status === 'preparing' ||
    progress.status === 'uploading' ||
    progress.status === 'finalizing';

  async function handleFile(file: File) {
    setError('');
    try {
      const result = await upload(file, { category });
      onChange(result.url);
    } catch (e: any) {
      if (progress.status === 'aborted') return;
      setError(e?.message ?? 'Upload failed');
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  }

  function handleCancel() {
    void abort();
    reset();
  }

  function handleClear() {
    onChange('');
    reset();
  }

  return (
    <div className="flex flex-col gap-2">
      {value && category === 'image' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt={label}
          className="h-32 w-full rounded-[10px] object-cover bg-secondary/20"
        />
      )}
      {value && category === 'video' && (
        <video
          src={value}
          controls
          className="h-32 w-full rounded-[10px] bg-secondary/20"
        />
      )}
      {value && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-primary break-all font-[family-name:var(--font-poppins)]">
            {value.split('/').pop() || value}
          </p>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-danger hover:underline font-[family-name:var(--font-poppins)]"
          >
            Remove
          </button>
        </div>
      )}

      {isBusy && (
        <div className="flex flex-col gap-2 p-3 rounded-lg border border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between text-xs font-semibold text-text-primary font-[family-name:var(--font-poppins)]">
            <span>
              {progress.status === 'finalizing'
                ? 'Finalizing upload…'
                : `Uploading chunk ${progress.chunksUploaded} of ${progress.totalChunks}`}
            </span>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1 text-danger hover:underline"
            >
              <X size={12} /> Cancel
            </button>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/30">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-secondary font-[family-name:var(--font-poppins)]">
            <span>{progress.percent}%</span>
            <span>
              {(progress.bytesUploaded / (1024 * 1024)).toFixed(1)} MB /{' '}
              {(progress.totalBytes / (1024 * 1024)).toFixed(1)} MB
            </span>
          </div>
        </div>
      )}

      <label
        className={`w-full h-32 rounded-[10px] border-2 border-dashed bg-surface/50 flex items-center justify-center cursor-pointer transition-colors ${
          isBusy
            ? 'border-primary/50 pointer-events-none'
            : 'border-secondary/40 hover:border-primary/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept ?? (category === 'video' ? 'video/*' : category === 'image' ? 'image/*' : undefined)}
          className="hidden"
          onChange={handleChange}
          disabled={isBusy}
        />
        <span className="flex items-center gap-2 text-sm text-text-secondary font-[family-name:var(--font-poppins)]">
          {isBusy ? (
            <>
              <Loader2 size={16} className="animate-spin text-primary" />
              {progress.status === 'finalizing' ? 'Finalizing…' : 'Uploading…'}
            </>
          ) : (
            `+ ${label}`
          )}
        </span>
      </label>

      {helperText && (
        <p className="text-[11px] text-text-secondary font-[family-name:var(--font-poppins)]">
          {helperText}
        </p>
      )}

      {error && (
        <p className="text-xs text-danger font-[family-name:var(--font-poppins)]">{error}</p>
      )}
    </div>
  );
}
