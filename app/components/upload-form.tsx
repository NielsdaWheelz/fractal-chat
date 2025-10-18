// UploadForm.tsx
import { Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { Form } from "react-router";
import { Button } from "./ui/button";
import { useTheme } from "~/hooks/use-theme";
import type { ThemeName } from "~/types/theme";

type UploadFormProps = {
  disabled?: boolean;
};

const headerCopy: Record<ThemeName, { empty: string; selected: string }> = {
  light: { empty: "Drop a document", selected: "Selected file" },
  dark: { empty: "Drop a document", selected: "Selected file" },
  neon: { empty: "Drop A Read", selected: "Selected Transmission" },
};

const placeholderCopy: Record<ThemeName, string> = {
  light: "Click or drag a PDF or EPUB",
  dark: "Click or drag a PDF or EPUB",
  neon: "Click or drag to upload",
};

const submitCopy: Record<ThemeName, string> = {
  light: "Upload",
  dark: "Upload",
  neon: "Transmit",
};

export default function UploadForm({ disabled }: UploadFormProps) {
  const [fileName, setFileName] = useState<string>("");
  const { theme } = useTheme();
  const isDisabled = !!disabled;

  const heading = useMemo(
    () => (fileName ? headerCopy[theme].selected : headerCopy[theme].empty),
    [fileName, theme],
  );

  const placeholder = useMemo(
    () => (fileName ? fileName : placeholderCopy[theme]),
    [fileName, theme],
  );

  return (
    <Form
      method="post"
      encType="multipart/form-data"
      action="/api/upload"
      data-upload="card"
      data-disabled={isDisabled ? "true" : "false"}
    >
      <input
        id="file"
        name="file"
        type="file"
        accept=".pdf,application/pdf,.epub,application/epub+zip"
        required
        className="sr-only"
        disabled={isDisabled}
        onChange={(event) => {
          const selectedFile = event.currentTarget.files?.[0];
          setFileName(selectedFile ? selectedFile.name : "");
        }}
      />
      <label
        htmlFor="file"
        data-upload="dropzone"
        data-disabled={isDisabled ? "true" : "false"}
      >
        <span data-upload="label">{heading}</span>
        <div data-upload="meta">
          <span data-upload="filename" className={fileName ? "is-selected" : undefined}>
            {placeholder}
          </span>
          <Upload data-upload="icon" aria-hidden="true" />
        </div>
      </label>
      <div className="mt-4 flex justify-end">
        <Button
          type="submit"
          variant="ghost"
          data-upload="submit"
          data-disabled={isDisabled ? "true" : "false"}
          disabled={isDisabled}
        >
          {submitCopy[theme]}
        </Button>
      </div>
    </Form>
  );
}
