import type { Route } from "./+types/home";
import { authClient } from "~/utils/auth-client";
 import SignUp from "../signUp/signUp"
import SignIn from "../signIn/signIn"
import Chat from "../chat/chat"

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const session = authClient.useSession()
  if (session?.data?.user?.id) {
    return (
      <Chat data={session.data} />
    )
  } else {
    return <>
      <SignIn />
      <SignUp />
    </>
  }
}