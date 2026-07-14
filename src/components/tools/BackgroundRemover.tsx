"use client";

import { Download, Loader2, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { downloadBlob } from "@/lib/ffmpeg";
import { batchModeAtom } from "@/state/atoms";
import { track } from "@/lib/analytics";

type Item = {
  id: string;
  file: File;
  status: "idle" | "working" | "done" | "error";
  preview?: string;
  resultUrl?: string;
  error?: string;
};

export function BackgroundRemover() {
  const batch = useAtomValue(batchModeAtom);
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [drag, setDrag] = useState(false);

  const addFiles = (list: FileList | File[] | null) => {
    if (!list) return;
    const files = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const selected = batch ? files.slice(0, 8) : files.slice(0, 1);
    setItems(
      selected.map((file) => ({
        id: `${file.name}-${file.size}-${Math.random()}`,
        file,
        status: "idle",
        preview: URL.createObjectURL(file),
      })),
    );
  };

  const processOne = useCallback(async (item: Item) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, status: "working", error: undefined } : i,
      ),
    );
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(item.file, {
        progress: () => undefined,
      });
      const resultUrl = URL.createObjectURL(blob);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "done", resultUrl } : i,
        ),
      );
      track("background_removed");
    } catch (e) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: "error",
                error:
                  e instanceof Error
                    ? e.message
                    : "Removal failed. Try a clearer photo.",
              }
            : i,
        ),
      );
    }
  }, []);

  const processAll = async () => {
    for (const item of items) {
      if (item.status !== "done") await processOne(item);
    }
  };

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
          addFiles(e.dataTransfer.files);
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
        <p className="font-medium text-text">
          {batch ? "Drop images (up to 8)" : "Drop a photo"}
        </p>
        <p className="mt-1 text-sm text-text-muted">
          Runs in your browser · first run downloads a small AI model
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={batch}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <>
          <button
            type="button"
            className="btn btn-primary"
            onClick={processAll}
            disabled={items.every((i) => i.status === "working")}
          >
            {items.some((i) => i.status === "working") ? (
              <>
                <Loader2 className="animate-spin" size={18} aria-hidden />
                Removing…
              </>
            ) : (
              "Remove background"
            )}
          </button>

          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-muted p-3"
              >
                <p className="mb-2 truncate text-xs text-text-muted">
                  {item.file.name}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {item.preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.preview}
                      alt="Original"
                      className="aspect-square rounded-lg object-cover"
                    />
                  )}
                  {item.resultUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.resultUrl}
                      alt="No background"
                      className="aspect-square rounded-lg bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)] bg-[length:12px_12px] bg-[position:0_0,6px_6px] object-contain"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-border text-xs text-text-muted">
                      {item.status === "working" ? "Working…" : "Result"}
                    </div>
                  )}
                </div>
                {item.error && (
                  <p className="mt-2 text-xs text-danger">{item.error}</p>
                )}
                {item.resultUrl && (
                  <button
                    type="button"
                    className="btn btn-secondary mt-2 min-h-10 w-full text-sm"
                    onClick={async () => {
                      const res = await fetch(item.resultUrl!);
                      downloadBlob(await res.blob(), `${item.file.name.replace(/\.[^.]+$/, "")}-nobg.png`);
                    }}
                  >
                    <Download size={14} aria-hidden />
                    Download PNG
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
