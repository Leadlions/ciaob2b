"use client";

import { setViewAs, exitViewAs } from "@/app/panel/view-as-actions";

export function AdminPreviewBar({
  clients,
  current,
}: {
  clients: { id: string; name: string }[];
  current: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
      <span className="font-medium text-amber-800">
        👁️ Podgląd jako klient
      </span>

      <form action={setViewAs} className="flex-1">
        <select
          name="client_id"
          defaultValue={current}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="w-full max-w-xs rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm outline-none"
        >
          <option value="">— wybierz firmę do podglądu —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </form>

      <form action={exitViewAs}>
        <button
          type="submit"
          className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
        >
          ← Wróć do panelu admina
        </button>
      </form>
    </div>
  );
}
