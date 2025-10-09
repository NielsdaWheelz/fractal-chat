import { requireUser } from "~/server/auth.server";
import { getGroup } from "~/server/groups.server";

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { id?: string };
}) {
  const userId = await requireUser(request);
  if (!params.id) {
    throw redirect("/");
  }
  const document = await getDocument(params.id);
  const annotations = await getAnnotations(userId, params.id);
  if (!document) {
    throw redirect("/");
  }
  return { document: document, annotations: annotations };
}