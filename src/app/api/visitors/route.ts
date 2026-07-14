import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const COOKIE = "tk_visit_session";
const STATS_ID = "visitors";

type VisitorStat = { _id: string; count: number };

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const stats = db.collection<VisitorStat>("stats");
    const already = Boolean(request.cookies.get(COOKIE)?.value);

    let count: number;
    let incremented = false;

    if (already) {
      const doc = await stats.findOne({ _id: STATS_ID });
      count = doc?.count ?? 0;
    } else {
      const updated = await stats.findOneAndUpdate(
        { _id: STATS_ID },
        { $inc: { count: 1 } },
        { upsert: true, returnDocument: "after" },
      );
      count = updated?.count ?? 1;
      incremented = true;
    }

    const res = NextResponse.json({ count, incremented });
    if (!already) {
      res.cookies.set(COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }
    return res;
  } catch (err) {
    console.error("visitors counter failed", err);
    return NextResponse.json(
      { error: "Visitor counter unavailable.", count: null },
      { status: 503 },
    );
  }
}
