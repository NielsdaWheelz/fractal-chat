// app/routes/workspace.document.$id.save-annotation.ts
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { requireUser } from "~/server/auth.server";
import { deleteAnnotations } from "~/server/annotations.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUser(request);


  const id = params.id; // document id from route
  const docId = params.docId;
    console.log(id);

  if (!id) throw redirect("/");
    console.log(id);

  const contentType = request.headers.get("content-type") ?? "";
  let payload: any;

  await deleteAnnotations(id);

  console.log(docId);
  throw redirect(`/workspace/document/${docId}`)
}
