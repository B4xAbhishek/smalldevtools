import { NextResponse } from "next/server";

type Body = { url?: string };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const raw = body.url?.trim();
  if (!raw) {
    return NextResponse.json({ error: "URL is required." }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    return NextResponse.json(
      { error: "Only http/https URLs are allowed." },
      { status: 400 },
    );
  }

  // Microlink free screenshot endpoint (public pages)
  const api = new URL("https://api.microlink.io");
  api.searchParams.set("url", target.toString());
  api.searchParams.set("screenshot", "true");
  api.searchParams.set("meta", "false");
  api.searchParams.set("embed", "screenshot.url");

  try {
    const res = await fetch(api.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Capture provider returned ${res.status}.` },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      status?: string;
      data?: { screenshot?: { url?: string } };
      message?: string;
    };

    const imageUrl = data.data?.screenshot?.url;
    if (!imageUrl) {
      return NextResponse.json(
        {
          error:
            data.message ||
            "No screenshot returned. The page may block captures.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, imageUrl });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the screenshot provider." },
      { status: 502 },
    );
  }
}
