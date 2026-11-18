import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Edit2,
  FlaskConical,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import type {
  BranchStatus,
  ContinuityConflictFlag,
  NarrativeBranch,
} from '../types/plotline';

interface BranchCardProps {
  branch: NarrativeBranch;
  variantIndex: number;
  onSaveAsExperiment: () => void;
  onReject: () => void;
  onOpenPromoteModal: () => void;
  onRenameBranch: (newTitle: string) => void;
  onExploreFurther: (followUpPrompt: string) => Promise<void>;
  onResolveConflict: (
    conflictId: string,
    resolution: ContinuityConflictFlag['resolution']
  ) => void;
  onJumpToCanon: () => void;
}

const SURFACE_VARIANTS = [
  // Blush
  'bg-gradient-to-b from-[#FCE4EC]/65 via-[#FFFAFC] to-white border-[#EFA7C5]/60',
  // Mauve
  'bg-gradient-to-b from-[#F5EAF1]/80 via-[#FFFAFC] to-white border-[#BA86A6]/50',
  // Lavender
  'bg-gradient-to-b from-[#F3E8F7]/85 via-[#FFFAFC] to-white border-[#C8AED6]/55',
];

const STATUS_DISPLAY: Record<BranchStatus, { label: string; tone: string }> = {
  candidate: {
    label: 'Unassigned Direction',
    tone: 'bg-white/80 text-[#6E626C] border border-[#BA86A6]/35',
  },
  experimental: {
    label: 'Saved Experiment',
    tone: 'bg-[#F3E8F7] text-[#4F3048] border border-[#BA86A6]/40',
  },
  rejected: {
    label: 'Rejected',
    tone: 'bg-[#F5EDF2] text-[#766B74] border border-[#BA86A6]/30',
  },
  promoted_partial: {
    label: 'Ideas Promoted to Canon',
    tone: 'bg-[#FCE4EC] text-[#B93778] border border-[#EFA7C5]/70',
  },
};

