"use server";

import { db } from "@/db";
import { role } from "@/db/schema";

export async function createRole(name: string) {
  await db.insert(role).values({
    name: name,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { status: 200 };
}
