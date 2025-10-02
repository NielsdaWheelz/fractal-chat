import { APIError } from "better-auth/api"
import { auth } from '../utils/auth'
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"

export async function loader({ request }: LoaderFunctionArgs) {
  return auth.handler(request)
}

export async function action({ request }: ActionFunctionArgs) {
  return auth.handler(request)
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
// const cookies = headers.get("set-cookie");
// const headers = headers.get("x-custom-header");

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