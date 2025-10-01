import type { Route } from "./+types/home";
import { getSession } from "./api.auth"
import SignUp from "../users/signUp"
import SignIn from "../users/signIn"
import { clientSignOut } from "~/utils/auth-client"
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
    // If logged in, send them to the workspace as the main page
    return redirect("/workspace")
  }
}

const handleClick = () => {
  clientSignOut()
}

export default function Home() {
  
  let data = useLoaderData<typeof loader>();
  return (
    <>
      <SignIn />
      <SignUp />
    </>
  )
}