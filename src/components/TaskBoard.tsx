import { GuidedField } from "./GuidedField";
import { useState } from "react";
import type { FarmTask, TaskOutcome, TaskStatus } from "../types/farm";
import type { Observation } from "../types/domain";
import { localDate } from "../services/workspace";
import { changeTask } from "../services/farm";
import { Icon } from "./Visuals";
function TaskCard({
  task,
  onUpdate,
}: {
  task: FarmTask;
  onUpdate: (task: FarmTask) => void;
}) {
  const [outcome, setOutcome] = useState<TaskOutcome>(task.outcome);
  const [notes, setNotes] = useState(task.notes);
  const [error, setError] = useState("");
  const [details, setDetails] = useState(false);
  const change = (status: TaskStatus) => {
    try {
      onUpdate(changeTask(task, status, outcome, notes));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update task.");
    }
  };
  return (
    <article className={`task-card status-${task.status}`}>
      <div className="task-card-head">
        <span
          className={`pill ${task.status === "completed" ? "green" : task.dueDate < localDate() ? "amber" : "neutral"}`}
        >
          {task.status === "completed"
            ? "Completed"
            : task.dueDate < localDate()
              ? "Overdue"
              : task.dueDate === localDate()
                ? "Due today"
                : task.status === "in-progress"
                  ? "In progress"
                  : "Planned"}
        </span>
        <time dateTime={task.dueDate}>{task.dueDate}</time>
      </div>
      <h3>{task.title}</h3>
      <p>
        {task.observationIds.length} linked field record
        {task.observationIds.length === 1 ? "" : "s"}
        {task.completedAt
          ? ` · Completed ${task.completedAt.toLocaleDateString("en-GB")}`
          : ""}
      </p>
      <div className="task-card-actions">
        {task.status === "todo" && (
          <button onClick={() => change("in-progress")}>
            <Icon name="arrow" size={15} /> Start task
          </button>
        )}
        {task.status !== "completed" && (
          <button className="primary" onClick={() => setDetails((v) => !v)}>
            <Icon name="check" size={15} /> Record result
          </button>
        )}
        {task.status === "completed" && (
          <button onClick={() => change("todo")}>Reopen task</button>
        )}
        <button className="text-button" onClick={() => setDetails((v) => !v)}>
          {details ? "Hide details" : "Details & history"}
        </button>
      </div>
      {details && (
        <div className="task-result">
          <GuidedField
            label="What did you find?"
            help="After returning to the field, choose whether the plants look better, the same or worse. Choose Not sure if you cannot tell."
          >
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as TaskOutcome)}
            >
              <option value="unknown">Not assessed / not applicable</option>
              <option value="better">Plants look better</option>
              <option value="same">About the same</option>
              <option value="worse">Plants look worse</option>
            </select>
          </GuidedField>
          <GuidedField
            label="What happened after the work?"
            help="Write what you did and what you saw afterwards. For example, the water drained but the leaves are still yellow. These notes are needed to finish the task."
          >
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you check, what changed, and what should happen next?"
            />
          </GuidedField>
          <button className="primary" onClick={() => change("completed")}>
            Save result & complete task
          </button>
          <details className="task-history">
            <summary>{task.events.length} status changes</summary>
            {task.events.length ? (
              task.events.map((e, i) => (
                <p key={i}>
                  {e.at.toLocaleString("en-GB")} · {e.status} · {e.outcome}
                  {e.notes ? ` · ${e.notes}` : ""}
                </p>
              ))
            ) : (
              <p>
                Migrated follow-up; original status timestamps were not
                recorded.
              </p>
            )}
          </details>
        </div>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </article>
  );
}
export function TaskBoard({
  tasks,
  observations,
  suggestion,
  onCreate,
  onUpdate,
}: {
  tasks: FarmTask[];
  observations: Observation[];
  suggestion: string;
  onCreate: (input: {
    title: string;
    dueDate: string;
    observationIds: string[];
  }) => void;
  onUpdate: (task: FarmTask) => void;
}) {
  const [filter, setFilter] = useState("pending");
  const [title, setTitle] = useState(suggestion);
  const [due, setDue] = useState(localDate());
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const visible = tasks
    .filter(
      (t) =>
        filter === "all" ||
        (filter === "completed"
          ? t.status === "completed"
          : t.status !== "completed"),
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return (
    <div className="two-col task-workspace">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Your field tasks</h2>
            <p>
              {tasks.filter((t) => t.status !== "completed").length} pending ·{" "}
              {tasks.filter((t) => t.status === "completed").length} completed
              for this field and season
            </p>
          </div>
          <Icon name="calendar" />
        </div>
        <div className="task-filters" aria-label="Filter tasks">
          {[
            ["pending", "Pending"],
            ["completed", "Completed"],
            ["all", "All tasks"],
          ].map(([v, label]) => (
            <button
              key={v}
              aria-pressed={filter === v}
              className={filter === v ? "active" : ""}
              onClick={() => setFilter(v)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="task-list">
          {visible.map((t) => (
            <TaskCard key={t.id} task={t} onUpdate={onUpdate} />
          ))}
        </div>
        {!visible.length && (
          <div className="empty-state">
            <Icon name="calendar" size={38} />
            <h3>
              {filter === "completed"
                ? "No completed tasks yet"
                : "Nothing planned in this view"}
            </h3>
            <p>
              Create a task with a date. It will stay linked to this field and
              crop season.
            </p>
          </div>
        )}
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Plan your next step</h2>
            <p>
              Multiple tasks can be saved. Dates are plans, not automatic
              notifications.
            </p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            try {
              onCreate({
                title,
                dueDate: due,
                observationIds: link ? [link] : [],
              });
              setTitle("");
              setLink("");
              setError("");
            } catch (e) {
              setError(
                e instanceof Error ? e.message : "Check the task details.",
              );
            }
          }}
        >
          <GuidedField
            label="What needs doing?"
            help="Write one clear job, such as check the north drain or take a soil sample. Keep it specific enough to know when it is finished."
          >
            <textarea
              required
              value={title}
              maxLength={1000}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="For example: check water depth in the wet patch"
            />
          </GuidedField>
          <GuidedField
            label="When should this be done?"
            help="Choose when you plan to do the job. This saves a date in the app; it does not automatically send a phone message."
          >
            <input
              type="date"
              required
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
          </GuidedField>
          <GuidedField
            label="Choose a related visit (optional)"
            help="Choose the saved field note that explains why this work is needed. Leave No linked note if the task is not about an earlier visit."
          >
            <select value={link} onChange={(e) => setLink(e.target.value)}>
              <option value="">No linked note</option>
              {observations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.observedAt.toLocaleDateString("en-GB")} · Point{" "}
                  {o.scoutingPointId?.slice(-1) || "—"} ·{" "}
                  {o.leafColor || "field note"}
                </option>
              ))}
            </select>
          </GuidedField>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button className="primary full-width" type="submit">
            <Icon name="plus" size={17} /> Add task
          </button>
        </form>
        <p className="muted">
          When you return, open Record result and add what you found. Changes to
          task status are kept in its history.
        </p>
      </section>
    </div>
  );
}
