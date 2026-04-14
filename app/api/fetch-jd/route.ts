import { NextResponse } from "next/server";
import { fetchJdFromUrl } from "@/lib/jd-extract";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { url } = (await req.json()) as { url: string };
    if (!url || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "Provide a valid http(s) URL" }, { status: 400 });
    }
    const text = await fetchJdFromUrl(url);
    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
