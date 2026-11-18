import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createId } from '../store/usePlotlineStore';
import type {
  CanonCategory,
  CanonEntry,
  CanonStatus,
  CharacterProfile,
} from '../types/plotline';

const CATEGORIES: CanonCategory[] = [
  'Character',
  'Relationship',
  'Worldbuilding',
  'Timeline',
  'Location',
  'Plot',
  'Other',
];

const STATUSES: Array<{ value: CanonStatus; label: string; hint: string }> = [
  {
    value: 'canon',
    label: 'Canon (Established)',
    hint: 'Included in AI story context as authoritative fact.',
  },
  {
    value: 'experimental',
    label: 'Experimental (Under Consideration)',
    hint: 'Kept separate from canon until you approve it.',
  },
  {
    value: 'rejected',
    label: 'Rejected (Not Pursued)',
    hint: 'Saved for record only; excluded from AI story context.',
  },
  {
    value: 'archived',
    label: 'Archived (Reference)',
    hint: 'Retired material kept for historical reference.',
  },
];

interface CanonEntryEditorProps {
  open: boolean;
  initialEntry: CanonEntry | null;
  characters: CharacterProfile[];
  defaultStatus?: CanonStatus;
  onSave: (entry: CanonEntry) => void;
  onClose: () => void;
}

export const CanonEntryEditor: React.FC<CanonEntryEditorProps> = ({
  open,
  initialEntry,
  characters,
  defaultStatus = 'canon',
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CanonCategory>('Worldbuilding');
  const [status, setStatus] = useState<CanonStatus>(defaultStatus);
  const [linkedCharacterIds, setLinkedCharacterIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initialEntry) {
      setTitle(initialEntry.title);
      setDescription(initialEntry.description);
      setCategory(initialEntry.category);
      setStatus(initialEntry.status);
      setLinkedCharacterIds(initialEntry.linkedCharacterIds);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Worldbuilding');
      setStatus(defaultStatus);
      setLinkedCharacterIds([]);
    }
    setError(null);
  }, [open, initialEntry, defaultStatus]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const toggleCharacter = (id: string) => {
    setLinkedCharacterIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please enter both a title and a description for this entry.');
      return;
    }

    const now = new Date().toISOString();
    onSave({
      id: initialEntry?.id || createId('canon'),
      title: title.trim(),
      description: description.trim(),
      category,
      status,
      linkedCharacterIds,
      source: initialEntry?.source || 'manual',
      sourceNote: initialEntry?.sourceNote,
      createdAt: initialEntry?.createdAt || now,
      updatedAt: now,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4F3048]/35 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="canon-editor-title"
    >
      <div className="w-full max-w-xl rounded-3xl bg-[#FFFAFC] border border-[#EFA7C5]/50 shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-5 bg-gradient-to-r from-[#FCE4EC]/75 to-[#F3E8F7]/65 border-b border-[#EFA7C5]/35 flex items-center justify-between">
          <h2 id="canon-editor-title" className="font-editorial text-2xl font-bold text-[#4F3048]">
            {initialEntry ? 'Edit Story Entry' : 'New Canon Entry'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#6E626C] hover:text-[#4F3048] hover:bg-white/80"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-[#FCE4EC] border border-[#D94F93]/40 text-sm text-[#B93778]">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="canon-title-input" className="block text-sm font-medium text-[#4F3048]">
              Entry Title
            </label>
            <input
              id="canon-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Law of Crystalline Ripening"
              className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#BA86A6]/35 text-sm text-[#4F3048] focus:border-[#D94F93] focus:outline-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="canon-category-select"
                className="block text-sm font-medium text-[#4F3048]"
              >
                Category
              </label>
              <select
                id="canon-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as CanonCategory)}
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#BA86A6]/35 text-sm text-[#4F3048]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="canon-status-select"
                className="block text-sm font-medium text-[#4F3048]"
              >
                Status
              </label>
              <select
                id="canon-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as CanonStatus)}
                className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#BA86A6]/35 text-sm text-[#4F3048]"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-[#766B74]">
            {STATUSES.find((s) => s.value === status)?.hint}
          </p>

          <div>
            <label
              htmlFor="canon-description-input"
              className="block text-sm font-medium text-[#4F3048]"
            >
              Established Fact / Description
            </label>
            <textarea
              id="canon-description-input"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the exact rule, history, relationship fact, or revelation..."
              className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#BA86A6]/35 text-sm text-[#4F3048] focus:border-[#D94F93] focus:outline-none writing-prose"
            />
          </div>

          {characters.length > 0 && (
            <div>
              <div className="text-sm font-medium text-[#4F3048] mb-2">
                Linked Characters (optional)
              </div>
              <div className="flex flex-wrap gap-2">
                {characters.map((ch) => {
                  const selected = linkedCharacterIds.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => toggleCharacter(ch.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selected
                          ? 'bg-[#C53B7D] text-white'
                          : 'bg-white border border-[#BA86A6]/35 text-[#4F3048] hover:bg-[#FCE4EC]/70'
                      }`}
                    >
                      {ch.fullName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#EFA7C5]/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#4F3048] bg-white border border-[#BA86A6]/35 hover:bg-[#FCE4EC]/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#C53B7D] hover:bg-[#B93778]"
            >
              {initialEntry ? 'Save Entry' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
