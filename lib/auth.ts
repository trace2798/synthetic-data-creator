import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as authSchema from "./../db/schema";
import { nextCookies } from "better-auth/next-js";
import { v4 as uuidv4 } from "uuid";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID!,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  //   },
  // },
  logger: {
    disabled: process.env.NODE_ENV === "production",
    level: "debug",
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
    disableSignUp: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: authSchema,
  }),
  advanced: {
    database: {
      // override Better Auth’s default ID with a true UUID
      generateId: () => uuidv4(),
    },
  },
  session: {
    cookieCache: {
      //https://better-auth.vercel.app/docs/guides/optimizing-for-performance
      enabled: true,
      maxAge: 100 * 60, // Cache duration in seconds
    },
  },
  plugins: [nextCookies()],
});
