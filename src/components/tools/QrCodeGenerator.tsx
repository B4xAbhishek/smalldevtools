"use client";

import QRCode from "qrcode";
import { Download, Link2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { downloadBlob } from "@/lib/ffmpeg";
import { track } from "@/lib/analytics";

export function QrCodeGenerator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [text, setText] = useState(searchParams.get("text") ?? "https://");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (value: string) => {
    if (!value.trim()) {
      setDataUrl(null);
      return;
    }
    try {
      const url = await QRCode.toDataURL(value.trim(), {
        width: 512,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setDataUrl(url);
      setError(null);
    } catch {
      setError("Couldn’t generate that QR code.");
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => generate(text), 200);
    return () => window.clearTimeout(t);
  }, [text, generate]);

  const syncShareLink = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (text.trim()) params.set("text", text.trim());
    else params.delete("text");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const download = async () => {
    if (!dataUrl) return;
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    downloadBlob(blob, "qr-code.png");
    track("qr_downloaded");
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="qr-text" className="mb-2 block text-sm font-medium text-text">
          Text or URL
        </label>
        <textarea
          id="qr-text"
          className="field min-h-[96px] resize-y"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={syncShareLink}
          placeholder="https://example.com"
        />
        <p className="mt-1.5 text-xs text-text-muted">
          Shareable: add <code className="text-text">?text=...</code> to this page URL.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-secondary" onClick={syncShareLink}>
          <Link2 size={16} aria-hidden />
          Update share link
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!dataUrl}
          onClick={download}
        >
          <Download size={16} aria-hidden />
          Download PNG
        </button>
      </div>

      {error && (
        <p className="alert-error" role="alert">
          {error}
        </p>
      )}

      {dataUrl && (
        <div className="flex justify-center rounded-xl border border-border bg-muted p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dataUrl} alt="Generated QR code" className="h-48 w-48" />
        </div>
      )}
    </div>
  );
}
