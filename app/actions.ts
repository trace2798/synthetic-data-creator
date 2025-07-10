"use server";

import { db } from "@/db";
import { role, workspace, workspaceMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createRole(name: string) {
  await db.insert(role).values({
    name: name,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { status: 200 };
}

export async function createWorkspace(
  userId: string,
  title: string,
  description?: string
) {
  const [newWorkspace] = await db
    .insert(workspace)
    .values({
      title,
      description,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  if (!newWorkspace) {
    throw new Error("Failed to create workspace");
  }
  const [adminRole] = await db
    .select()
    .from(role)
    .where(eq(role.name, "admin"));

  if (!adminRole) {
    throw new Error("Admin role not found in roles table. Seed roles first!");
  }

  await db.insert(workspaceMembers).values({
    userId,
    workspaceId: newWorkspace.id,
    roleId: adminRole.id,
    invited: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { workspaceId: newWorkspace.id, status: 200 };
}
