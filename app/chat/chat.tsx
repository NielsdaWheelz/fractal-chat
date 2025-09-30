// import { getSession } from "../routes/api.auth.$";
// import { redirect } from "react-router";
// import type { Route } from "./+types/chat";

// export async function loader({ request }: Route.LoaderArgs) {
//   const session = await getSession(request);
//   if (!session?.user) {
//     return redirect("/")
//   }
//   return null
// }

const Chat = (props: {session}) => {


  return (
    <>
      Hello, {props.session}!
      <button onClick={handleClick}>Sign Out</button>
    </>
  )
}

export default Chat