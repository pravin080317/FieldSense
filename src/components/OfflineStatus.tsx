import { useEffect, useState } from "react";

type Status = "preparing" | "ready" | "unavailable" | "development";

export function OfflineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState<Status>(
    import.meta.env.DEV
      ? "development"
      : !("serviceWorker" in navigator) || !window.isSecureContext
        ? "unavailable"
        : "preparing",
  );
  const [update, setUpdate] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const connected = () => setOnline(navigator.onLine);
    window.addEventListener("online", connected);
    window.addEventListener("offline", connected);
    return () => {
      window.removeEventListener("online", connected);
      window.removeEventListener("offline", connected);
    };
  }, []);
  useEffect(() => {
    if (import.meta.env.DEV) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];
    const check = async (worker: ServiceWorker | null) => {
      if (!worker || disposed) return;
      const channel = new MessageChannel();
      const timer = window.setTimeout(() => {
        channel.port1.close();
        if (!disposed) setStatus("unavailable");
      }, 8000);
      cleanups.push(() => {
        clearTimeout(timer);
        channel.port1.close();
      });
      channel.port1.onmessage = (event) => {
        clearTimeout(timer);
        channel.port1.close();
        if (!disposed) setStatus(event.data === true ? "ready" : "unavailable");
      };
      worker.postMessage(attempt > 0 ? "REPAIR_SHELL" : "CHECK_SHELL", [
        channel.port2,
      ]);
    };
    if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
    navigator.serviceWorker
      .register(import.meta.env.BASE_URL + "sw.js", { updateViaCache: "none" })
      .then((registration) => {
        if (disposed) return;
        setUpdate(Boolean(registration.waiting));
        if (registration.active) void check(registration.active);
        const observe = () => {
          const worker = registration.installing;
          if (!worker) return;
          const changed = () => {
            if (disposed) return;
            if (worker.state === "activated") void check(worker);
            if (worker.state === "installed" && registration.active)
              setUpdate(true);
            if (worker.state === "redundant" && !registration.active)
              setStatus("unavailable");
          };
          worker.addEventListener("statechange", changed);
          cleanups.push(() =>
            worker.removeEventListener("statechange", changed),
          );
          changed();
        };
        observe();
        registration.addEventListener("updatefound", observe);
        cleanups.push(() =>
          registration.removeEventListener("updatefound", observe),
        );
      })
      .catch(() => {
        if (!disposed) setStatus("unavailable");
      });
    const controlled = () => void check(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener("controllerchange", controlled);
    cleanups.push(() =>
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        controlled,
      ),
    );
    return () => {
      disposed = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [attempt]);
  const detail =
    status === "ready"
      ? "App saved for offline opening. Records stay on this device; street maps need internet."
      : status === "development"
        ? "Offline opening is available in the production build, not this development preview."
        : status === "preparing"
          ? "Preparing offline opening. Keep this page open while the app downloads."
          : "Offline opening is not ready. Connect and retry. Your saved records remain in this browser.";
  return (
    <aside
      className="offline-status"
      aria-label="Connection and offline availability"
    >
      <span
        className={online ? "connection-dot" : "connection-dot disconnected"}
      />
      <div>
        <strong>
          {online ? "Connected" : "No connection"} ·{" "}
          {status === "ready"
            ? "Offline app ready"
            : status === "preparing"
              ? "Preparing offline app"
              : status === "development"
                ? "Development preview"
                : "Offline app not ready"}
        </strong>
        <p>{detail}</p>
        {update && (
          <p>
            Update downloaded. Wait for records to save, then close all
            FieldSense tabs and reopen to use it.
          </p>
        )}
      </div>
      {status === "unavailable" && (
        <button
          onClick={() => {
            setStatus("preparing");
            setAttempt((value) => value + 1);
          }}
        >
          Retry offline setup
        </button>
      )}
    </aside>
  );
}
