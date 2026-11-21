import type { ReportAttachment } from "../types/reports.ts";

export const MAX_REPORT_FILE = 3_000_000;
export const MAX_REPORT_ATTACHMENTS = 3;
const types = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
export function validateAttachment(
  raw: unknown,
): asserts raw is ReportAttachment {
  if (!raw || typeof raw !== "object")
    throw new Error("Invalid document attachment.");
  const r = raw as ReportAttachment;
  if (
    typeof r.id !== "string" ||
    !r.id ||
    typeof r.name !== "string" ||
    !r.name.trim() ||
    r.name.length > 240 ||
    Array.from(r.name).some(
      (c) => c.charCodeAt(0) < 32 || c === "/" || c === "\\",
    )
  )
    throw new Error("Invalid attachment name or ID.");
  if (
    !types.includes(r.mime) ||
    !Number.isInteger(r.size) ||
    r.size < 1 ||
    r.size > MAX_REPORT_FILE ||
    typeof r.dataUrl !== "string" ||
    r.dataUrl.length > 4_000_100
  )
    throw new Error("Use a PDF, PNG, JPEG or WebP document up to 3 MB.");
  if (
    typeof r.attachedAt !== "string" ||
    !Number.isFinite(+new Date(r.attachedAt))
  )
    throw new Error("Invalid attachment timestamp.");
  const prefix = `data:${r.mime};base64,`;
  if (!r.dataUrl.startsWith(prefix))
    throw new Error("Attachment type does not match its data.");
  const base64 = r.dataUrl.slice(prefix.length);
  if (base64.length % 4 !== 0 || /[^A-Za-z0-9+/=]/.test(base64))
    throw new Error("Invalid attachment encoding.");
  const binary = atob(base64);
  if (btoa(binary) !== base64) throw new Error("Invalid attachment encoding.");
  if (binary.length !== r.size)
    throw new Error("Attachment size does not match its data.");
  const signature =
    r.mime === "application/pdf"
      ? binary.startsWith("%PDF-")
      : r.mime === "image/png"
        ? binary.startsWith("\x89PNG\r\n\x1a\n")
        : r.mime === "image/jpeg"
          ? binary.startsWith("\xff\xd8\xff")
          : binary.startsWith("RIFF") && binary.slice(8, 12) === "WEBP";
  if (!signature)
    throw new Error("The document content does not match its file type.");
}

export async function readReportAttachment(
  file: File,
): Promise<ReportAttachment> {
  if (
    !types.includes(file.type) ||
    file.size < 1 ||
    file.size > MAX_REPORT_FILE
  )
    throw new Error("Choose a PDF, PNG, JPEG or WebP document up to 3 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  const attachment = {
    id: crypto.randomUUID(),
    name: file.name,
    mime: file.type,
    size: bytes.length,
    attachedAt: new Date().toISOString(),
    dataUrl: `data:${file.type};base64,${btoa(binary)}`,
  };
  validateAttachment(attachment);
  return attachment;
}

export function downloadAttachment(attachment: ReportAttachment) {
  validateAttachment(attachment);
  const binary = atob(attachment.dataUrl.split(",")[1]);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: attachment.mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = attachment.name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
