import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { redirect } from "react-router";
import * as schema from "../db/schema";
import { db } from "./index.server";

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

export const getSession = async (request: Request) => {
  try {
    const data = await auth.api.getSession({ headers: request.headers })
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      console.log(error.message, error.status)
    }
  }
}

export const signInEmail = async (request: Request, email: string, password: string) => {
  try {
    return await auth.api.signInEmail({
      body: {
        email: email,
        password: password
      },
      headers: request.headers,
      asResponse: true
    })
  } catch (error) {
    if (error instanceof APIError) {
      console.log(error.message, error.status)
    }
    throw error
  }
}

export const signUpEmail = async (request: Request, email: string, password: string, name: string) => {
  try {
    return await auth.api.signUpEmail({
      returnHeaders: true,
      body: {
        email: email,
        password: password,
        name: name,
      },
      headers: request.headers,
      asResponse: true
    });
  } catch (error) {
    if (error instanceof APIError) {
      console.log(error.message, error.status)
    }
    throw error
  }
}

export const signInGoogle = async (request: Request) => {
  try {
    return await auth.api.signInSocial({
      body: { provider: "google", callbackURL: "/" },
      headers: request.headers,
      asResponse: true
    })
  } catch (error) {
    if (error instanceof APIError) {
      console.log(error.message, error.status)
    }
    throw error
  }
};

export const signOut = async (request: Request) => {
  try {
    return await auth.api.signOut({ headers: request.headers, asResponse: true })
  } catch (error) {
    if (error instanceof APIError) {
      console.log(error.message, error.status)
    }
    throw error
  }
}