"use client";

import { Download, ImageIcon, Loader2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { downloadBlob } from "@/lib/ffmpeg";
import { track } from "@/lib/analytics";

type Format = "image/jpeg" | "image/webp";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Couldn’t read that image."));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function compressImage(
  file: File,
  quality: number,
  maxWidth: number,
  format: Format,
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImage(file);
  const scale = img.width > maxWidth ? maxWidth / img.width : 1;
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser.");
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Compression failed."))),
      format,
      quality,
    );
  });

  return { blob, width, height };
}

export function ImageCompressor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.75);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [format, setFormat] = useState<Format>("image/jpeg");
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState<{
    blob: Blob;
    url: string;
    width: number;
    height: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, [preview]);

  const pickFile = (list: FileList | File[] | null) => {
    if (!list?.length) return;
    const next = Array.from(list).find((f) => f.type.startsWith("image/"));
    if (!next) {
      setError("Drop a JPG, PNG, or WebP image.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setResult(null);
    setError(null);
  };

  const runCompress = useCallback(async () => {
    if (!file) return;
    setWorking(true);
    setError(null);
    try {
      const { blob, width, height } = await compressImage(
        file,
        quality,
        maxWidth,
        format,
      );
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult({ blob, url, width, height });
      track("image_compressed", {
        format,
        quality,
        saved: file.size - blob.size,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed.");
    } finally {
      setWorking(false);
    }
  }, [file, format, maxWidth, quality]);

  useEffect(() => {
    if (!file) return;
    const t = window.setTimeout(() => void runCompress(), 250);
    return () => window.clearTimeout(t);
  }, [file, quality, maxWidth, format, runCompress]);

  const download = () => {
    if (!result || !file) return;
    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    const ext = format === "image/webp" ? "webp" : "jpg";
    downloadBlob(result.blob, `${base}-compressed.${ext}`);
    track("image_compressor_downloaded");
  };

  const saved =
    file && result ? Math.max(0, file.size - result.blob.size) : 0;
  const savedPct =
    file && result && file.size > 0
      ? Math.round((saved / file.size) * 100)
      : 0;

  return (
    <div className="space-y-5">
      <div
        role="button"
        tabIndex={0}
        className={`dropzone flex cursor-pointer flex-col items-center justify-center px-5 py-10 text-center outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${drag ? "active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          pickFile(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <Upload className="mb-2 text-primary" size={28} aria-hidden />
        <p className="font-medium text-text">Drop an image</p>
        <p className="mt-1 text-sm text-text-muted">
          JPG · PNG · WebP — compresses locally in your browser
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => pickFile(e.target.files)}
        />
      </div>

      {file && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="img-quality" className="mb-2 block text-sm font-medium text-text">
                Quality · {Math.round(quality * 100)}%
              </label>
              <input
                id="img-quality"
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-[var(--cta)]"
              />
            </div>
            <div>
              <label htmlFor="img-maxw" className="mb-2 block text-sm font-medium text-text">
                Max width · {maxWidth}px
              </label>
              <input
                id="img-maxw"
                type="range"
                min={320}
                max={4096}
                step={16}
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
                className="w-full accent-[var(--cta)]"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-text">Output format</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["image/jpeg", "JPEG"],
                  ["image/webp", "WebP"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`btn ${format === value ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setFormat(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                Original · {formatBytes(file.size)}
              </p>
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Original"
                  className="mx-auto max-h-48 rounded-lg object-contain"
                />
              )}
            </div>
            <div className="rounded-xl border border-border bg-muted p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                {working
                  ? "Compressing…"
                  : result
                    ? `Compressed · ${formatBytes(result.blob.size)}`
                    : "Compressed"}
              </p>
              {working && !result ? (
                <div className="flex h-48 items-center justify-center text-text-muted">
                  <Loader2 className="animate-spin" size={24} aria-hidden />
                </div>
              ) : result ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.url}
                  alt="Compressed"
                  className="mx-auto max-h-48 rounded-lg object-contain"
                />
              ) : (
                <div className="flex h-48 items-center justify-center text-text-muted">
                  <ImageIcon size={24} aria-hidden />
                </div>
              )}
            </div>
          </div>

          {result && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted px-4 py-3">
              <p className="text-sm text-text">
                {result.width}×{result.height}
                {saved > 0 ? (
                  <>
                    {" "}
                    · saved <span className="font-medium text-success">{formatBytes(saved)}</span>{" "}
                    ({savedPct}%)
                  </>
                ) : (
                  " · similar size — try lower quality"
                )}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={download}
                disabled={working}
              >
                <Download size={16} aria-hidden />
                Download
              </button>
            </div>
          )}
        </>
      )}

      {error && (
        <p className="alert-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
