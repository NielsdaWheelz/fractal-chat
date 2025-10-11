// UploadForm.tsx
import { useState } from "react";
import { Form } from "react-router";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";

export default function UploadForm() {
    const [fileName, setFileName] = useState<string>("");

    return (
        <Form method="post" encType="multipart/form-data" action="/api/upload" className="space-y-2">
            <div className="flex flexbox justify-between px-2.5 ml-2">
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
                <div className=" text-xs rounded-md font-medium text-gray-400 min-h-[1rem] min-w-45">
                    {fileName ? `selected: ${fileName}` : "Upload Read"}
                </div>

                <label
                    htmlFor="file"
                    className="inline-flex items-center text-sm cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring"
                >
                    {/* your icon could go here */}
                    <Upload className="h-4 w-4" />
                </label>
            </div>
            <div className="flex justify-center">
                <button
                    type="submit"
                    className="rounded-md bg-[#a87af5] text-white px-2 py-1 text-xs hover:bg-black/90"
                >
                    Upload
                </button>
            </div>
        </Form>
    );
}

<Tooltip>
    <TooltipTrigger asChild>
        <Button size="icon" variant="ghost" onClick={() => {
        }}>
            <span className="sr-only">Clear Search</span>
        </Button>
    </TooltipTrigger>
    <TooltipContent>
        <p>Clear Search</p>
    </TooltipContent>
</Tooltip>