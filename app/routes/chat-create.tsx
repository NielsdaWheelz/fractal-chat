import { redirect, type ActionFunctionArgs } from "react-router"
import { requireUser } from "~/utils/auth.server"
import { saveChat } from "../server"

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
  // Redirect to the newly created chat route
  throw redirect(`/workspace/document/${docId}/chat/${chat.id}`)
}