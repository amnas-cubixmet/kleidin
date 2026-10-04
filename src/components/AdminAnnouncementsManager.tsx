"use client";

import { useEffect, useMemo, useState } from "react";
import type { Announcement } from "@/types/announcement";

type Draft = {
  id: string;
  text: string;
  linkLabel: string;
  linkHref: string;
  startsAt: string;
  endsAt: string;
  enabled: boolean;
  sortOrder: string;
};

function emptyDraft(): Draft {
  return {
    id: "",
    text: "",
    linkLabel: "",
    linkHref: "",
    startsAt: "",
    endsAt: "",
    enabled: true,
    sortOrder: "100",
  };
}

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fromAnnouncement(item: Announcement): Draft {
  return {
    id: item.id,
    text: item.text,
    linkLabel: item.linkLabel,
    linkHref: item.linkHref,
    startsAt: toLocalInput(item.startsAt),
    endsAt: toLocalInput(item.endsAt),
    enabled: item.enabled,
    sortOrder: String(item.sortOrder),
  };
}

function isoOrNull(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export function AdminAnnouncementsManager() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      setLoading(true);
      setMessage("");
      const response = await fetch("/api/admin/announcements", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load announcements.");
      setItems((data.announcements ?? []) as Announcement[]);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load announcements.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const activeCount = useMemo(() => {
    const now = Date.now();
    return items.filter((item) => {
      if (!item.enabled) return false;
      if (item.startsAt && new Date(item.startsAt).getTime() > now) return false;
      if (item.endsAt && new Date(item.endsAt).getTime() < now) return false;
      return true;
    }).length;
  }, [items]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.text.trim()) {
      setMessage("Announcement text is required.");
      return;
    }

    if (draft.linkLabel.trim() && !draft.linkHref.trim()) {
      setMessage("Add a link URL when link label is set.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const body = {
        text: draft.text.trim(),
        linkLabel: draft.linkLabel.trim(),
        linkHref: draft.linkHref.trim(),
        startsAt: isoOrNull(draft.startsAt),
        endsAt: isoOrNull(draft.endsAt),
        enabled: draft.enabled,
        sortOrder: Number(draft.sortOrder) || 100,
      };

      const endpoint = draft.id
        ? "/api/admin/announcements/" + draft.id
        : "/api/admin/announcements";

      const response = await fetch(endpoint, {
        method: draft.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not save announcement.");
      }

      setDraft(emptyDraft());
      await load();
      setMessage(draft.id ? "Announcement updated." : "Announcement created.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save announcement.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggle(item: Announcement) {
    try {
      setBusyId(item.id);
      const response = await fetch("/api/admin/announcements/" + item.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: item.text,
          linkLabel: item.linkLabel,
          linkHref: item.linkHref,
          startsAt: item.startsAt,
          endsAt: item.endsAt,
          enabled: !item.enabled,
          sortOrder: item.sortOrder,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update announcement.");

      const updated = data.announcement as Announcement;
      setItems((current) =>
        current.map((row) => (row.id === updated.id ? updated : row)),
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not update announcement.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function remove(item: Announcement) {
    if (!window.confirm("Delete this announcement permanently?")) return;

    try {
      setBusyId(item.id);
      const response = await fetch("/api/admin/announcements/" + item.id, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete announcement.");

      setItems((current) => current.filter((row) => row.id !== item.id));
      if (draft.id === item.id) setDraft(emptyDraft());
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not delete announcement.",
      );
    } finally {
      setBusyId("");
    }
  }

  const field =
    "h-11 w-full rounded-[12px] border border-[#d7dbe0] bg-white px-3 text-[11px] outline-none focus:border-[#111111] focus:ring-2 focus:ring-black/10";
  const label =
    "mb-1.5 block text-[9px] font-bold uppercase tracking-[.08em] text-[#707782]";

  return (
    <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
      <form
        onSubmit={save}
        className="rounded-[20px] border border-[#d9dde3] bg-white p-4 shadow-[0_8px_28px_rgba(16,24,40,.04)] sm:p-5"
      >
        <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
          Storefront announcement
        </p>
        <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-.045em]">
          {draft.id ? "Edit announcement" : "Create announcement"}
        </h2>
        <p className="mt-1.5 text-[10px] leading-5 text-[#626a75]">
          Create multiple bars, schedule them, and control what appears on the storefront.
        </p>

        <div className="mt-5 grid gap-3">
          <label>
            <span className={label}>Announcement text</span>
            <textarea
              value={draft.text}
              onChange={(event) => update("text", event.target.value)}
              className="min-h-[92px] w-full resize-none rounded-[12px] border border-[#d7dbe0] bg-white p-3 text-[11px] outline-none focus:border-[#111111] focus:ring-2 focus:ring-black/10"
              placeholder="Free shipping on prepaid orders above ₹1,999"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className={label}>Link label</span>
              <input
                value={draft.linkLabel}
                onChange={(event) => update("linkLabel", event.target.value)}
                className={field}
                placeholder="Shop the collection"
              />
            </label>

            <label>
              <span className={label}>Order</span>
              <input
                type="number"
                value={draft.sortOrder}
                onChange={(event) => update("sortOrder", event.target.value)}
                className={field}
              />
            </label>
          </div>

          <label>
            <span className={label}>Link URL</span>
            <input
              value={draft.linkHref}
              onChange={(event) => update("linkHref", event.target.value)}
              className={field}
              placeholder="/products or https://..."
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className={label}>Start time</span>
              <input
                type="datetime-local"
                value={draft.startsAt}
                onChange={(event) => update("startsAt", event.target.value)}
                className={field}
              />
            </label>

            <label>
              <span className={label}>End time</span>
              <input
                type="datetime-local"
                value={draft.endsAt}
                onChange={(event) => update("endsAt", event.target.value)}
                className={field}
              />
            </label>
          </div>

          <label className="flex min-h-[48px] items-center gap-3 rounded-[12px] border border-[#d7dbe0] px-3">
            <input
              type="checkbox"
              checked={draft.enabled}
              onChange={(event) => update("enabled", event.target.checked)}
              className="h-4 w-4 accent-black"
            />
            <span className="text-[10px] font-semibold">Enabled on storefront</span>
          </label>
        </div>

        {message ? (
          <p className="mt-3 text-[10px] font-semibold text-[#7c4747]">{message}</p>
        ) : null}

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="min-h-[46px] flex-1 rounded-full bg-[#111111] px-5 text-[10px] font-bold text-white disabled:opacity-50"
          >
            {saving
              ? "Saving…"
              : draft.id
                ? "Save changes"
                : "Create announcement"}
          </button>

          {draft.id ? (
            <button
              type="button"
              onClick={() => setDraft(emptyDraft())}
              className="min-h-[46px] rounded-full border border-[#d5d9df] bg-white px-5 text-[10px] font-bold"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <section className="rounded-[20px] border border-[#d9dde3] bg-white p-4 shadow-[0_8px_28px_rgba(16,24,40,.04)] sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#111111]">
              Announcement list
            </p>
            <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-.045em]">
              {items.length} created
            </h2>
          </div>
          <span className="rounded-full bg-[#111111] px-3 py-2 text-[9px] font-bold text-white">
            {activeCount} active now
          </span>
        </div>

        {loading ? (
          <div className="mt-5 grid min-h-[240px] place-items-center rounded-[16px] bg-[#f5f5f5] text-[11px] font-semibold text-[#68717b]">
            Loading announcements…
          </div>
        ) : items.length ? (
          <div className="mt-5 grid gap-3">
            {items.map((item) => {
              const busy = busyId === item.id;
              const now = Date.now();
              const scheduled =
                item.startsAt && new Date(item.startsAt).getTime() > now;
              const expired = item.endsAt && new Date(item.endsAt).getTime() < now;

              return (
                <article
                  key={item.id}
                  className="rounded-[18px] border border-[#dfe2e6] bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            "rounded-full px-2.5 py-1.5 text-[8px] font-bold " +
                            (!item.enabled
                              ? "bg-[#eef0f2] text-[#69717b]"
                              : expired
                                ? "bg-[#fff0f0] text-[#a33d3d]"
                                : scheduled
                                  ? "bg-[#fff7e8] text-[#8a6100]"
                                  : "bg-[#111111] text-white")
                          }
                        >
                          {!item.enabled
                            ? "Disabled"
                            : expired
                              ? "Expired"
                              : scheduled
                                ? "Scheduled"
                                : "Active"}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-[.08em] text-[#8a919b]">
                          Order {item.sortOrder}
                        </span>
                      </div>

                      <strong className="mt-3 block text-[13px] font-semibold leading-5 text-[#17191d]">
                        {item.text}
                      </strong>

                      {item.linkLabel ? (
                        <p className="mt-1.5 text-[9px] text-[#6e7680]">
                          {item.linkLabel} → {item.linkHref}
                        </p>
                      ) : null}

                      <p className="mt-2 text-[8px] leading-4 text-[#8a919b]">
                        {item.startsAt
                          ? "Starts " + new Date(item.startsAt).toLocaleString("en-IN")
                          : "Starts immediately"}
                        {" · "}
                        {item.endsAt
                          ? "Ends " + new Date(item.endsAt).toLocaleString("en-IN")
                          : "No end date"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[#eceef1] pt-4">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setDraft(fromAnnouncement(item))}
                      className="min-h-[44px] rounded-full bg-[#111111] px-5 text-[10px] font-bold text-white disabled:opacity-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void toggle(item)}
                      className="min-h-[44px] rounded-full border border-[#d5d9df] bg-white px-5 text-[10px] font-bold disabled:opacity-50"
                    >
                      {item.enabled ? "Disable" : "Enable"}
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void remove(item)}
                      className="min-h-[44px] rounded-full border border-[#efcaca] bg-white px-5 text-[10px] font-bold text-[#a33d3d] disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 grid min-h-[240px] place-items-center rounded-[16px] bg-[#f5f5f5] px-5 text-center">
            <div>
              <strong className="text-[13px] font-semibold">No announcements yet</strong>
              <p className="mt-2 text-[10px] leading-5 text-[#68717b]">
                Create the first storefront announcement using the form.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
