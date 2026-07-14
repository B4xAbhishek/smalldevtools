"use client";

import { fetchFile } from "@ffmpeg/util";
import { Download, Loader2, Scissors, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { downloadBlob, getFFmpeg } from "@/lib/ffmpeg";

export function VideoCutter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState("0");
  const [end, setEnd] = useState("10");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Waiting for a video");
  const [drag, setDrag] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onFile = (f: File | null) => {
    setError(null);
    if (!f) return;
    if (!f.type.startsWith("video/") && !/\.(mp4|webm|mov|mkv)$/i.test(f.name)) {
      setError("Please choose a video file (MP4, WebM, or MOV works best).");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
    setFile(f);
    setStatus(`Ready: ${f.name}`);
  };

  const cut = useCallback(async () => {
    if (!file) return;
    const startSec = Number(start);
    const endSec = Number(end);
    if (Number.isNaN(startSec) || Number.isNaN(endSec)) {
      setError("Start and end must be numbers in seconds.");
      return;
    }
    if (startSec < 0 || endSec <= startSec) {
      setError("End time must be greater than start time, and start must be 0 or more.");
      return;
    }

    setBusy(true);
    setError(null);
    setProgress(0);
    setStatus("Loading cutter… first time can take a moment");

    try {
      const ffmpeg = await getFFmpeg((p) => setProgress(Math.round(p * 100)));
      setStatus("Cutting your video…");
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const inputName = `input.${ext}`;
      const outputName = `clip.${ext === "mov" ? "mp4" : ext}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec([
        "-ss",
        String(startSec),
        "-to",
        String(endSec),
        "-i",
        inputName,
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-movflags",
        "+faststart",
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      const bytes =
        data instanceof Uint8Array
          ? new Uint8Array(data)
          : new TextEncoder().encode(String(data));
      const mime = outputName.endsWith("webm") ? "video/webm" : "video/mp4";
      const blob = new Blob([bytes.buffer], { type: mime });
      const outName = `${file.name.replace(/\.[^.]+$/, "")}_${startSec}s-${endSec}s.${outputName.split(".").pop()}`;
      downloadBlob(blob, outName);
      setStatus(`Done — downloaded ${outName}`);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Cut failed. Try a shorter clip or another format.",
      );
      setStatus("Something went wrong");
    } finally {
      setBusy(false);
    }
  }, [file, start, end]);

  return (
    <div className="space-y-5">
      <div
        role="button"
        tabIndex={0}
        className={`dropzone flex cursor-pointer flex-col items-center justify-center px-5 py-12 text-center outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring ${drag ? "active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <Upload className="mb-3 text-primary" size={32} aria-hidden />
        <p className="text-lg font-bold text-text">Drop your video here</p>
        <p className="mt-2 text-base text-text-muted">
          or tap to choose a file · MP4 / WebM / MOV
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {previewUrl && (
        <video
          src={previewUrl}
          controls
          className="max-h-64 w-full rounded-xl border border-border bg-black"
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="start-sec" className="mb-2 block text-sm font-bold text-text">
            Start (seconds)
          </label>
          <input
            id="start-sec"
            className="field"
            type="number"
            min={0}
            step="0.1"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <p className="mt-1.5 text-sm text-text-muted">Example: 0 for the beginning</p>
        </div>
        <div>
          <label htmlFor="end-sec" className="mb-2 block text-sm font-bold text-text">
            End (seconds)
          </label>
          <input
            id="end-sec"
            className="field"
            type="number"
            min={0}
            step="0.1"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
          <p className="mt-1.5 text-sm text-text-muted">Example: 10 for ten seconds in</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!file || busy}
          onClick={cut}
        >
          {busy ? (
            <>
              <Loader2 className="animate-spin" size={20} aria-hidden />
              Cutting…
            </>
          ) : (
            <>
              <Scissors size={20} aria-hidden />
              Cut &amp; download
              <Download size={18} aria-hidden className="opacity-80" />
            </>
          )}
        </button>
        <p className="text-sm text-text-muted sm:text-base" aria-live="polite">
          {status}
        </p>
      </div>

      {busy && (
        <div>
          <div className="mb-2 flex justify-between text-sm font-bold text-text-muted">
            <span>Progress</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && (
        <p className="alert-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
