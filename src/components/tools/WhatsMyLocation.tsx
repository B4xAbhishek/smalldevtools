"use client";

import { Check, Copy, MapPin, Navigation, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { track } from "@/lib/analytics";

type Coords = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
};

function formatCoord(value: number, digits = 6) {
  return value.toFixed(digits);
}

function geoErrorMessage(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission denied. Allow access in your browser settings, then try again.";
    case error.POSITION_UNAVAILABLE:
      return "Location is unavailable right now. Check device GPS or network, then retry.";
    case error.TIMEOUT:
      return "Location request timed out. Try again.";
    default:
      return "Couldn’t get your location. Try again in a moment.";
  }
}

export function WhatsMyLocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"coords" | "lat" | "lng" | null>(null);

  const fetchLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLoading(false);
      setCoords(null);
      setError("Geolocation isn’t supported in this browser.");
      return;
    }

    setLoading(true);
    setError(null);
    setCopied(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next: Coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
        };
        setCoords(next);
        setLoading(false);
        track("location_looked_up", {
          accuracy: Math.round(next.accuracy),
          has_altitude: next.altitude != null,
        });
      },
      (err) => {
        setCoords(null);
        setLoading(false);
        setError(geoErrorMessage(err));
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const copyText = async (text: string, kind: "coords" | "lat" | "lng") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      track("location_copied", { kind });
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setError("Couldn’t copy to clipboard.");
    }
  };

  const latStr = coords ? formatCoord(coords.latitude) : "";
  const lngStr = coords ? formatCoord(coords.longitude) : "";
  const pairStr = coords ? `${latStr}, ${lngStr}` : "";
  const mapsUrl = coords
    ? `https://www.openstreetmap.org/?mlat=${latStr}&mlon=${lngStr}#map=16/${latStr}/${lngStr}`
    : null;

  return (
    <div className="space-y-5">
      <div
        className="rounded-xl border border-border bg-muted px-4 py-6 text-center sm:px-6 sm:py-8"
        aria-live="polite"
        aria-busy={loading}
      >
        <div className="mb-3 flex justify-center text-primary" aria-hidden>
          <MapPin size={28} strokeWidth={2} />
        </div>

        <p className="text-sm font-medium uppercase tracking-wide text-text-muted">
          Exact coordinates
        </p>

        {loading ? (
          <p className="mt-3 text-2xl font-medium text-text-muted sm:text-3xl">
            Locating…
          </p>
        ) : coords ? (
          <>
            <p
              id="location-coords-value"
              className="mt-3 break-all font-mono text-2xl font-medium tracking-tight text-text sm:text-3xl"
            >
              {pairStr}
            </p>
            <dl className="mt-4 grid gap-2 text-left text-sm sm:mx-auto sm:max-w-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-text-muted">Latitude</dt>
                <dd className="font-mono text-text">{latStr}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-text-muted">Longitude</dt>
                <dd className="font-mono text-text">{lngStr}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-text-muted">Accuracy</dt>
                <dd className="font-mono text-text">
                  ±{Math.round(coords.accuracy)} m
                </dd>
              </div>
              {coords.altitude != null && (
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-text-muted">Altitude</dt>
                  <dd className="font-mono text-text">
                    {Math.round(coords.altitude)} m
                  </dd>
                </div>
              )}
            </dl>
          </>
        ) : (
          <p className="mt-3 text-lg font-medium text-text">Unavailable</p>
        )}
      </div>

      {error && (
        <p className="alert-error" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void copyText(pairStr, "coords")}
          disabled={!coords || loading}
          aria-label={copied === "coords" ? "Coordinates copied" : "Copy coordinates"}
          aria-describedby={coords ? "location-coords-value" : undefined}
        >
          {copied === "coords" ? (
            <Check size={16} aria-hidden />
          ) : (
            <Copy size={16} aria-hidden />
          )}
          {copied === "coords" ? "Copied" : "Copy coords"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => void copyText(latStr, "lat")}
          disabled={!coords || loading}
          aria-label={copied === "lat" ? "Latitude copied" : "Copy latitude"}
        >
          {copied === "lat" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
          Lat
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => void copyText(lngStr, "lng")}
          disabled={!coords || loading}
          aria-label={copied === "lng" ? "Longitude copied" : "Copy longitude"}
        >
          {copied === "lng" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
          Lng
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={fetchLocation}
          disabled={loading}
          aria-label="Refresh location"
        >
          <RefreshCw size={16} aria-hidden className={loading ? "animate-spin" : undefined} />
          Refresh
        </button>
        {mapsUrl && (
          <a
            className="btn btn-secondary"
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open location in OpenStreetMap"
          >
            <Navigation size={16} aria-hidden />
            Open map
          </a>
        )}
      </div>

      <p className="text-sm text-text-muted">
        Uses your device GPS / Wi‑Fi location. Nothing is sent to our servers —
        permission stays in your browser.
      </p>
    </div>
  );
}
