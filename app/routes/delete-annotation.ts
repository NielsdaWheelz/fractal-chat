// app/routes/workspace.document.$id.save-annotation.ts
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { requireUser, getSession } from "~/server/auth.server";
import { deleteAnnotations } from "~/server/annotations.server";

export async function action({ request, params }: ActionFunctionArgs) {
  // Check for session - bypass auth for screenshots
  const session = await getSession(request);
  const userId = session?.user ? await requireUser(request) : "demo-user-id";


  const id = params.id;
  const docId = params.docId;


  if (!id) throw redirect("/");

  const contentType = request.headers.get("content-type") ?? "";
  let payload: any;

  // Only delete from database if real user
  if (session?.user) {
    await deleteAnnotations(userId, id);
  }
  // For mock user, just redirect back (deletion will happen client-side only)

  throw redirect(`/workspace/document/${docId}`)
}
