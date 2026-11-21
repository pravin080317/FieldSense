import { cloneElement, useId, useState } from "react";
import type { ReactElement } from "react";
import { Icon } from "./Visuals";

/** Help is a separate button, never a second form control inside the input's label. */
export function GuidedField({
  label,
  help,
  children,
}: {
  label: string;
  help: string;
  children: ReactElement<{ id?: string; "aria-describedby"?: string }>;
}) {
  const generated = useId();
  const id = children.props.id || generated + "-input";
  const helpId = generated + "-help";
  const [open, setOpen] = useState(false);
  return (
    <div className="guided-field">
      <div className="guided-field-heading">
        <label htmlFor={id}>{label}</label>
        <button
          type="button"
          className="input-help-button"
          aria-label={`Help with ${label}`}
          aria-expanded={open}
          aria-controls={helpId}
          onClick={() => setOpen(!open)}
        >
          <Icon name="help" size={18} />
          <span>Help</span>
        </button>
      </div>
      {cloneElement(children, {
        id,
        "aria-describedby": [children.props["aria-describedby"], helpId]
          .filter(Boolean)
          .join(" "),
      })}
      <p className="input-help-text" id={helpId} hidden={!open}>
        {help}
      </p>
    </div>
  );
}
