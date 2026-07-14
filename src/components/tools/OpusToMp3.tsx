"use client";

import { fetchFile } from "@ffmpeg/util";
import { Download, Loader2, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { downloadBlob, getFFmpeg } from "@/lib/ffmpeg";

export function OpusToMp3() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Waiting for a file");
  const [drag, setDrag] = useState(false);

  const onFile = (f: File | null) => {
    setError(null);
    if (!f) return;
    const ok =
      f.name.toLowerCase().endsWith(".opus") ||
      f.type === "audio/opus" ||
      f.type === "audio/ogg";
    if (!ok) {
      setError("Please choose an .opus file (or an OGG Opus file).");
      return;
    }
    setFile(f);
    setStatus(`Ready: ${f.name}`);
  };

  const convert = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    setStatus("Loading converter… first time can take a moment");

    try {
      const ffmpeg = await getFFmpeg((p) => setProgress(Math.round(p * 100)));
      setStatus("Converting to MP3…");
      const inputName = "input.opus";
      const outputName = "output.mp3";
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
      setStatus(`Done — downloaded ${outName}`);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
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
  }, [file]);

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
        <p className="text-lg font-bold text-text">Drop your .opus file here</p>
        <p className="mt-2 text-base text-text-muted">
          or tap to choose a file from your device
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".opus,audio/opus,audio/ogg"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {file && (
        <p className="text-base text-text-muted">
          Selected:{" "}
          <span className="font-bold text-text">{file.name}</span>{" "}
          <span>({(file.size / 1024).toFixed(1)} KB)</span>
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!file || busy}
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
          <div className="mb-2 flex justify-between text-sm font-bold text-text-muted">
            <span>Progress</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && (
        <p className="alert-error" role="alert">
          {error}
        </p>
      )}

      <p className="alert-info">
        Tip: conversion happens on your device. Large files may take longer the
        first time while the converter loads.
      </p>
    </div>
  );
}
