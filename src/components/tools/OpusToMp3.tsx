"use client";

import { fetchFile } from "@ffmpeg/util";
import { Download, Loader2, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { downloadBlob, getFFmpeg } from "@/lib/ffmpeg";
import { batchModeAtom } from "@/state/atoms";
import { track } from "@/lib/analytics";

function isOpus(f: File) {
  return (
    f.name.toLowerCase().endsWith(".opus") ||
    f.type === "audio/opus" ||
    f.type === "audio/ogg"
  );
}

export function OpusToMp3() {
  const batch = useAtomValue(batchModeAtom);
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Waiting for a file");
  const [drag, setDrag] = useState(false);

  const onFiles = (list: FileList | null) => {
    setError(null);
    if (!list) return;
    const picked = Array.from(list).filter(isOpus);
    if (!picked.length) {
      setError("Please choose .opus (or OGG Opus) files.");
      return;
    }
    setFiles(batch ? picked.slice(0, 10) : picked.slice(0, 1));
    setStatus(`Ready: ${picked.length} file(s)`);
  };

  const convert = useCallback(async () => {
    if (!files.length) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    setStatus("Loading converter…");

    try {
      const ffmpeg = await getFFmpeg((p) => setProgress(Math.round(p * 100)));
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setStatus(`Converting ${i + 1}/${files.length}: ${file.name}`);
        const inputName = `input_${i}.opus`;
        const outputName = `output_${i}.mp3`;
        await ffmpeg.writeFile(inputName, await fetchFile(file));
        await ffmpeg.exec([
          "-i",
          inputName,
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
        const outName =
          file.name.replace(/\.opus$/i, "").replace(/\.ogg$/i, "") + ".mp3";
        downloadBlob(blob, outName);
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
      }
      setStatus(`Done — downloaded ${files.length} MP3(s)`);
      track("opus_converted", { count: files.length });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Conversion failed. Try another file or refresh the page.",
      );
      setStatus("Something went wrong");
    } finally {
      setBusy(false);
    }
  }, [files]);

  return (
    <div className="space-y-5">
      <div
        role="button"
        tabIndex={0}
        className={`dropzone flex cursor-pointer flex-col items-center justify-center px-5 py-12 text-center outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${drag ? "active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onFiles(e.dataTransfer.files);
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
        <p className="text-lg font-medium text-text">
          {batch ? "Drop .opus files" : "Drop your .opus file here"}
        </p>
        <p className="mt-2 text-base text-text-muted">
          or tap to choose · conversion runs in your browser
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".opus,audio/opus,audio/ogg"
          multiple={batch}
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-1 text-sm text-text-muted">
          {files.map((f) => (
            <li key={f.name + f.size}>
              <span className="font-medium text-text">{f.name}</span>{" "}
              ({(f.size / 1024).toFixed(1)} KB)
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!files.length || busy}
          onClick={convert}
        >
          {busy ? (
            <>
              <Loader2 className="animate-spin" size={20} aria-hidden />
              Converting…
            </>
          ) : (
            <>
              <Download size={20} aria-hidden />
              Convert to MP3
            </>
          )}
        </button>
        <p className="text-sm text-text-muted sm:text-base" aria-live="polite">
          {status}
        </p>
      </div>

      {busy && (
        <div>
          <div className="mb-2 flex justify-between text-sm font-medium text-text-muted">
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
