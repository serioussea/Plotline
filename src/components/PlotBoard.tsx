import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Columns3,
  Edit3,
  GripVertical,
  ListOrdered,
  MapPin,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { createId } from '../store/usePlotlineStore';
import type {
  PlotCard,
  PlotCardStatus,
  PlotCardType,
  StoryProject,
} from '../types/plotline';
import { ConfirmDialog } from './ui/ConfirmDialog';

const CARD_TYPES: PlotCardType[] = [
  'Chapter',
  'Scene',
  'Major Event',
  'Turning Point',
  'Character Arc',
];

const CARD_STATUSES: PlotCardStatus[] = [
  'Idea',
  'Planned',
  'Drafting',
  'Revised',
  'Complete',
];

const STATUS_SURFACE: Record<PlotCardStatus, string> = {
  Idea: 'bg-[#F3E8F7]/65 border-[#BA86A6]/35',
  Planned: 'bg-[#FFF5F9] border-[#EFA7C5]/50',
  Drafting: 'bg-[#FCE4EC]/65 border-[#ED75A7]/50',
  Revised: 'bg-white border-[#D94F93]/40',
  Complete: 'bg-white border-[#4F3048]/30',
};

interface PlotBoardProps {
  project: StoryProject;
  onUpsertCard: (card: PlotCard) => void;
  onDeleteCard: (cardId: string) => void;
  onReorderCards: (orderedIds: string[]) => void;
}

