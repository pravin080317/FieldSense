import { useRef, useState } from "react";
import type { ReportAttachment } from "../types/reports";
import {
  downloadAttachment,
  MAX_REPORT_ATTACHMENTS,
  readReportAttachment,
} from "../services/attachments";

export function ReportDocuments({
  attachments = [],
  onAttach,
}: {
  attachments?: ReportAttachment[];
  onAttach: (attachment: ReportAttachment) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const pending = useRef(false);
  return (
    <section
      className="report-documents"
      aria-label="Original report documents"
    >
      <h4>Original documents</h4>
      <p className="muted">
        Keep the PDF or report photos with these values. Up to three files, 3 MB
        each. Files stay on this device and are included in backups and expert
        exports. Attaching a document does not verify the entered results.
      </p>
      <ul>
        {attachments.map((a) => (
          <li key={a.id}>
            <div>
              <strong>{a.name}</strong>
              <small>
                {(a.size / 1000).toFixed(1)} KB · attached{" "}
                {new Date(a.attachedAt).toLocaleString()}
              </small>
            </div>
            <button
              type="button"
              onClick={() => {
                try {
                  downloadAttachment(a);
                } catch (e) {
                  setMessage(
                    e instanceof Error
                      ? e.message
                      : "Could not download document.",
                  );
                }
              }}
            >
              Download {a.name}
            </button>
          </li>
        ))}
      </ul>
      {!attachments.length && <p>No original document attached.</p>}
      <label>
        {busy ? "Reading document…" : "Attach original document"}
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          disabled={busy || attachments.length >= MAX_REPORT_ATTACHMENTS}
          onChange={async (e) => {
            const file = e.currentTarget.files?.[0];
            e.currentTarget.value = "";
            if (!file || pending.current) return;
            pending.current = true;
            setBusy(true);
            setMessage("");
            try {
              const attachment = await readReportAttachment(file);
              onAttach(attachment);
              setMessage(
                "Document added. Wait for Saved on this device before closing.",
              );
            } catch (err) {
              setMessage(
                err instanceof Error
                  ? err.message
                  : "Could not read this document.",
              );
            } finally {
              pending.current = false;
              setBusy(false);
            }
          }}
        />
      </label>
      {attachments.length >= MAX_REPORT_ATTACHMENTS && (
        <p>
          Three documents saved. To add a correction, create a new report and
          reference this report in its notes.
        </p>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
