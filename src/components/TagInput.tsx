"use client";

import { useState, useTransition } from "react";

export default function TagInput({
  label,
  initialTags,
  onSave,
}: {
  label: string;
  initialTags: string[];
  onSave: (tags: string[]) => Promise<void>;
}) {
  const [tags, setTags] = useState(initialTags);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  function commit(next: string[]) {
    setTags(next);
    startTransition(() => onSave(next));
  }

  function addTag() {
    const value = draft.trim();
    if (!value || tags.includes(value)) {
      setDraft("");
      return;
    }
    commit([...tags, value]);
    setDraft("");
  }

  function removeTag(tag: string) {
    commit(tags.filter((t) => t !== tag));
  }

  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </label>
      <div
        className="flex min-h-[42px] flex-wrap items-center gap-2 rounded border px-3 py-2"
        style={{ borderColor: "var(--color-line)" }}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
            style={{ borderColor: "var(--color-line)", background: "var(--color-panel-raised)" }}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-[var(--color-muted)] hover:text-[var(--color-red-bright)]"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={tags.length === 0 ? "Type and press Enter to add" : "Add another…"}
          className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-[#555]"
        />
      </div>
      <div className="mt-0.5 text-right text-[0.6rem] text-[var(--color-muted)]">
        {isPending ? "Saving…" : "Saved"}
      </div>
    </div>
  );
}
