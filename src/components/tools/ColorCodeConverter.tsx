"use client";

import { Check, Copy, Dices, Link2, Pipette } from "lucide-react";
import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics";
import {
  contrastText,
  formatHsl,
  formatHsv,
  formatRgb,
  formatsFromRgb,
  hexToRgb,
  hslToRgb,
  hsvToRgb,
  parseColorInput,
  randomRgb,
  type ColorFormats,
  type Rgb,
} from "@/lib/color";

const DEFAULT_HEX = "#0071E3";

type FormatKey = "hex" | "rgb" | "hsl" | "hsv";

function fromHexParam(value: string | null): ColorFormats {
  const rgb = value ? hexToRgb(value.startsWith("#") ? value : `#${value}`) : null;
  return formatsFromRgb(rgb ?? hexToRgb(DEFAULT_HEX)!);
}

export function ColorCodeConverter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [color, setColor] = useState<ColorFormats>(() =>
    fromHexParam(searchParams.get("hex")),
  );
  const [hexInput, setHexInput] = useState(color.hex);
  const [rgbInput, setRgbInput] = useState(formatRgb(color.rgb));
  const [hslInput, setHslInput] = useState(formatHsl(color.hsl));
  const [hsvInput, setHsvInput] = useState(formatHsv(color.hsv));
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<FormatKey | null>(null);

  const applyRgb = useCallback((rgb: Rgb, clearError = true) => {
    const next = formatsFromRgb(rgb);
    setColor(next);
    setHexInput(next.hex);
    setRgbInput(formatRgb(next.rgb));
    setHslInput(formatHsl(next.hsl));
    setHsvInput(formatHsv(next.hsv));
    if (clearError) setError(null);
  }, []);

  const syncShareLink = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("hex", color.hex.replace("#", ""));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const copyValue = async (key: FormatKey, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      track("color_copied", { format: key });
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setError("Couldn’t copy to clipboard.");
    }
  };

  const onPickerChange = (value: string) => {
    const rgb = hexToRgb(value);
    if (rgb) {
      applyRgb(rgb);
      track("color_picked");
    }
  };

  const onHexChange = (value: string) => {
    setHexInput(value);
    const cleaned = value.trim().replace(/^#/, "");
    // Apply live only for full 6/8-digit hex so short codes don’t expand mid-type
    if (/^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(cleaned)) {
      const rgb = hexToRgb(`#${cleaned}`);
      if (rgb) applyRgb(rgb);
    }
  };

  const onRgbChange = (value: string) => {
    setRgbInput(value);
    const parts = value
      .replace(/^rgba?\(/i, "")
      .replace(/\)$/, "")
      .split(/[,\s/]+/)
      .filter(Boolean)
      .map(Number);
    if (
      parts.length >= 3 &&
      parts.slice(0, 3).every((n) => Number.isFinite(n) && n >= 0 && n <= 255)
    ) {
      applyRgb({
        r: Math.round(parts[0]),
        g: Math.round(parts[1]),
        b: Math.round(parts[2]),
      });
      return;
    }
    const rgb = parseColorInput(value);
    if (rgb) applyRgb(rgb);
  };

  const onHslChange = (value: string) => {
    setHslInput(value);
    const parts = value
      .replace(/^hsla?\(/i, "")
      .replace(/\)$/, "")
      .replace(/%/g, "")
      .split(/[,\s/]+/)
      .filter(Boolean)
      .map(Number);
    if (parts.length >= 3 && parts.every((n) => Number.isFinite(n))) {
      applyRgb(hslToRgb({ h: parts[0], s: parts[1], l: parts[2] }));
      return;
    }
    const rgb = parseColorInput(value);
    if (rgb) applyRgb(rgb);
  };

  const onHsvChange = (value: string) => {
    setHsvInput(value);
    const parts = value
      .replace(/^hsva?\(/i, "")
      .replace(/\)$/, "")
      .replace(/%/g, "")
      .split(/[,\s/]+/)
      .filter(Boolean)
      .map(Number);
    if (parts.length >= 3 && parts.every((n) => Number.isFinite(n))) {
      applyRgb(hsvToRgb({ h: parts[0], s: parts[1], v: parts[2] }));
      return;
    }
    const rgb = parseColorInput(value);
    if (rgb) applyRgb(rgb);
  };

  const randomize = () => {
    applyRgb(randomRgb());
    track("color_randomized");
  };

  const textOnSwatch = contrastText(color.rgb);
  const rows: { key: FormatKey; label: string; value: string; onChange: (v: string) => void }[] =
    [
      { key: "hex", label: "HEX", value: hexInput, onChange: onHexChange },
      { key: "rgb", label: "RGB", value: rgbInput, onChange: onRgbChange },
      { key: "hsl", label: "HSL", value: hslInput, onChange: onHslChange },
      { key: "hsv", label: "HSV", value: hsvInput, onChange: onHsvChange },
    ];

  return (
    <div className="space-y-5">
      <div
        className="relative overflow-hidden rounded-xl border border-border"
        style={{ backgroundColor: color.hex }}
        aria-label={`Color preview ${color.hex}`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, transparent 40%, #fff 40%, #fff 50%, transparent 50%), linear-gradient(45deg, transparent 40%, #000 40%, #000 50%, transparent 50%)",
            backgroundSize: "18px 18px",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col items-center gap-4 px-4 py-8 sm:px-6 sm:py-10">
          <p
            className="font-mono text-2xl font-medium tracking-tight sm:text-3xl"
            style={{ color: textOnSwatch }}
          >
            {color.hex}
          </p>
          <p className="text-sm" style={{ color: textOnSwatch, opacity: 0.8 }}>
            {formatRgb(color.rgb)}
          </p>

          <label
            className="relative inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm transition hover:opacity-90"
            style={{
              color: textOnSwatch,
              borderColor: `${textOnSwatch}33`,
              backgroundColor: `${textOnSwatch}14`,
            }}
          >
            <Pipette size={16} aria-hidden />
            Pick color
            <input
              type="color"
              value={color.hex}
              onChange={(e) => onPickerChange(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Open color picker"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-secondary" onClick={randomize}>
          <Dices size={16} aria-hidden />
          Random
        </button>
        <button type="button" className="btn btn-secondary" onClick={syncShareLink}>
          <Link2 size={16} aria-hidden />
          Update share link
        </button>
      </div>

      {error && (
        <p className="alert-error" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.key}>
            <label
              htmlFor={`color-${row.key}`}
              className="mb-1.5 block text-sm font-medium text-text"
            >
              {row.label}
            </label>
            <div className="flex gap-2">
              <input
                id={`color-${row.key}`}
                className="field font-mono text-sm"
                value={row.value}
                onChange={(e) => row.onChange(e.target.value)}
                onBlur={() => {
                  if (row.key === "hex") {
                    const rgb = parseColorInput(hexInput);
                    if (rgb) {
                      applyRgb(rgb);
                      return;
                    }
                  }
                  setHexInput(color.hex);
                  setRgbInput(formatRgb(color.rgb));
                  setHslInput(formatHsl(color.hsl));
                  setHsvInput(formatHsv(color.hsv));
                  setError(null);
                }}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
              />
              <button
                type="button"
                className="btn btn-secondary shrink-0 px-3"
                onClick={() =>
                  copyValue(
                    row.key,
                    row.key === "hex"
                      ? color.hex
                      : row.key === "rgb"
                        ? formatRgb(color.rgb)
                        : row.key === "hsl"
                          ? formatHsl(color.hsl)
                          : formatHsv(color.hsv),
                  )
                }
                aria-label={
                  copied === row.key ? `${row.label} copied` : `Copy ${row.label}`
                }
              >
                {copied === row.key ? (
                  <Check size={16} aria-hidden />
                ) : (
                  <Copy size={16} aria-hidden />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-muted">
        Shareable: add <code className="text-text">?hex=0071E3</code> to this page URL.
      </p>
    </div>
  );
}
