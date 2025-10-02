import { useState } from "react";
import { redirect, useLoaderData } from "react-router";
import { requireUser } from "~/utils/auth.server";
import { getDocument } from "..";


export async function loader({ request, params }: { request: Request; params: { id?: string } }) {
  const userId = await requireUser(request)
  if (!params.id) {
    throw redirect("/")
  }
  const document = await getDocument(params.id, userId)
  if (!document) {
    throw redirect("/")
  }
  return { document: document }
}


export default function Document() {
  const { document } = useLoaderData<typeof loader>() as { document: { id: string; content: string } };
  const docContent = () => {
    return { __html: document.content }
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto" dangerouslySetInnerHTML={docContent()}>
    </div>
  );
}
