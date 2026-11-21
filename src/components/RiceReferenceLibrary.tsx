import { useEffect, useState } from "react";
import {
  photoResolutionNote,
  riceReferences,
  riceReferenceSource,
  searchRiceReferences,
} from "../data/riceReferences";

export default function RiceReferenceLibrary({
  onRecord,
  onPlan,
}: {
  onRecord: () => void;
  onPlan: (title: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string>(riceReferences[0].id);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  const current = riceReferences.find((r) => r.id === selected)!;
  const results = searchRiceReferences(query);
  return (
    <section
      className="report-records rice-library"
      aria-label="Rice leaf reference library"
    >
      <div className="report-intro">
        <div>
          <span className="eyebrow">LEARN · COMPARE · RECORD</span>
          <h2>Rice leaf reference library</h2>
          <p>
            Browse labelled research examples, then record what you see in your
            own field.
          </p>
        </div>
        <span className="pill neutral">Reference images · not AI results</span>
      </div>
      <p className="muted">
        These three dataset classes are not a complete list of rice problems.
        Similar-looking changes can have different causes. No disease model is
        running, and your photo is not automatically matched or sent to a
        server.
      </p>
      <label>
        Search the reference library
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try brown spot or leaf blight"
        />
      </label>
      <p role="status">
        {results.length} reference{" "}
        {results.length === 1 ? "category" : "categories"}
      </p>
      <div className="rice-reference-grid">
        {results.map((r) => (
          <button
            key={r.id}
            className={
              selected === r.id
                ? "rice-reference-card selected"
                : "rice-reference-card"
            }
            aria-pressed={selected === r.id}
            onClick={() => setSelected(r.id)}
          >
            <img
              src={r.image}
              alt={`Research dataset example labelled ${r.label}`}
              loading="lazy"
            />
            <strong>{r.label}</strong>
            <small>Dataset label · Rice</small>
          </button>
        ))}
      </div>
      {!results.length && (
        <p>
          No matching reference. This library has only three categories; record
          unfamiliar symptoms for review.
        </p>
      )}
      <div className="rice-compare-grid">
        <figure>
          <img
            src={current.image}
            alt={`Selected reference: ${current.label}`}
          />
          <figcaption>
            <strong>Reference: {current.label}</strong>
            <br />
            Unmodified dataset image, photographed on a white background. Not a
            photograph from your field.
          </figcaption>
        </figure>
        <div>
          <label>
            Choose your leaf photo for a side-by-side view
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const next = e.target.files?.[0];
                e.target.value = "";
                if (!next) return;
                if (
                  !["image/jpeg", "image/png", "image/webp"].includes(
                    next.type,
                  ) ||
                  next.size < 1 ||
                  next.size > 3_000_000
                ) {
                  setError("Choose a JPEG, PNG or WebP photo up to 3 MB.");
                  return;
                }
                setError("");
                setNote("");
                setPreview(URL.createObjectURL(next));
                setFile(next);
              }}
            />
          </label>
          {preview ? (
            <figure>
              <img
                src={preview}
                alt="Your chosen leaf photo, shown locally for manual comparison"
                onLoad={(e) =>
                  setNote(
                    photoResolutionNote(
                      e.currentTarget.naturalWidth,
                      e.currentTarget.naturalHeight,
                    ),
                  )
                }
                onError={() =>
                  setError("Could not open this photo. Try a different image.")
                }
              />
              <figcaption>
                {file?.name} · Your photo, temporary preview
              </figcaption>
            </figure>
          ) : (
            <div className="report-empty">
              Your photo will appear here. You choose which reference to view;
              the app does not classify it.
            </div>
          )}
          {note && <p>{note}</p>}
          {error && <p role="alert">{error}</p>}
          <p className="muted">
            This preview is not saved as a visit. Use Record visit to save your
            observations and photos with the field and date.
          </p>
        </div>
      </div>
      <h3>What to record for review</h3>
      <ul>
        {current.prompts.map((prompt) => (
          <li key={prompt}>{prompt}</li>
        ))}
      </ul>
      <div className="rice-library-actions">
        <button className="primary" onClick={onRecord}>
          Record a field visit
        </button>
        <button
          onClick={() =>
            onPlan(
              `Ask an agronomist to review leaf changes; reference viewed: ${current.label}. Not a confirmed diagnosis.`,
            )
          }
        >
          Plan an expert review
        </button>
      </div>
      <details>
        <summary>Image source and recognition status</summary>
        <p>
          {riceReferenceSource.credit}.{" "}
          <a href={riceReferenceSource.url} target="_blank" rel="noreferrer">
            Rice Leaf Diseases dataset
          </a>{" "}
          ·{" "}
          <a
            href={riceReferenceSource.license}
            target="_blank"
            rel="noreferrer"
          >
            CC BY 4.0
          </a>
          . Three images reproduced without modification. Original paths and
          hashes are bundled in{" "}
          <a
            href="/images/rice-reference/ATTRIBUTION.json"
            target="_blank"
            rel="noreferrer"
          >
            asset attribution
          </a>
          .
        </p>
        <p>
          PlantVillage provides useful image-classification research, but its
          published classes do not include rice. Rice recognition needs a
          rice-specific model, evaluation on unseen local field photos and an
          “uncertain” outcome. No model or accuracy claim has been added to this
          app.
        </p>
      </details>
    </section>
  );
}
