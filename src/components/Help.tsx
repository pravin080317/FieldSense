import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Visuals";

export function CaptureIllustration({
  closeup = false,
}: {
  closeup?: boolean;
}) {
  const id = useId();
  return (
    <svg viewBox="0 0 340 200" role="img" aria-labelledby={id}>
      <title id={id}>
        {closeup
          ? "Example framing: a close view of a rice leaf"
          : "Example framing: a whole rice plant and surrounding soil"}
      </title>
      <rect
        width="340"
        height="200"
        rx="18"
        fill={closeup ? "#eff3e8" : "#eaf2e5"}
      />
      <circle cx="273" cy="43" r="24" fill="#e4ddb5" />
      <path d="M0 164Q90 140 180 163T340 157V200H0Z" fill="#d6dfc1" />
      {closeup ? (
        <>
          <path d="M88 163Q137 32 271 30Q249 145 88 163Z" fill="#74a35f" />
          <path
            d="M88 163Q179 95 258 41"
            stroke="#e0e9b6"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="m145 118 3-29m35 3 1-29m-37 56 30 5m8-31 27 4"
            stroke="#a7c484"
            strokeWidth="2"
          />
          <rect
            x="59"
            y="22"
            width="222"
            height="155"
            rx="12"
            fill="none"
            stroke="#385f3b"
            strokeWidth="2"
            strokeDasharray="7 5"
          />
          <circle
            cx="174"
            cy="97"
            r="44"
            fill="none"
            stroke="#ffffffb3"
            strokeWidth="3"
          />
        </>
      ) : (
        <>
          <g stroke="#4d7b47" strokeWidth="3" fill="none">
            <path d="M170 169V54 M169 145Q111 111 115 78 M171 128Q214 101 226 70 M170 110Q139 81 148 46 M170 154Q221 142 239 106" />
          </g>
          <g fill="#80a65b">
            <path d="M169 145Q108 139 100 78Q149 97 169 145Z" />
            <path d="M171 128Q213 125 234 64Q193 77 171 128Z" />
            <path d="M170 110Q136 104 139 40Q166 61 170 110Z" />
            <path d="M170 154Q230 161 252 105Q205 114 170 154Z" />
          </g>
          <path
            d="M166 58q-15-28-5-36m9 37q20-27 13-40m-9 40q7-20 28-20"
            stroke="#b8ac62"
            strokeWidth="3"
            fill="none"
          />
          <rect
            x="81"
            y="15"
            width="180"
            height="171"
            rx="12"
            fill="none"
            stroke="#385f3b"
            strokeWidth="2"
            strokeDasharray="7 5"
          />
        </>
      )}
      <path
        d="M36 29h16M36 29v16M304 29h-16M304 29v16M36 171h16M36 171v-16M304 171h-16M304 171v-16"
        stroke="#88a37a"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
export function PhotoGuide({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`capture-guide ${compact ? "capture-guide-compact" : ""}`}>
      <div className="capture-guide-heading">
        <span className="eyebrow">A SIMPLE PHOTO GUIDE</span>
        <h3>Two views tell a better story.</h3>
        <p>Use daylight, hold the phone steady, and keep the plant in focus.</p>
      </div>
      <div className="capture-examples">
        <article>
          <CaptureIllustration />
          <div>
            <span>01</span>
            <h4>Show the whole plant</h4>
            <p>
              Include the stem, leaves and some soil. Step back so nothing
              important is cut off.
            </p>
          </div>
        </article>
        <article>
          <CaptureIllustration closeup />
          <div>
            <span>02</span>
            <h4>Move closer to the change</h4>
            <p>
              Fill the photo with the affected leaf. Take another view of its
              underside if you can.
            </p>
          </div>
        </article>
      </div>
      <p className="guide-disclaimer">
        Framing illustrations only. Your uploaded photos become part of your
        visit record.
      </p>
    </div>
  );
}
export function HelpHint({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="field-help">
      <summary>
        <Icon name="help" size={14} />
        {title}
      </summary>
      <div>{children}</div>
    </details>
  );
}
const answers = [
  {
    category: "Maps and location",
    question: "Can I find a field by place name or clicking the map?",
    answer:
      "Open My field and Add field or Edit field. Search a nearby town or village, select the correct place, then use Set field centre and tap your exact field location. Use Mark corners separately to draw the boundary and save the field. Search needs internet and sends the typed place name to Open-Meteo. A place result locates an area, not a farm boundary. You can always enter latitude and longitude directly.",
  },
  {
    category: "Maps and location",
    question: "Why is the map showing a sample instead of my field?",
    answer:
      "The starter workspace shows a sample field near Salem. Tap Locate me on the map and allow location permission to show your device position. This does not identify your farm or save a boundary. In My field, add a field, enter or use your device coordinates, mark/import its boundary and save. Device location needs HTTPS or localhost, browser permission and working device location services. Desktop results can be approximate; the accuracy circle shows the reported uncertainty.",
  },
  {
    category: "Getting started",
    question: "What should I do first?",
    answer:
      "Open Record visit, choose one of the four marked places, and write down what you see. Include plants that look normal as well as those that have changed.",
  },
  {
    category: "Recording a visit",
    question: "What is a check point?",
    answer:
      "A check point is a marked place in the field. Return to the same place each time so you can make a fair comparison. The four places in this demo use sample coordinates.",
  },
  {
    category: "Recording a visit",
    question: "Why are old values shown in the form?",
    answer:
      "They are a reference from an earlier visit, not a new measurement. Check the plant and soil again, change anything that is different, and confirm the date before saving. A new visit never removes the earlier one.",
  },
  {
    category: "Photos",
    question: "How do I take useful photos?",
    answer:
      "First show the whole plant and a little of the surrounding soil. Then take a sharp close-up of what changed. Avoid heavy shadows and blurred photos. Use similar angles when you return.",
  },
  {
    category: "Crop concerns",
    question: "Does this app confirm a disease?",
    answer:
      "No. It compares what you recorded and suggests the next useful check. Similar leaf changes can have several causes. An agronomist or laboratory may need to confirm the cause before treatment is chosen.",
  },
  {
    category: "Soil and water",
    question: "What does “moist” mean?",
    answer:
      "Moist means damp. Record the soil condition at the marked place, rather than guessing from a rainfall report. If you are unsure which description fits, add a note describing what you saw.",
  },
  {
    category: "Soil and water",
    question: "Why is a soil report not being used?",
    answer:
      "Check whether the report belongs to this field, when the sample was tested, and whether a laboratory interpretation is available. An old report or one from another field cannot describe the current condition here.",
  },
  {
    category: "Next visits",
    question: "How do I know if things are improving?",
    answer:
      "Save a next visit date in Next steps. Return to the same marked places, take similar photos, and record whether the plants look better, about the same, or worse. Keep both the earlier and new records.",
  },
  {
    category: "Saved records",
    question: "Where are my records saved?",
    answer:
      "They stay in this browser on this device. Wait for “Saved on this device” before closing. They are not automatically shared with another phone or an expert, and clearing browser site data can remove them.",
  },
  {
    category: "Saved records",
    question: "How do I keep a backup?",
    answer:
      "Open Expert report and choose Download backup. Keep that JSON file somewhere safe. To bring it back, choose the file in Restore a backup and review it before merging. A normal shareable case report is different from a restorable backup.",
  },
  {
    category: "Demo data",
    question: "Is the field photo a live view of my farm?",
    answer:
      "No. The banner image is AI-generated illustration. The field, map, weather and lab reports are labelled sample data. Only the notes and photos you add are your own input.",
  },
  {
    category: "Saved records",
    question: "Can I open the app without internet?",
    answer:
      "In the production app, connect once and wait for Offline app ready before your field trip. You can then reopen the same address and use saved records without internet. Development previews do not enable offline opening. Street maps still need a connection. Keep a backup because clearing browser data removes local records.",
  },
];
export function HelpCenter({
  open,
  onClose,
  onRecord,
  onPlan,
}: {
  open: boolean;
  onClose: () => void;
  onRecord: () => void;
  onPlan: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal();
    if (!open && ref.current?.open) ref.current.close();
  }, [open]);
  const filtered = answers.filter((a) =>
    `${a.category} ${a.question} ${a.answer}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const dismiss = () => {
    setQuery("");
    onClose();
  };
  return (
    <dialog
      className="help-dialog"
      aria-labelledby={headingId}
      ref={ref}
      onCancel={dismiss}
      onClose={dismiss}
    >
      <div className="help-dialog-top">
        <span className="icon-box">
          <Icon name="help" />
        </span>
        <div>
          <span className="eyebrow">HERE TO HELP</span>
          <h2 id={headingId}>A little guidance for your next visit.</h2>
        </div>
        <button
          className="close-help"
          aria-label="Close help"
          onClick={dismiss}
        >
          ×
        </button>
      </div>
      <div className="help-dialog-body">
        <label className="help-search">
          <Icon name="search" />
          <input
            autoFocus
            placeholder="Search photos, soil, saved records…"
            aria-label="Search help"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {!query && (
          <>
            <PhotoGuide compact />
            <div className="help-shortcuts">
              <button
                onClick={() => {
                  dismiss();
                  onRecord();
                }}
              >
                Record a field visit <Icon name="arrow" size={16} />
              </button>
              <button
                onClick={() => {
                  dismiss();
                  onPlan();
                }}
              >
                Plan a return visit <Icon name="calendar" size={16} />
              </button>
            </div>
          </>
        )}
        <h3 className="faq-heading">
          {query
            ? `${filtered.length} helpful answer${filtered.length === 1 ? "" : "s"}`
            : "Common questions"}
        </h3>
        {filtered.map((a) => (
          <details className="faq" key={a.question}>
            <summary>
              {a.question}
              <Icon name="plus" size={15} />
            </summary>
            <p>{a.answer}</p>
            <small>{a.category}</small>
          </details>
        ))}
        {!filtered.length && (
          <p className="empty-help">
            No matching answer yet. Try “photos”, “backup”, “soil” or “visit”.
          </p>
        )}
      </div>
    </dialog>
  );
}
