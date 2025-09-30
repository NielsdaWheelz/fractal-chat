// import { getSession } from "~/routes/api.auth";
// import { redirect } from "react-router";
// import type { Route } from "./+types/chats";

// provides `loaderData` to the component
// export async function loader({ request }: Route.LoaderArgs) {
//   const session = await getSession(request);
//   if (!session?.user) {
//     return redirect("/")
//   }


//   // let chats = await fetchChats(params.chats);
//   // return chats;
//   return null
// }

// export async function clientLoader({ serverLoader }) {
//   // call the server loader
//   const serverData = await serverLoader();
//   // And/or fetch data on the client
//   const data = getDataFromClient();
//   // Return the data to expose through useLoaderData()
//   return data;
// }

const Chats = () => {
  return (
    <>
      <h1>X's Chats</h1>
    </>
  )
}

export default Chats