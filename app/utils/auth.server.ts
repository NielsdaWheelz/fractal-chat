import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../index";
import * as schema from "../db/schema";
import { redirect } from "react-router";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  },
  trustedOrigins: ["http://localhost:5173"],
});

export async function getUser(request: Request): Promise<string | undefined> {
  return (await auth.api.getSession({ headers: request.headers }))?.user.id
}

export async function requireUser(request: Request): Promise<string> {
  const user = await getUser(request)
  if (!user) {
      throw redirect("/")
  } else {
      return user
  }
}