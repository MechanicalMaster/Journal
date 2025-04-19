Below is a detailed execution plan to implement support for exporting all journal data (text and images) to a JSON file for backup and importing/updating data from a JSON backup.

---

### Execution Plan for Implementing IndexedDB with Dexie.js

#### Objective
Implement export/import functionality to back up all data to a JSON file and restore/update from a JSON backup, maintaining compatibility with your app’s existing functionality (e.g., `/new-entry`, `/preview`, `/extract`, `/entries` routes).
---

#### 1. Implement Export to JSON Backup
**Goal**: Allow users to export all journal entries (text and images) to a JSON file for backup.

- **Action**:
  - Add an export function to `journal-service.ts` (e.g., `exportEntriesToJson`).
    - Query all entries for the current `userId` from the `journalEntries` store.
    - Structure the data as a JSON object, including all fields (`id`, `userId`, `title`, `text`, `images`, `qualifiers`, `createdAt`, `updatedAt`).
    - Convert dates to ISO strings for JSON compatibility.
    - Return the JSON string.
  - Create a UI component (e.g., in `settings/page.tsx` or `entries/page.tsx`):
    - Add an “Export Journal” button.
    - On click, call `exportEntriesToJson`, create a Blob with the JSON data, and trigger a file download (e.g., `journal_backup_YYYYMMDD.json`).
  - Ensure images (data URLs) are included in the JSON, as they are already stored as strings.
  - Handle edge cases (e.g., no entries, large datasets causing memory issues).
- **Rationale**:
  - Exporting to JSON provides a portable, human-readable backup format.
  - Including images as data URLs ensures all data is captured in a single file, though file size may be large.
  - A UI button makes the feature accessible to users without technical knowledge.
- **Deliverable**:
  - `journal-service.ts` with `exportEntriesToJson` function.
  - Updated UI component with export button and download logic.


#### 2. Implement Import/Update from JSON Backup
**Goal**: Allow users to import a JSON backup to restore or update journal entries in IndexedDB.

- **Action**:
  - Add an import function to `journal-service.ts` (e.g., `importEntriesFromJson`).
    - Accept a JSON string or file input.
    - Parse the JSON to validate structure (matches `JournalEntry` interface).
    - For each entry:
      - Check if an entry with the same `id` exists in IndexedDB.
      - If exists, update the entry (merge fields, preserving `updatedAt` as current date).
      - If not, create a new entry.
    - Ensure `userId` matches the authenticated user to prevent unauthorized data import.
    - Handle invalid JSON, mismatched schemas, or corrupted data URLs gracefully.
  - Create a UI component (e.g., in `settings/page.tsx`):
    - Add an “Import Journal” button with a file input (`<input type="file" accept=".json">`).
    - On file selection, read the file content (using `FileReader`), pass to `importEntriesFromJson`, and display a success/error toast.
  - Test edge cases (e.g., partial imports, large files, duplicate IDs).
- **Rationale**:
  - Import/update functionality allows users to restore data or migrate between devices/browsers.
  - Updating existing entries prevents duplicates while preserving data integrity.
  - UI integration ensures usability for non-technical users.
- **Deliverable**:
  - `journal-service.ts` with `importEntriesFromJson` function.
  - Updated UI component with import button and file input logic.

---

### Deliverables
1. Export/import functionality in `journal-service.ts` and UI (e.g., `settings/page.tsx`).
