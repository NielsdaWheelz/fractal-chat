import type { ActionFunctionArgs } from "react-router";
import { fileTypeFromBuffer } from 'file-type'
import { join } from "path";
import { writeFile, unlink } from "fs/promises";
import Epub from 'epub2'
import { tmpdir } from "os";
import { saveDocument } from "~/index.server";

import { readFile } from "fs/promises";
import { basename } from "path";

// converts a .epub path on disk to a JS File instance
export async function epubToFile(path: string): Promise<File> {
    const buffer = await readFile(path);
    const name = basename(path);
    const file = new File([buffer], name, { type: "application/epub+zip" });
    return file;
}

export async function epubParse(input: File) {
    // const form = await request.formData();
    // const file = form.get('file') as File | null;
    const file = input;
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
        console.log(html)
    } finally {
        await unlink(tmpPath).catch(() => { });
    }
}

epubParse(await epubToFile("/Users/jahnik/Downloads/shakespearestemp01shak.epub"));