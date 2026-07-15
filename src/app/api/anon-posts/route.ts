import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  ANON_MAX_CHARS,
  ANON_MIN_CHARS,
  containsBlockedLanguage,
} from "@/lib/anon-filter";

export type AnonPost = {
  seq: number;
  text: string;
  createdAt: string;
};

const BADMOSI = {
  error: "Watch the language.",
  code: "PROFANITY" as const,
  image: "/badmosi.png",
};

async function nextSeq(): Promise<number> {
  const db = await getDb();
  const result = await db.collection<{ _id: string; value: number }>("counters").findOneAndUpdate(
    { _id: "anon_posts" },
    { $inc: { value: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return result?.value ?? 1;
}

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection("anon_posts")
      .find({})
      .sort({ seq: -1 })
      .limit(100)
      .toArray();

    const posts: AnonPost[] = docs.map((d) => ({
      seq: d.seq as number,
      text: d.text as string,
      createdAt:
        d.createdAt instanceof Date
          ? d.createdAt.toISOString()
          : String(d.createdAt),
    }));

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("anon_posts list failed", err);
    return NextResponse.json(
      { error: "Could not load posts. Try again later." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  let body: { text?: string };
  try {
    body = (await request.json()) as { text?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = body.text?.trim() ?? "";
  if (text.length < ANON_MIN_CHARS) {
    return NextResponse.json(
      { error: "Write something before posting." },
      { status: 400 },
    );
  }
  if (text.length > ANON_MAX_CHARS) {
    return NextResponse.json(
      { error: `Keep it under ${ANON_MAX_CHARS} characters.` },
      { status: 400 },
    );
  }

  if (containsBlockedLanguage(text)) {
    return NextResponse.json(BADMOSI, { status: 422 });
  }

  try {
    const db = await getDb();
    const seq = await nextSeq();
    const createdAt = new Date();
    await db.collection("anon_posts").insertOne({
      seq,
      text,
      createdAt,
    });

    const post: AnonPost = {
      seq,
      text,
      createdAt: createdAt.toISOString(),
    };

    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (err) {
    console.error("anon_posts insert failed", err);
    return NextResponse.json(
      { error: "Could not save post. Try again later." },
      { status: 503 },
    );
  }
}
