import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const baseUrl = process.env.LAMBDA_BASE_URL!;
const apiKey  = process.env.APIGATEWAY_API_KEY!;

export async function POST(request: Request) {
  try {

    const body = await request.json();
    console.log("🔍 [generate-csv] incoming body:", body);

    const { dataFormId, workspaceId, domain, s3Key, instruction } = body;

    const missing = [
      !dataFormId && "dataFormId",
      !workspaceId && "workspaceId",
      !domain && "domain",
      !s3Key && "s3Key",
     instruction === undefined && "instruction",
    ].filter(Boolean);
    if (missing.length) {
      console.log("❌ [generate-csv] missing fields:", missing);
      return NextResponse.json(
        { error: `Missing fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }
    if (!apiKey) {
      console.error("❌ [generate-csv] API key not set");
      return NextResponse.json(
        { error: "API Gateway key not set in env" },
        { status: 500 }
      );
    }
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      console.log("🔒 [generate-csv] unauthorized");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const upstreamPayload = { dataFormId, workspaceId, domain, s3Key, instruction };
    console.log("➡️ [generate-csv] proxying to Lambda:", upstreamPayload);

    const upstreamRes = await fetch(`${baseUrl}/generate-csv`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(upstreamPayload),
    });

    const data = await upstreamRes.json();
    console.log(
      upstreamRes.ok
        ? "✅ [generate-csv] upstream response"
        : `⚠️ [generate-csv] upstream error (status ${upstreamRes.status})`,
      data
    );

    if (!upstreamRes.ok) {
      return NextResponse.json(data, { status: upstreamRes.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("🔥 [generate-csv] unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
