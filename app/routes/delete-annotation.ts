// app/routes/workspace.document.$id.save-annotation.ts
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { requireUser } from "~/server/auth.server";
import { deleteAnnotations } from "~/server/annotations.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUser(request);


  const id = params.id;
  const docId = params.docId;


  if (!id) throw redirect("/");

  const contentType = request.headers.get("content-type") ?? "";
  let payload: any;
  await deleteAnnotations(userId, id);

  throw redirect(`/workspace/document/${docId}`)
}
