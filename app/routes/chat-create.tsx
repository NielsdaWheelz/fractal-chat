import { redirect, type ActionFunctionArgs } from "react-router"
import { requireUser } from "~/utils/auth.server"
import { saveChat } from ".."

// POST /chat will create a new chat
export async function action({ request, params }: ActionFunctionArgs) {
  const docId = params.id
  const userId = await requireUser(request)
  const chat = {
    id: crypto.randomUUID(),
    userId: userId,
    documentId: docId,
    messages: []
  }
  await saveChat(chat)
  // throw redirect("/workspace/chat/" + chat.id)
  // return new Response(JSON.stringify({ id: chat.id }), { status: 200, headers: { "Content-Type": "application/json" } })
}