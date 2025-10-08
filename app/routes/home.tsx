import type { Route } from "./+types/home";
import { getSession } from "~/server/auth.server"
import SignIn from "./sign-in"
import { useLoaderData, redirect } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Fractal Chat" },
    { name: "description", content: "Welcome to Fractal Chat!" },
  ];
}

export const loader = async({ request }: Route.LoaderArgs) => {
  const session = await getSession(request)
  if(!session?.user) {
    return { user: null}
  } else {
    return redirect("/workspace")
  }
}

export default function Home() {
  
  // const data = useLoaderData<typeof loader>();

  return (
    <>
      <SignIn />
    </>
  )
}