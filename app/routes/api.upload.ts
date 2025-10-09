import { EPub } from 'epub2';
import { unlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { redirect, type ActionFunctionArgs } from "react-router";
import { requireUser } from "~/server/auth.server";
import { saveDocument } from "~/server/documents.server";


export async function action({ request }: ActionFunctionArgs) {
    const form = await request.formData();
    const userId = await requireUser(request)

    const file = form.get('file') as File | null; // figure out how to do this properly!!!
    if (!file) throw new Response("missing file", { status: 400 });
    if (file.size > 5 * 1024 * 1024) throw new Response("file too large", { status: 413 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const tmpPath = join(tmpdir(), `${crypto.randomUUID()}.epub`);
    await writeFile(tmpPath, buffer);

    const documentId = crypto.randomUUID()

    try {
        const book = await EPub.createAsync(tmpPath);

        const htmlChapters = await Promise.all(
            book.flow.map(ch => book.getChapterRawAsync(ch.id))
        )

        const html = htmlChapters.join('\n')


        const document = {
            id: documentId,
            userId: userId,
            url: "epub",
            title: "The Tempest",
            content: html,
            textContent: null,
            publishedTime: null,
        }
        await saveDocument(document)
    } finally {
        await unlink(tmpPath).catch(() => { });
    }

    throw redirect("/workspace/document/" + documentId)
}