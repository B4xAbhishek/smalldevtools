import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function firstForwardedIp(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first || null;
}

function isPrivateIp(ip: string): boolean {
  const v = ip.trim().toLowerCase();
  if (v === "::1" || v === "127.0.0.1" || v === "0:0:0:0:0:0:0:1") return true;
  if (v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80:")) return true;
  if (v.startsWith("10.")) return true;
  if (v.startsWith("192.168.")) return true;
  if (v.startsWith("169.254.")) return true;
  const m = /^172\.(\d+)\./.exec(v);
  if (m) {
    const second = Number(m[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

function clientIp(request: NextRequest): string {
  const headers = request.headers;
  const candidates = [
    headers.get("cf-connecting-ip"),
    headers.get("x-real-ip"),
    firstForwardedIp(headers.get("x-forwarded-for")),
    headers.get("x-vercel-forwarded-for")
      ? firstForwardedIp(headers.get("x-vercel-forwarded-for"))
      : null,
  ];

  for (const ip of candidates) {
    if (ip) return ip;
  }

  return "unknown";
}

export async function GET(request: NextRequest) {
  const ip = clientIp(request);
  return NextResponse.json({
    ip,
    local: ip !== "unknown" && isPrivateIp(ip),
  });
}