export const BranchCard: React.FC<BranchCardProps> = ({
  branch,
  variantIndex,
  onSaveAsExperiment,
  onReject,
  onOpenPromoteModal,
  onRenameBranch,
  onExploreFurther,
  onResolveConflict,
  onJumpToCanon,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(branch.title);
  const [showExploreInput, setShowExploreInput] = useState(false);
  const [followUp, setFollowUp] = useState('');
  const [exploring, setExploring] = useState(false);
  const [exploreError, setExploreError] = useState<string | null>(null);

  const surfaceClass = SURFACE_VARIANTS[variantIndex % SURFACE_VARIANTS.length];
  const statusInfo = STATUS_DISPLAY[branch.status];

  const handleSaveTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== branch.title) {
      onRenameBranch(trimmed);
    } else {
      setTitleDraft(branch.title);
    }
    setEditingTitle(false);
  };

  const handleExploreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUp.trim()) return;
    setExploring(true);
    setExploreError(null);
    try {
      await onExploreFurther(followUp.trim());
      setFollowUp('');
      setShowExploreInput(false);
    } catch (err) {
      setExploreError(
        err instanceof Error ? err.message : 'Could not explore branch further.'
      );
    } finally {
      setExploring(false);
    }
  };

  return (
    <article
      className={`rounded-3xl border p-6 shadow-sm flex flex-col justify-between gap-5 ${surfaceClass} ${
        branch.status === 'rejected' ? 'opacity-75' : ''
      }`}
    >
      <div className="space-y-4">
        {/* Header: Approach & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#B93778]">{branch.approachLabel}</span>
          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${statusInfo.tone}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Editable Branch Title */}
        <div>
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setTitleDraft(branch.title);
                    setEditingTitle(false);
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#D94F93] text-base font-bold text-[#4F3048]"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-2 rounded-lg bg-[#C53B7D] text-white"
                aria-label="Save branch title"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2 group">
              <h3 className="font-editorial text-2xl font-bold text-[#4F3048] leading-snug">
                {branch.title}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setTitleDraft(branch.title);
                  setEditingTitle(true);
                }}
                className="p-1.5 rounded-lg text-[#8C5B7C] hover:text-[#4F3048] hover:bg-white/70 shrink-0"
                title="Rename branch"
                aria-label={`Rename ${branch.title}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Premise */}
        <p className="writing-prose text-sm text-[#4F3048] leading-relaxed bg-white/75 rounded-2xl p-3.5 border border-[#EFA7C5]/30">
          {branch.premise}
        </p>

        {/* Major Plot Consequences */}
        {branch.plotConsequences.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[#4F3048] mb-1.5">
              Major Plot Consequences
            </h4>
            <ul className="space-y-1.5 text-sm text-[#6E626C] list-disc pl-4">
              {branch.plotConsequences.map((c, idx) => (
                <li key={idx} className="leading-relaxed">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Characters Affected */}
        {branch.charactersAffected.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[#4F3048] mb-1">Characters Affected</h4>
            <p className="text-sm text-[#6E626C]">{branch.charactersAffected.join(' · ')}</p>
          </div>
        )}

        {/* Relationship / Motivation Changes */}
        {branch.relationshipOrMotivationChanges && (
          <div>
            <h4 className="text-xs font-semibold text-[#4F3048] mb-1">
              Relationship & Motivation Shifts
            </h4>
            <p className="text-sm text-[#6E626C] leading-relaxed">
              {branch.relationshipOrMotivationChanges}
            </p>
          </div>
        )}

        {/* New Conflicts */}
        {branch.newConflicts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[#4F3048] mb-1.5">New Conflicts Introduced</h4>
            <ul className="space-y-1 text-sm text-[#6E626C] list-disc pl-4">
              {branch.newConflicts.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Emotional & Thematic Impact */}
        {branch.emotionalThematicImpact && (
          <div>
            <h4 className="text-xs font-semibold text-[#4F3048] mb-1">
              Emotional & Thematic Impact
            </h4>
            <p className="text-sm text-[#6E626C] italic font-literary text-base leading-relaxed">
              {branch.emotionalThematicImpact}
            </p>
          </div>
        )}

        {/* Continuity Conflicts & Canon Protection Controls */}
        <div className="rounded-2xl p-3.5 bg-white/85 border border-[#EFA7C5]/45 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4F3048]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#D94F93]" />
            <span>
              Possible Continuity Conflicts ({branch.continuityConflicts.length})
            </span>
          </div>

          {branch.continuityConflicts.length === 0 ? (
            <p className="text-xs text-[#766B74]">
              No direct conflicts detected with currently approved canon entries.
            </p>
          ) : (
            <div className="space-y-2.5">
              {branch.continuityConflicts.map((cf) => (
                <div
                  key={cf.id}
                  className="p-2.5 rounded-xl bg-[#FFF5F9] border border-[#EFA7C5]/45 space-y-2"
                >
                  <p className="text-xs text-[#4F3048] leading-relaxed">{cf.description}</p>
                  {cf.relatedCanonTitle && (
                    <div className="text-[11px] font-medium text-[#B93778]">
                      Established Canon: {cf.relatedCanonTitle}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(
                      [
                        { id: 'preserve-canon', label: 'Preserve Canon' },
                        { id: 'modify-canon', label: 'Edit Canon Later' },
                        { id: 'keep-experimental', label: 'Keep Experimental' },
                        { id: 'rejected', label: 'Reject Suggestion' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onResolveConflict(cf.id, opt.id);
                          if (opt.id === 'modify-canon') {
                            onJumpToCanon();
                          }
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                          cf.resolution === opt.id
                            ? 'bg-[#4F3048] text-white'
                            : 'bg-white border border-[#BA86A6]/35 text-[#4F3048] hover:bg-[#FCE4EC]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Open Questions */}
        {branch.openQuestions.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[#4F3048] mb-1.5">
              Open Questions for the Writer
            </h4>
            <ul className="space-y-1 text-xs text-[#6E626C] list-disc pl-4">
              {branch.openQuestions.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Saved Expansions */}
        {branch.expansions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#EFA7C5]/35">
            <h4 className="text-xs font-semibold text-[#B93778]">Deeper Explorations</h4>
            {branch.expansions.map((exp) => (
              <div
                key={exp.id}
                className="rounded-xl p-3 bg-white border border-[#EFA7C5]/40 space-y-1.5"
              >
                <div className="text-xs font-semibold text-[#4F3048]">Q: {exp.prompt}</div>
                <div className="text-xs text-[#6E626C] whitespace-pre-wrap leading-relaxed">
                  {exp.response}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="pt-4 border-t border-[#EFA7C5]/35 space-y-3">
        {showExploreInput && (
          <form onSubmit={handleExploreSubmit} className="space-y-2">
            <textarea
              rows={2}
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              placeholder="Ask a follow-up (e.g., How does Magistrate Sterling react in Act III?)..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#D94F93]/45 text-xs text-[#4F3048] focus:outline-none"
            />
            {exploreError && <p className="text-xs text-[#B93778]">{exploreError}</p>}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExploreInput(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-[#6E626C] hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={exploring}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C53B7D] hover:bg-[#B93778] text-white text-xs font-medium disabled:opacity-60"
              >
                {exploring ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Exploring...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Run Follow-Up</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSaveAsExperiment}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              branch.status === 'experimental'
                ? 'bg-[#4F3048] text-white'
                : 'bg-white border border-[#BA86A6]/45 text-[#4F3048] hover:bg-[#F3E8F7]'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>{branch.status === 'experimental' ? 'Experiment Saved' : 'Save as Experiment'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExploreInput((v) => !v)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#BA86A6]/45 text-[#4F3048] hover:bg-[#FCE4EC]/60 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D94F93]" />
            <span>Explore Further</span>
          </button>

          <button
            type="button"
            onClick={onOpenPromoteModal}
            className="col-span-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#C53B7D] hover:bg-[#B93778] text-white text-xs font-semibold transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Promote Selected Ideas to Canon</span>
          </button>

          <button
            type="button"
            onClick={onReject}
            className={`col-span-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              branch.status === 'rejected'
                ? 'bg-[#F5EDF2] text-[#4F3048]'
                : 'text-[#766B74] hover:text-[#B93778] hover:bg-[#FCE4EC]/50'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{branch.status === 'rejected' ? 'Rejected (Saved in History)' : 'Reject'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
