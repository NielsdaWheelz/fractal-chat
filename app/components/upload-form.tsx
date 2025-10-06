// UploadForm.tsx
import { Form } from "react-router";

export default function UploadForm() {
    return (
        <Form method="post" encType="multipart/form-data" action="/api/upload">
            <input
                type="file"
                name="file"
                accept=".pdf,application/pdf,.epub,application/epub+zip"
                required
            />
            <button type="submit">upload</button>
        </Form>
    );
}