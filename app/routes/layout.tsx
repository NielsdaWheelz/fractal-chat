import type { Route } from "./+types/layout";
import { Form, NavLink, Outlet, redirect, useNavigate } from "react-router";
import { getSession } from "./api.auth";
import { getUser } from "~/utils/auth";
import { getChats } from "..";
import { Button } from "~/components/ui/button";
import { clientSignOut } from "~/utils/auth-client";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request)
  if (!session?.user) return redirect("/")

  const userId = await getUser(request)
  const chats = userId ? (await getChats(userId)) : []
  return chats
}

const Layout = ({ loaderData }: Route.ComponentProps) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    await clientSignOut()
    navigate("/");
  }

  return (
    <div className="flex flex-row w-full h-full">
      <div className="max-w-[20%] flex flex-col gap-4 p-4 bg-gray-200">
        <Button className="text-xs" onClick={handleClick}>Sign Out</Button>
        <Form method="post" action="chat-create">
          <Button className="text-xs" type="submit">Create Chat</Button>
        </Form>
        {
          loaderData.map((chat) =>
            <NavLink key={chat.id} to={"/workspace/chat/" + chat.id}>
              <Button className="text-xs w-full">Chat - {chat.id.substring(0, 8)}</Button>
            </NavLink>)
        }
      </div>
      <Outlet />
    </div>
  )
}
export default Layout