export const PlotBoard: React.FC<PlotBoardProps> = ({
  project,
  onUpsertCard,
  onDeleteCard,
  onReorderCards,
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PlotCard | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PlotCard | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Modal fields
  const [title, setTitle] = useState('');
  const [cardType, setCardType] = useState<PlotCardType>('Scene');
  const [summary, setSummary] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<PlotCardStatus>('Idea');
  const [relatedCharacterIds, setRelatedCharacterIds] = useState<string[]>([]);
  const [authorsNotes, setAuthorsNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const orderedCards = useMemo(
    () => [...project.plotCards].sort((a, b) => a.order - b.order),
    [project.plotCards]
  );

  const openEditor = (card: PlotCard | null, defaultStatus: PlotCardStatus = 'Idea') => {
    setEditingCard(card);
    if (card) {
      setTitle(card.title);
      setCardType(card.cardType);
      setSummary(card.summary);
      setLocation(card.location);
      setStatus(card.status);
      setRelatedCharacterIds(card.relatedCharacterIds);
      setAuthorsNotes(card.authorsNotes);
    } else {
      setTitle('');
      setCardType('Scene');
      setSummary('');
      setLocation('');
      setStatus(defaultStatus);
      setRelatedCharacterIds([]);
      setAuthorsNotes('');
    }
    setFormError(null);
    setEditorOpen(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter a title for this plot card.');
      return;
    }
    const now = new Date().toISOString();
    const maxOrder = orderedCards.reduce((m, c) => Math.max(m, c.order), 0);
    onUpsertCard({
      id: editingCard?.id || createId('plot'),
      title: title.trim(),
      cardType,
      summary: summary.trim(),
      order: editingCard?.order ?? maxOrder + 1,
      relatedCharacterIds,
      location: location.trim(),
      status,
      authorsNotes: authorsNotes.trim(),
      createdAt: editingCard?.createdAt || now,
      updatedAt: now,
    });
    setEditorOpen(false);
  };

  const moveCard = (cardId: string, direction: -1 | 1) => {
    const idx = orderedCards.findIndex((c) => c.id === cardId);
    if (idx < 0) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= orderedCards.length) return;
    const next = [...orderedCards];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    onReorderCards(next.map((c) => c.id));
  };

  const handleListDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const fromIdx = orderedCards.findIndex((c) => c.id === draggedId);
    const toIdx = orderedCards.findIndex((c) => c.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = [...orderedCards];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onReorderCards(next.map((c) => c.id));
    setDraggedId(null);
  };

  const toggleCharacter = (id: string) => {
    setRelatedCharacterIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-[#4F3048]">Plot Board</h1>
          <p className="text-sm text-[#6E626C] mt-1">
            Organize chapters, scenes, and turning points for{' '}
            <span className="font-medium">{project.title}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#FCE4EC]/70 border border-[#EFA7C5]/50">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'board'
                  ? 'bg-white text-[#B93778] shadow-xs'
                  : 'text-[#4F3048] hover:text-[#B93778]'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-[#B93778] shadow-xs'
                  : 'text-[#4F3048] hover:text-[#B93778]'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Ordered List</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => openEditor(null, 'Idea')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C53B7D] hover:bg-[#B93778] text-white text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Plot Card</span>
          </button>
        </div>
      </div>

      {orderedCards.length === 0 ? (
        <div className="stationery-card rounded-3xl p-10 text-center max-w-xl mx-auto">
          <h2 className="font-editorial text-2xl font-bold text-[#4F3048]">
            Your plot board is empty
          </h2>
          <p className="mt-2 text-sm text-[#6E626C]">
            Map out chapters, key scenes, turning points, and character arcs in your own order.
          </p>
          <button
            type="button"
            onClick={() => openEditor(null, 'Planned')}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C53B7D] hover:bg-[#B93778] text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Scene Card</span>
          </button>
        </div>
      ) : viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
          {CARD_STATUSES.map((colStatus) => {
            const colCards = orderedCards.filter((c) => c.status === colStatus);
            return (
              <div
                key={colStatus}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (!draggedId) return;
                  const card = orderedCards.find((c) => c.id === draggedId);
                  if (card && card.status !== colStatus) {
                    onUpsertCard({ ...card, status: colStatus });
                  }
                  setDraggedId(null);
                }}
                className="rounded-2xl bg-[#FFF5F9]/70 border border-[#EFA7C5]/40 p-3.5 space-y-3 min-h-[260px]"
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-editorial text-base font-bold text-[#4F3048]">
                      {colStatus}
                    </h2>
                    <span className="text-xs text-[#766B74] font-mono-tabular">
                      ({colCards.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditor(null, colStatus)}
                    className="p-1 rounded-lg text-[#8C5B7C] hover:text-[#B93778] hover:bg-white"
                    title={`Add ${colStatus} card`}
                    aria-label={`Add card to ${colStatus}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {colCards.map((card) => {
                    const linkedNames = card.relatedCharacterIds
                      .map((id) => project.characters.find((c) => c.id === id)?.fullName)
                      .filter((n): n is string => Boolean(n));

                    return (
                      <article
                        key={card.id}
                        draggable
                        onDragStart={() => setDraggedId(card.id)}
                        onDragEnd={() => setDraggedId(null)}
                        className={`rounded-xl border p-3.5 shadow-xs space-y-2.5 cursor-grab active:cursor-grabbing ${STATUS_SURFACE[card.status]}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-[11px] font-medium text-[#B93778] font-mono-tabular">
                            #{card.order} · {card.cardType}
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditor(card)}
                              className="p-1 rounded-md text-[#766B74] hover:text-[#4F3048] hover:bg-white"
                              aria-label={`Edit ${card.title}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDelete(card)}
                              className="p-1 rounded-md text-[#766B74] hover:text-[#B93778] hover:bg-white"
                              aria-label={`Delete ${card.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h3 className="font-editorial text-base font-bold text-[#4F3048] leading-snug">
                          {card.title}
                        </h3>

                        {card.summary && (
                          <p className="text-xs text-[#6E626C] leading-relaxed line-clamp-3">
                            {card.summary}
                          </p>
                        )}

                        {card.location && (
                          <div className="flex items-center gap-1 text-[11px] text-[#766B74]">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{card.location}</span>
                          </div>
                        )}

                        {linkedNames.length > 0 && (
                          <div className="text-[11px] text-[#8C5B7C] truncate">
                            {linkedNames.join(' · ')}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {orderedCards.map((card, index) => {
            const linkedNames = card.relatedCharacterIds
              .map((id) => project.characters.find((c) => c.id === id)?.fullName)
              .filter((n): n is string => Boolean(n));

            return (
              <article
                key={card.id}
                draggable
                onDragStart={() => setDraggedId(card.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleListDrop(card.id)}
                onDragEnd={() => setDraggedId(null)}
                className="stationery-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="pt-1 text-[#BA86A6] cursor-grab shrink-0" aria-hidden="true">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#FCE4EC] text-[#B93778] font-mono-tabular text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#766B74]">
                      <span className="font-semibold text-[#B93778]">{card.cardType}</span>
                      <span>·</span>
                      <span className="font-medium text-[#4F3048]">{card.status}</span>
                      {card.location && (
                        <>
                          <span>·</span>
                          <span>{card.location}</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-editorial text-lg font-bold text-[#4F3048] mt-0.5">
                      {card.title}
                    </h3>
                    {card.summary && (
                      <p className="text-sm text-[#6E626C] mt-1 leading-relaxed">{card.summary}</p>
                    )}
                    {linkedNames.length > 0 && (
                      <p className="text-xs text-[#8C5B7C] mt-1.5">
                        Cast: {linkedNames.join(' · ')}
                      </p>
                    )}
                    {card.authorsNotes && (
                      <p className="text-xs italic text-[#766B74] mt-1.5">
                        Note: {card.authorsNotes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveCard(card.id, -1)}
                    className="p-2 rounded-lg border border-[#EFA7C5]/40 text-[#4F3048] hover:bg-[#FCE4EC]/70 disabled:opacity-35"
                    title="Move earlier"
                    aria-label={`Move ${card.title} earlier`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === orderedCards.length - 1}
                    onClick={() => moveCard(card.id, 1)}
                    className="p-2 rounded-lg border border-[#EFA7C5]/40 text-[#4F3048] hover:bg-[#FCE4EC]/70 disabled:opacity-35"
                    title="Move later"
                    aria-label={`Move ${card.title} later`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditor(card)}
                    className="p-2 rounded-lg text-[#6E626C] hover:text-[#4F3048] hover:bg-[#FCE4EC]/70"
                    aria-label={`Edit ${card.title}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(card)}
                    className="p-2 rounded-lg text-[#6E626C] hover:text-[#B93778] hover:bg-[#FCE4EC]/70"
                    aria-label={`Delete ${card.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Plot Card Editor Modal */}
      {editorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#4F3048]/35 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="plot-card-modal-title"
        >
          <div className="w-full max-w-xl rounded-3xl bg-[#FFFAFC] border border-[#EFA7C5]/50 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-5 bg-gradient-to-r from-[#FCE4EC]/75 to-[#F3E8F7]/65 border-b border-[#EFA7C5]/35 flex items-center justify-between">
              <h2
                id="plot-card-modal-title"
                className="font-editorial text-2xl font-bold text-[#4F3048]"
              >
                {editingCard ? 'Edit Plot Card' : 'New Plot Card'}
              </h2>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="p-2 rounded-xl text-[#6E626C] hover:text-[#4F3048]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-[#FCE4EC] text-sm text-[#B93778]">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#4F3048]">Card Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Chapter 3: The Furnace Discovery"
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl bg-white border border-[#BA86A6]/35 text-sm text-[#4F3048]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4F3048]">Type</label>
                  <select
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value as PlotCardType)}
                    className="mt-1.5 w-full px-3.5 py-2 rounded-xl bg-white border border-[#BA86A6]/35 text-sm text-[#4F3048]"
                  >
                    {CARD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#4F3048]">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PlotCardStatus)}
                    className="mt-1.5 w-full px-3.5 py-2 rounded-xl bg-white border border-[#BA86A6]/35 text-sm text-[#4F3048]"
                  >
                    {CARD_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4F3048]">Summary</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="What happens and how does the status quo shift?"
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl bg-white border border-[#BA86A6]/35 text-sm text-[#4F3048] writing-prose"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4F3048]">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., South Terrace Glasshouse"
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl bg-white border border-[#BA86A6]/35 text-sm text-[#4F3048]"
                />
              </div>

              {project.characters.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-[#4F3048] mb-2">Related Characters</div>
                  <div className="flex flex-wrap gap-2">
                    {project.characters.map((ch) => {
                      const selected = relatedCharacterIds.includes(ch.id);
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => toggleCharacter(ch.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
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

              <div>
                <label className="block text-sm font-medium text-[#4F3048]">Author's Notes</label>
                <textarea
                  rows={2}
                  value={authorsNotes}
                  onChange={(e) => setAuthorsNotes(e.target.value)}
                  placeholder="Pacing cues, sensory details, or continuity reminders..."
                  className="mt-1.5 w-full px-3.5 py-2 rounded-xl bg-white border border-[#BA86A6]/35 text-sm text-[#4F3048]"
                />
              </div>

              <div className="pt-4 border-t border-[#EFA7C5]/30 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[#4F3048] bg-white border border-[#BA86A6]/35"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#C53B7D] hover:bg-[#B93778]"
                >
                  {editingCard ? 'Save Card' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete plot card?"
        message={`Remove "${pendingDelete?.title}" from your plot board?`}
        confirmLabel="Delete Card"
        destructive
        onConfirm={() => {
          if (pendingDelete) onDeleteCard(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};
