// import { Link, useLoaderData } from "react-router"
// import { Form, redirect } from "react-router";
import type { Route } from "./+types/home";
// import { getSession, signInEmail, signUpEmail, signOut, signInGoogle } from "./api.auth"
import { authClient } from "~/utils/auth-client";
import SignUp from "../users/signUp"
import SignIn from "../users/signIn"
import { clientSignOut } from "~/utils/auth-client"
import Chat from "../chat/chat"
import { Button } from "~/components/ui/button";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Fractal Chat" },
    { name: "description", content: "Welcome to Fractal Chat!" },
  ];
}

// export const loader = async({ request }: Route.LoaderArgs) => {
//   const session = await getSession(request)
//   if(!session?.user) {
//     return { user: null}
//   } else {
//     return { user: session.user}
//   }
// }

const handleClick = () => {
  clientSignOut()
}

export default function Home() {
  const session = authClient.useSession()
  if (session?.data?.user?.id) {
    return (
      <>
        Hello, {session.data.user.name}!
        <Button onClick={handleClick}>Sign Out</Button>
      </>
    )
  } else {
    return (
      <>
        <SignIn />
        <SignUp />
      </>
    )
  }
}