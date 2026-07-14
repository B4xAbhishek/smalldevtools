import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

type FeedbackBody = {
  message?: string;
  email?: string;
  rating?: number;
};

export async function POST(request: Request) {
  let body: FeedbackBody;
  try {
    body = (await request.json()) as FeedbackBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message || message.length < 3) {
    return NextResponse.json(
      { error: "Message is required (min 3 characters)." },
      { status: 400 },
    );
  }
  if (message.length > 4000) {
    return NextResponse.json(
      { error: "Message is too long (max 4000 characters)." },
      { status: 400 },
    );
  }

  const email = body.email?.trim() || undefined;
  if (email && (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  let rating: number | undefined;
  if (body.rating !== undefined && body.rating !== null) {
    const n = Number(body.rating);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer from 1 to 5." },
        { status: 400 },
      );
    }
    rating = n;
  }

  try {
    const db = await getDb();
    const doc = {
      message,
      email,
      rating,
      createdAt: new Date(),
    };
    const result = await db.collection("feedback").insertOne(doc);
    return NextResponse.json(
      { ok: true, id: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (err) {
    console.error("feedback insert failed", err);
    return NextResponse.json(
      { error: "Could not save feedback. Try again later." },
      { status: 503 },
    );
  }
}
