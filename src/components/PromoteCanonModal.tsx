import React, { useEffect, useState } from 'react';
import { CheckCircle2, FlaskConical, Plus, ShieldCheck, SkipForward, X } from 'lucide-react';
import { createId } from '../store/usePlotlineStore';
import type {
  CanonCategory,
  NarrativeBranch,
  ProposedCanonChange,
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

export interface PromotionDecisionItem {
  change: ProposedCanonChange;
  action: 'approved-canon' | 'saved-experimental' | 'skipped';
  editedTitle: string;
  editedDescription: string;
  editedCategory: CanonCategory;
}

interface PromoteCanonModalProps {
  open: boolean;
  branch: NarrativeBranch | null;
  onConfirm: (decisions: PromotionDecisionItem[]) => void;
  onClose: () => void;
}

export const PromoteCanonModal: React.FC<PromoteCanonModalProps> = ({
  open,
  branch,
  onConfirm,
  onClose,
}) => {
  const [items, setItems] = useState<PromotionDecisionItem[]>([]);

  useEffect(() => {
    if (!open || !branch) return;
    const baseItems: PromotionDecisionItem[] =
      branch.proposedCanonChanges.length > 0
        ? branch.proposedCanonChanges.map((ch) => ({
            change: ch,
            action:
              ch.decision === 'approved-canon' ||
              ch.decision === 'saved-experimental' ||
              ch.decision === 'skipped'
                ? ch.decision
                : 'skipped',
            editedTitle: ch.title,
            editedDescription: ch.description,
            editedCategory: ch.category,
          }))
        : [
            {
              change: {
                id: createId('pcc'),
                title: branch.title,
                description: branch.premise,
                category: 'Plot',
                linkedCharacterNames: branch.charactersAffected,
                rationale: 'Core premise from this What-If branch.',
              },
              action: 'skipped',
              editedTitle: branch.title,
              editedDescription: branch.premise,
              editedCategory: 'Plot',
            },
          ];
    setItems(baseItems);
  }, [open, branch]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !branch) return null;

  const updateItem = (idx: number, patch: Partial<PromotionDecisionItem>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const addCustomProposal = () => {
    setItems((prev) => [
      ...prev,
      {
        change: {
          id: createId('pcc'),
          title: '',
          description: '',
          category: 'Plot',
          linkedCharacterNames: branch.charactersAffected,
          rationale: 'Writer-authored canon addition from branch exploration.',
        },
        action: 'approved-canon',
        editedTitle: '',
        editedDescription: '',
        editedCategory: 'Plot',
      },
    ]);
  };

  const approvedCount = items.filter((i) => i.action === 'approved-canon').length;
  const experimentalCount = items.filter((i) => i.action === 'saved-experimental').length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4F3048]/35 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promote-canon-title"
    >
      <div className="w-full max-w-3xl rounded-3xl bg-[#FFFAFC] border border-[#EFA7C5]/50 shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-5 bg-gradient-to-r from-[#FCE4EC]/80 to-[#F3E8F7]/70 border-b border-[#EFA7C5]/35 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#B93778] flex items-center justify-center shrink-0 border border-[#EFA7C5]/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="promote-canon-title"
                className="font-editorial text-2xl font-bold text-[#4F3048]"
              >
                Review Proposed Canon Changes
              </h2>
              <p className="text-xs text-[#6E626C] mt-0.5">
                From branch "<span className="font-semibold">{branch.title}</span>". Approve, edit,
                quarantine as experimental, or skip each idea individually.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#6E626C] hover:text-[#4F3048] hover:bg-white/80"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[68vh] overflow-y-auto">
          {items.map((item, idx) => (
            <div
              key={item.change.id}
              className={`rounded-2xl p-4 border transition-colors space-y-3 ${
                item.action === 'approved-canon'
                  ? 'bg-white border-[#D94F93]/60'
                  : item.action === 'saved-experimental'
                    ? 'bg-[#F3E8F7]/55 border-[#BA86A6]/50'
                    : 'bg-[#FFFAFC] border-[#BA86A6]/25 opacity-85'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#766B74]">
                  Proposal {idx + 1}
                  {item.change.linkedCharacterNames.length > 0
                    ? ` · ${item.change.linkedCharacterNames.join(', ')}`
                    : ''}
                </span>

                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#FCE4EC]/60">
                  <button
                    type="button"
                    onClick={() => updateItem(idx, { action: 'approved-canon' })}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      item.action === 'approved-canon'
                        ? 'bg-[#C53B7D] text-white'
                        : 'text-[#4F3048] hover:bg-white/70'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve to Canon</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateItem(idx, { action: 'saved-experimental' })}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      item.action === 'saved-experimental'
                        ? 'bg-[#4F3048] text-white'
                        : 'text-[#4F3048] hover:bg-white/70'
                    }`}
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Keep Experimental</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateItem(idx, { action: 'skipped' })}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      item.action === 'skipped'
                        ? 'bg-white text-[#4F3048] shadow-xs'
                        : 'text-[#6E626C] hover:bg-white/70'
                    }`}
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>Skip</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#4F3048]">Canon Title</label>
                  <input
                    type="text"
                    value={item.editedTitle}
                    onChange={(e) => updateItem(idx, { editedTitle: e.target.value })}
                    placeholder="Concise fact title..."
                    className="mt-1 w-full px-3 py-1.5 rounded-xl bg-[#FFFAFC] border border-[#BA86A6]/35 text-sm text-[#4F3048]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4F3048]">Category</label>
                  <select
                    value={item.editedCategory}
                    onChange={(e) =>
                      updateItem(idx, { editedCategory: e.target.value as CanonCategory })
                    }
                    className="mt-1 w-full px-3 py-1.5 rounded-xl bg-[#FFFAFC] border border-[#BA86A6]/35 text-sm text-[#4F3048]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4F3048]">Description</label>
                <textarea
                  rows={2}
                  value={item.editedDescription}
                  onChange={(e) => updateItem(idx, { editedDescription: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-xl bg-[#FFFAFC] border border-[#BA86A6]/35 text-sm text-[#4F3048]"
                />
              </div>

              {item.change.rationale && (
                <p className="text-xs text-[#766B74]">
                  <span className="font-medium text-[#4F3048]">Rationale:</span>{' '}
                  {item.change.rationale}
                </p>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addCustomProposal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FCE4EC] hover:bg-[#F8C8DC] text-[#4F3048] text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Canon Entry from This Branch</span>
          </button>
        </div>

        <div className="px-6 py-4 bg-[#FFF5F9] border-t border-[#EFA7C5]/35 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#6E626C] font-mono-tabular">
            {approvedCount} to Canon · {experimentalCount} to Experimental
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#4F3048] bg-white border border-[#BA86A6]/35 hover:bg-[#FCE4EC]/50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(items)}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#C53B7D] hover:bg-[#B93778]"
            >
              Apply Selected Decisions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
