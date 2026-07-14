"use client";

import { fetchFile } from "@ffmpeg/util";
import { Download, Loader2, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { downloadBlob, getFFmpeg } from "@/lib/ffmpeg";
import { batchModeAtom } from "@/state/atoms";
import { track } from "@/lib/analytics";

type Item = {
  id: string;
  file: File;
  status: "idle" | "working" | "done" | "error";
  progress: number;
  error?: string;
};

export function ExtractAudio() {
  const batch = useAtomValue(batchModeAtom);
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [drag, setDrag] = useState(false);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const files = Array.from(list).filter(
      (f) => f.type.startsWith("video/") || /\.(mp4|webm|mov|mkv)$/i.test(f.name),
    );
    const selected = batch ? files.slice(0, 5) : files.slice(0, 1);
    setItems(
      selected.map((file) => ({
        id: `${file.name}-${file.size}-${Math.random()}`,
        file,
        status: "idle",
        progress: 0,
      })),
    );
  };

  const extractOne = useCallback(async (item: Item) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, status: "working", progress: 0, error: undefined }
          : i,
      ),
    );
    try {
      const ffmpeg = await getFFmpeg((p) => {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, progress: Math.round(p * 100) } : i,
          ),
        );
      });
      const ext = item.file.name.split(".").pop()?.toLowerCase() || "mp4";
      const inputName = `in_${item.id}.${ext}`;
      const outputName = `out_${item.id}.mp3`;
      await ffmpeg.writeFile(inputName, await fetchFile(item.file));
      await ffmpeg.exec([
        "-i",
        inputName,
        "-vn",
        "-codec:a",
        "libmp3lame",
        "-q:a",
        "2",
        outputName,
      ]);
      const data = await ffmpeg.readFile(outputName);
      const bytes =
        data instanceof Uint8Array
          ? new Uint8Array(data)
          : new TextEncoder().encode(String(data));
      const blob = new Blob([bytes.buffer], { type: "audio/mpeg" });
      const outName = `${item.file.name.replace(/\.[^.]+$/, "")}.mp3`;
      downloadBlob(blob, outName);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "done", progress: 100 } : i,
        ),
      );
      track("audio_extracted");
    } catch (e) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: "error",
                error:
                  e instanceof Error ? e.message : "Extraction failed.",
              }
            : i,
        ),
      );
    }
  }, []);

  const run = async () => {
    for (const item of items) {
      if (item.status !== "done") await extractOne(item);
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
          {batch ? "Drop videos (up to 5)" : "Drop a video"}
        </p>
        <p className="mt-1 text-sm text-text-muted">Exports MP3 in your browser</p>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple={batch}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-border bg-muted px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-text">
                  {item.file.name}
                </span>
                <span className="shrink-0 text-xs text-text-muted">
                  {item.status === "working"
                    ? `${item.progress}%`
                    : item.status}
                </span>
              </div>
              {item.status === "working" && (
                <div className="progress-track mt-2">
                  <div
                    className="progress-fill"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
              {item.error && (
                <p className="mt-1 text-xs text-danger">{item.error}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="btn btn-primary"
        disabled={!items.length || items.some((i) => i.status === "working")}
        onClick={run}
      >
        {items.some((i) => i.status === "working") ? (
          <>
            <Loader2 className="animate-spin" size={18} aria-hidden />
            Extracting…
          </>
        ) : (
          <>
            <Download size={18} aria-hidden />
            Extract audio
          </>
        )}
      </button>
    </div>
  );
}
