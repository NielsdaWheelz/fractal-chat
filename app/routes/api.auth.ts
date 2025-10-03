import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"

export async function loader({ request }: LoaderFunctionArgs) {
  const { auth } = await import('../utils/auth.server')
  return auth.handler(request)
}

export async function action({ request }: ActionFunctionArgs) {
  const { auth } = await import('../utils/auth.server')
  return auth.handler(request)
}