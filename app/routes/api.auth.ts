import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { auth } from "~/utils/auth.server"

/**
 * Handles GET requests for authentication.
 * Delegates to better-auth's handler for OAuth callbacks, session checks, etc.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  return auth.handler(request)
}

/**
 * Handles POST requests for authentication.
 * Delegates to better-auth's handler for sign-in, sign-up, sign-out, etc.
 */
export async function action({ request }: ActionFunctionArgs) {
  return auth.handler(request)
}