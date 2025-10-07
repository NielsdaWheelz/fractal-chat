// UploadForm.tsx
import { Form } from "react-router";

export default function UploadForm() {
    return (
        <Form method="post" encType="multipart/form-data" action="/api/upload">
            <input className="text-xs py-2 pl-4 pr-2"
                type="file"
                name="file"
                accept=".pdf,application/pdf,.epub,application/epub+zip"
                required
            />
            <button className="text-xs py-2 pl-4 pr-2" type="submit">Upload</button>
        </Form>
    );
}