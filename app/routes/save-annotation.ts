// app/routes/workspace.document.$id.save-annotation.ts
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { requireUser } from "~/server/auth.server";
import { saveAnnotations } from "~/server/annotations.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUser(request);

  const id = params.id; // document id from route
  if (!id) throw redirect("/");

  // --- Parse payload from either JSON or FormData(hidden input 'annotation')
  const contentType = request.headers.get("content-type") ?? "";
  let payload: any;



  if (contentType.includes("application/json")) {
    payload = await request.json();

  } else {

    const form = await request.formData();
    const raw = form.get("annotation");
    if (typeof raw !== "string") {
      return new Response("Missing 'annotation' field", { status: 400 });
    }
    try {
      payload = JSON.parse(raw);
    } catch {
          console.log("adfg");

      return new Response("Invalid JSON in 'annotation'", { status: 400 });
    }
  }


  // --- Validate required fields
  const { start, end, quote, prefix, suffix, body, createChat } = payload ?? {};
  if (typeof start !== "number" || typeof end !== "number" || !(end > start)) {
    return new Response("Invalid selection span", { status: 400 });
  }


  await saveAnnotations({
    id: crypto.randomUUID(),
    userId,
    documentId: id,
    start,
    end,
    highlights: quote ?? "",
    prefix: prefix ?? "",
    suffix: suffix ?? "",
    body: body ?? "",
  });

  // Default: go back to the document view
  return redirect(`/workspace/document/${id}`);
}
