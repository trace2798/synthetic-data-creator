"use server";

import { db } from "@/db";
import { role, user, workspace, workspaceMembers } from "@/db/schema";
import { and, eq } from "drizzle-orm";

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

export async function addMemberToWorkspace(
  currentUserId: string,
  userEmail: string,
  workspaceId: string,
  roleName: string
) {
  const inviterMembership = await db
    .select({
      roleName: role.name,
    })
    .from(workspaceMembers)
    .innerJoin(role, eq(workspaceMembers.roleId, role.id))
    .where(
      and(
        eq(workspaceMembers.userId, currentUserId),
        eq(workspaceMembers.workspaceId, workspaceId)
      )
    );

  if (inviterMembership.length === 0) {
    return {
      status: 403,
      message: "You are not a member of this workspace",
    };
  }

  const inviterRoleName = inviterMembership[0].roleName;

  if (inviterRoleName !== "admin") {
    return {
      status: 403,
      message: "Only admins can add members",
    };
  }

  const [targetUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, userEmail));

  if (!targetUser) {
    return {
      status: 404,
      message: `No user found with email: ${userEmail}`,
    };
  }

  const targetUserId = targetUser.id;

  const [foundRole] = await db
    .select()
    .from(role)
    .where(eq(role.name, roleName));

  if (!foundRole) {
    return {
      status: 400,
      message: `Role '${roleName}' not found`,
    };
  }

  const targetRoleId = foundRole.id;

  const existingMembership = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.userId, targetUserId),
        eq(workspaceMembers.workspaceId, workspaceId)
      )
    );

  if (existingMembership.length > 0) {
    return {
      status: 400,
      message: "This user is already a member of the workspace",
    };
  }

  await db.insert(workspaceMembers).values({
    userId: targetUserId,
    workspaceId,
    roleId: targetRoleId,
    invited: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    status: 200,
    message: "Member added successfully",
  };
}
