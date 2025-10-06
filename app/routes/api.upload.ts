import type { ActionFunctionArgs } from "react-router";
import { fileTypeFromBuffer } from 'file-type'
import { join } from "path";
import { writeFile, unlink } from "fs/promises";
import Epub from 'epub2'
import { tmpdir } from "os";
import { saveDocument } from "~/index.server";


export async function action({ request }: ActionFunctionArgs) {
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) throw new Response("missing file", { status: 400 });
    if (file.size > 5 * 1024 * 1024) throw new Response("file too large", { status: 413 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const tmpPath = join(tmpdir(), `${crypto.randomUUID()}.epub`);

    await writeFile(tmpPath, buffer);

    try {
        const book = await Epub.createAsync(tmpPath);

        const htmlChapters = await Promise.all(
            book.flow.map(ch => book.getChapterRawAsync(ch.id))
        )

        const html = htmlChapters.join('\n')
        saveDocument(html)
    } finally {
        await unlink(tmpPath).catch(() => { });
    }
}