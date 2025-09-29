import { redirect } from 'react-router'
import { auth } from '../utils/auth'
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await auth.api.getSession(request)
  if (!session) return redirect("/")
  return auth.handler(request)
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await auth.api.getSession(request)
  if (!session) return
  return auth.handler(request)
}