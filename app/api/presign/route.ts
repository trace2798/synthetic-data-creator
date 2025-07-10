import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// const baseUrl = process.env.LAMBDA_BASE_URL!;
const baseUrl = "http://localhost:3001";

export async function POST(request: Request) {
  console.log("INSIDE PRESIGN PROXY NEXTJS");
  try {
    const { filename, contentType, userId, workspaceId } = await request.json();
    if (!filename || !contentType || !userId || !workspaceId) {
      return NextResponse.json(
        { error: "Missing filename or contentType" },
        { status: 400 }
      );
    }
    // const apiKey = process.env.APIGATEWAY_API_KEY!;
    // if (!apiKey) {
    //   return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    // }
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 400 });
    }
    const upstreamRes = await fetch(`${baseUrl}/presign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "x-api-key": apiKey
      },
      body: JSON.stringify({ filename, contentType, userId, workspaceId }),
    });
    console.log("GOT PRESIGN INSIDE NEXTJS API");
    const data = await upstreamRes.json();
    console.log("GOT PRESIGN INSIDE NEXTJS API Data", data);
    if (!upstreamRes.ok) {
      console.log("UPSTREAM ERROR", upstreamRes);
      return NextResponse.json(data, { status: upstreamRes.status });
    }
    // const { key, url } = data;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in /api/presign", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
