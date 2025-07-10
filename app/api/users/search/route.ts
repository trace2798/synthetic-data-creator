import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const emailQuery = req.nextUrl.searchParams.get("email");
  if (!emailQuery) {
    return NextResponse.json([]);
  }

  const users = await db
    .select()
    .from(user)
    .where(ilike(user.email, `%${emailQuery}%`))
    .limit(5);

  return NextResponse.json(users);
}
