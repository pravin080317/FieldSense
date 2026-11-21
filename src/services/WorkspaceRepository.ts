import type { Workspace } from "../types/workspace.ts";
import { LEGACY_KEY, parseWorkspace } from "./workspace.ts";

export interface LegacyStorage {
  getItem(key: string): string | null;
}
export class WorkspaceRepository {
  private factory: IDBFactory;
  private databaseName: string;
  private queue: Promise<void> = Promise.resolve();
  private revision = 0;
  constructor(factory: IDBFactory, databaseName = "fieldsense-records") {
    this.factory = factory;
    this.databaseName = databaseName;
  }
  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = this.factory.open(this.databaseName, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("workspace"))
          req.result.createObjectStore("workspace");
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () =>
        reject(req.error || new Error("Could not open device storage."));
      req.onblocked = () =>
        reject(
          new Error(
            "Storage upgrade blocked. Close other FieldSense tabs and retry.",
          ),
        );
    });
  }
  private async read(): Promise<unknown> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("workspace", "readonly");
      const req = tx.objectStore("workspace").get("current");
      let value: unknown;
      req.onsuccess = () => {
        value = req.result;
      };
      tx.oncomplete = () => {
        db.close();
        resolve(value);
      };
      tx.onabort = () => {
        db.close();
        reject(tx.error || new Error("Could not read device records."));
      };
      tx.onerror = () => {
        /* onabort handles transaction failure */
      };
    });
  }
  async load(
    legacy: LegacyStorage,
    seed: () => Workspace,
  ): Promise<{ workspace: Workspace; migrated: boolean }> {
    const stored = await this.read();
    this.revision =
      stored && typeof stored === "object" && "_revision" in stored
        ? Number(stored._revision)
        : 0;
    if (!Number.isInteger(this.revision) || this.revision < 0)
      throw new Error("Invalid stored revision. Original records were kept.");
    if (stored !== undefined) {
      const workspace = parseWorkspace(stored);
      const migrated =
        typeof stored === "object" &&
        stored !== null &&
        "schemaVersion" in stored &&
        stored.schemaVersion !== 4;
      if (migrated) await this.save(workspace);
      return { workspace, migrated };
    }
    const original = legacy.getItem(LEGACY_KEY);
    // Parse before writing: malformed legacy data must never be overwritten with a demo.
    const workspace =
      original === null ? seed() : parseWorkspace(JSON.parse(original), true);
    await this.save(workspace);
    // Leave the old key untouched as a recovery copy after successful migration.
    return { workspace, migrated: original !== null };
  }
  save(workspace: Workspace): Promise<void> {
    let snapshot: Workspace;
    try {
      snapshot = structuredClone(parseWorkspace(workspace));
    } catch (e) {
      return Promise.reject(e);
    }
    const write = async () => {
      const db = await this.open();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction("workspace", "readwrite");
        const store = tx.objectStore("workspace");
        const request = store.get("current");
        let conflict = false;
        const nextRevision = this.revision + 1;
        request.onsuccess = () => {
          const actual = request.result
            ? Number(request.result._revision || 0)
            : 0;
          if (actual !== this.revision) {
            conflict = true;
            tx.abort();
            return;
          }
          store.put({ ...snapshot, _revision: nextRevision }, "current");
        };
        tx.oncomplete = () => {
          this.revision = nextRevision;
          db.close();
          resolve();
        };
        tx.onabort = () => {
          db.close();
          reject(
            conflict
              ? new Error(
                  "Another tab changed this workspace. Download a backup of your changes, then reload before continuing.",
                )
              : tx.error ||
                  new Error(
                    "Could not save records. Export a backup before leaving.",
                  ),
          );
        };
        tx.onerror = () => {
          /* onabort reports the failure */
        };
      });
    };
    const pending = this.queue.then(write, write);
    this.queue = pending.catch(() => {});
    return pending;
  }
}
