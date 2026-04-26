"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";

interface GalleryUploadProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function GalleryUpload({ urls, onChange, max = 12 }: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    const slots = max - urls.length;
    const selected = Array.from(files).slice(0, slots);
    if (!selected.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await Promise.all(
        selected.map(async (file) => {
          const form = new FormData();
          form.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: form });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Upload failed");
          return data.url as string;
        })
      );
      onChange([...urls, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function remove(index: number) {
    onChange(urls.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {urls.map((url, i) => (
          <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Gallery image ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute right-1 top-1 rounded-full bg-background/80 p-1 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {urls.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-foreground/30 disabled:opacity-50"
          >
            {uploading ? (
              <span>Uploading…</span>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span>Add image</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {urls.length} / {max} images
      </p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
