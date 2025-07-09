import { relations, sql } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    mode: "date",
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    mode: "date",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const verification = pgTable("verification", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const workspace = pgTable("workspace", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const userWorkspaceRelations = relations(user, ({ many }) => ({
  createdWorkspaces: many(workspace),
}));

export const role = pgTable("role", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const workspaceMembers = pgTable("workspace_member", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),

  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),

  roleId: uuid("role_id")
    .notNull()
    .references(() => role.id, { onDelete: "restrict" }),

  invited: boolean("invited").default(false).notNull(),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const userRelations = relations(user, ({ many }) => ({
  createdWorkspaces: many(workspace),
  memberships: many(workspaceMembers),
}));

export const workspaceRelations = relations(workspace, ({ many }) => ({
  members: many(workspaceMembers),
}));

export const roleRelations = relations(role, ({ many }) => ({
  memberships: many(workspaceMembers),
}));

export const workspaceMemberRelations = relations(
  workspaceMembers,
  ({ one }) => ({
    user: one(user, {
      fields: [workspaceMembers.userId],
      references: [user.id],
    }),
    workspace: one(workspace, {
      fields: [workspaceMembers.workspaceId],
      references: [workspace.id],
    }),
    role: one(role, {
      fields: [workspaceMembers.roleId],
      references: [role.id],
    }),
  })
);
