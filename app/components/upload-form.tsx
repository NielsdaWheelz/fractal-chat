// UploadForm.tsx
import { useState } from "react";
import { Form } from "react-router";

export default function UploadForm() {
    const [fileName, setFileName] = useState<string>("");

    return (
        <Form method="post" encType="multipart/form-data" action="/api/upload" className="space-y-2">
            {/* hidden, but still accessible via the label */}
            <input
                id="file"
                name="file"
                type="file"
                accept=".pdf,application/pdf,.epub,application/epub+zip"
                required
                className="sr-only"
                onChange={(e) => {
                    const f = e.currentTarget.files?.[0];
                    setFileName(f ? f.name : "");
                }}
            />

            <label
                htmlFor="file"
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring"
            >
                {/* your icon could go here */}
                <span>select file</span>
            </label>

            <div className="text-xs text-gray-600 min-h-[1rem]">
                {fileName ? `selected: ${fileName}` : "no file selected"}
            </div>

            <button
                type="submit"
                className="rounded-md bg-black text-white px-3 py-2 text-xs hover:bg-black/90"
            >
                upload
            </button>
        </Form>
    );
}