import type { Route } from "./+types/authed-layout";
import { Outlet, redirect } from "react-router";
import { getSession } from "./api.auth";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request)
  if (!session?.user) return redirect("/")
  return { user: session.user }
}

const Layout = () => {
  return <Outlet />
}

export default Layout