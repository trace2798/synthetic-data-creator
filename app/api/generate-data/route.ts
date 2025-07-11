// app/api/generate-data/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const baseUrl = process.env.LAMBDA_BASE_URL!;
const apiKey  = process.env.APIGATEWAY_API_KEY!;

export async function POST(request: Request) {
  try {
    // 1) parse & log the raw body
    const body = await request.json();
    console.log("🔍 [generate-data] incoming body:", body);

    const {
      dataFormId,
      userId,
      workspaceId,
      domain,
      resultStyle,
      youtubeUrl,
      s3Key,
      instruction,
    } = body;

    // 2) validate required fields (allow empty string for instruction)
    const missing = [
      !dataFormId       && "dataFormId",
      !userId           && "userId",
      !workspaceId      && "workspaceId",
      !domain           && "domain",
      !resultStyle      && "resultStyle",
      instruction === undefined && "instruction",
    ].filter(Boolean);

    if (missing.length) {
      console.log("❌ [generate-data] missing fields:", missing);
      return NextResponse.json(
        { error: `Missing fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    // 3) require at least one of s3Key or youtubeUrl
    if (!s3Key && !youtubeUrl) {
      console.log("❌ [generate-data] missing one of s3Key or youtubeUrl");
      return NextResponse.json(
        { error: "Either s3Key or youtubeUrl must be provided" },
        { status: 400 }
      );
    }

    // 4) ensure API key exists
    if (!apiKey) {
      console.error("❌ [generate-data] API key not set in env");
      return NextResponse.json(
        { error: "API Gateway key not set in env" },
        { status: 500 }
      );
    }

    // 5) auth check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      console.log("🔒 [generate-data] unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 6) log what we're proxying upstream
    const upstreamPayload = {
      dataFormId,
      userId,
      workspaceId,
      domain,
      resultStyle,
      youtubeUrl,
      s3Key,
      instruction,
    };
    console.log("➡️ [generate-data] proxying payload:", upstreamPayload);

    // 7) proxy to Lambda
    const upstream = await fetch(`${baseUrl}/generate-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(upstreamPayload),
    });

    const data = await upstream.json();
    console.log(
      upstream.ok
        ? "✅ [generate-data] upstream response"
        : `⚠️ [generate-data] upstream error (status ${upstream.status})`,
      data
    );

    return NextResponse.json(data, { status: upstream.status });
  } catch (err: any) {
    console.error("🔥 [generate-data] unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
