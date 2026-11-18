import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Columns,
  GitBranch,
  History,
  LayoutGrid,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { createId } from '../store/usePlotlineStore';
import type {
  ContinuityConflictFlag,
  NarrativeBranch,
  StoryProject,
  WhatIfChangeType,
  WhatIfSession,
} from '../types/plotline';
import { requestBranchExpansion, requestWhatIfBranches } from '../utils/aiClient';
import { BranchCard } from './BranchCard';
import { BranchComparison } from './BranchComparison';
import { PromoteCanonModal, type PromotionDecisionItem } from './PromoteCanonModal';

const CHANGE_TYPES: WhatIfChangeType[] = [
  'Character motivation',
  'Relationship',
  'Plot twist',
  'Worldbuilding',
  'Ending',
  'Conflict',
  'Other',
];

interface WhatIfEngineProps {
  project: StoryProject;
  onAddSession: (session: WhatIfSession) => void;
  onUpdateBranch: (
    sessionId: string,
    branchId: string,
    updater: (branch: NarrativeBranch) => NarrativeBranch
  ) => void;
  onSetBranchStatus: (
    sessionId: string,
    branchId: string,
    status: NarrativeBranch['status']
  ) => void;
  onResolveConflict: (
    sessionId: string,
    branchId: string,
    conflictId: string,
    resolution: ContinuityConflictFlag['resolution']
  ) => void;
  onPromoteChanges: (
    sessionId: string,
    branchId: string,
    decisions: PromotionDecisionItem[]
  ) => void;
  onJumpToCanon: () => void;
}

export const WhatIfEngine: React.FC<WhatIfEngineProps> = ({
  project,
  onAddSession,
  onUpdateBranch,
  onSetBranchStatus,
  onResolveConflict,
  onPromoteChanges,
  onJumpToCanon,
}) => {
  const [question, setQuestion] = useState('');
  const [changeType, setChangeType] = useState<WhatIfChangeType>('Plot twist');
  const [includedExpIds, setIncludedExpIds] = useState<string[]>([]);
  const [showExpPicker, setShowExpPicker] = useState(false);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    project.whatIfSessions[0]?.id ?? null
  );
  const [viewMode, setViewMode] = useState<'cards' | 'compare'>('cards');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<{
    sessionId: string;
    branch: NarrativeBranch;
  } | null>(null);
  const [promoNotice, setPromoNotice] = useState<string | null>(null);

  const activeSession = useMemo(() => {
    return (
      project.whatIfSessions.find((s) => s.id === activeSessionId) ??
      project.whatIfSessions[0] ??
      null
    );
  }, [project.whatIfSessions, activeSessionId]);

  const approvedCanonCount = project.canonEntries.filter((e) => e.status === 'canon').length;

  const experimentalOptions = useMemo(() => {
    const savedBranches = project.whatIfSessions
      .flatMap((s) => s.branches)
      .filter((b) => b.status === 'experimental')
      .map((b) => ({ id: b.id, label: `Branch: ${b.title}` }));

    const expNotes = project.canonEntries
      .filter((e) => e.status === 'experimental')
      .map((e) => ({ id: e.id, label: `Note: ${e.title}` }));

    return [...savedBranches, ...expNotes];
  }, [project.whatIfSessions, project.canonEntries]);

  const toggleExpId = (id: string) => {
    setIncludedExpIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!question.trim()) {
      setError('Enter a hypothetical "What if..." question to explore three branches.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await requestWhatIfBranches({
        project,
        question: question.trim(),
        changeType,
        includedExperimentalIds: includedExpIds,
      });

      const now = new Date().toISOString();
      const newSession: WhatIfSession = {
        id: createId('whatif'),
        question: question.trim(),
        changeType,
        includedExperimentalIds: includedExpIds,
        contextNotice: result.contextNotice,
        branches: result.branches,
        isSample: false,
        createdAt: now,
        updatedAt: now,
      };

      onAddSession(newSession);
      setActiveSessionId(newSession.id);
      setViewMode('cards');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate What-If branches. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Prompt Workspace */}
      <section className="rounded-3xl bg-gradient-to-br from-[#FCE4EC]/85 via-[#FFF5F9] to-[#F3E8F7]/85 border border-[#EFA7C5]/55 p-6 sm:p-8 shadow-sm">
        <div className="max-w-4xl space-y-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#B93778]">
              <GitBranch className="w-4 h-4" />
              <span>Plotline What-If Engine</span>
            </div>
            <h1 className="mt-1.5 font-editorial text-3xl sm:text-4xl font-bold text-[#4F3048] headline-balance">
              What if everything changed?
            </h1>
            <p className="mt-1.5 font-literary italic text-lg sm:text-xl text-[#6E626C]">
              Explore new possibilities without rewriting what you've already created.
            </p>
          </div>

          <div className="rounded-2xl bg-white/95 border border-[#EFA7C5]/60 p-4 shadow-xs space-y-4">
            <div>
              <label htmlFor="whatif-question" className="sr-only">
                What-If Prompt
              </label>
              <textarea
                id="whatif-question"
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder='e.g., "What if the protagonist discovers the villain’s identity halfway through the story?"'
                className="w-full resize-y bg-transparent text-[#4F3048] placeholder:text-[#BA86A6] focus:outline-none writing-prose"
              />
            </div>

            <div className="pt-3 border-t border-[#EFA7C5]/25 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label htmlFor="whatif-change-type" className="text-xs font-medium text-[#6E626C]">
                    Focus:
                  </label>
                  <select
                    id="whatif-change-type"
                    value={changeType}
                    onChange={(e) => setChangeType(e.target.value as WhatIfChangeType)}
                    className="px-3 py-1.5 rounded-xl bg-[#FFFAFC] border border-[#BA86A6]/35 text-xs sm:text-sm text-[#4F3048]"
                  >
                    {CHANGE_TYPES.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>

                {experimentalOptions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowExpPicker((v) => !v)}
                    className="px-3 py-1.5 rounded-xl bg-[#F3E8F7]/80 hover:bg-[#F3E8F7] text-xs font-medium text-[#4F3048]"
                  >
                    {includedExpIds.length > 0
                      ? `Attached Experiments (${includedExpIds.length})`
                      : 'Attach Experimental Ideas (optional)'}
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleGenerate}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#ED75A7] hover:bg-[#D94F93] disabled:opacity-60 text-white text-sm font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Three Directions...</span>
                  </>
                ) : (
                  <>
                    <GitBranch className="w-4 h-4" />
                    <span>Explore Possibilities</span>
                  </>
                )}
              </button>
            </div>

            {showExpPicker && experimentalOptions.length > 0 && (
              <div className="pt-3 border-t border-[#EFA7C5]/25 space-y-2">
                <p className="text-xs text-[#6E626C]">
                  Experimental branches and notes are excluded from AI context unless you select
                  them here:
                </p>
                <div className="flex flex-wrap gap-2">
                  {experimentalOptions.map((opt) => {
                    const active = includedExpIds.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleExpId(opt.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          active
                            ? 'bg-[#4F3048] text-white'
                            : 'bg-[#F3E8F7]/70 text-[#4F3048] hover:bg-[#F3E8F7]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E626C]">
            <ShieldCheck className="w-4 h-4 text-[#B93778] shrink-0" />
            <span>
              Grounded in {approvedCanonCount} approved canon{' '}
              {approvedCanonCount === 1 ? 'entry' : 'entries'} and {project.characters.length}{' '}
              character profiles. Your existing story stays untouched.
            </span>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl p-4 bg-[#FCE4EC] border border-[#D94F93]/45 flex flex-wrap items-center justify-between gap-3 text-sm text-[#B93778]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#EFA7C5] text-xs font-semibold text-[#B93778]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {promoNotice && (
        <div className="rounded-2xl p-4 bg-[#FCE4EC]/75 border border-[#D94F93]/35 flex items-center justify-between gap-3 text-sm text-[#4F3048]">
          <span>{promoNotice}</span>
          <button
            type="button"
            onClick={() => setPromoNotice(null)}
            className="text-xs font-semibold text-[#B93778] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Session History Selector + View Mode */}
      {project.whatIfSessions.length > 0 && (
        <section className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <History className="w-4 h-4 text-[#8C5B7C] shrink-0" />
              <span className="text-xs font-semibold text-[#766B74] whitespace-nowrap">
                Explorations:
              </span>
              {project.whatIfSessions.map((sess) => {
                const isActive = activeSession?.id === sess.id;
                return (
                  <button
                    key={sess.id}
                    type="button"
                    onClick={() => setActiveSessionId(sess.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors max-w-[260px] truncate shrink-0 ${
                      isActive
                        ? 'bg-[#C53B7D] text-white'
                        : 'bg-white border border-[#BA86A6]/35 text-[#4F3048] hover:bg-[#FCE4EC]/60'
                    }`}
                    title={sess.question}
                  >
                    {sess.isSample ? 'Sample: ' : ''}
                    {sess.question}
                  </button>
                );
              })}
            </div>

            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#FCE4EC]/70 border border-[#EFA7C5]/50 self-start">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-[#B93778] shadow-xs'
                    : 'text-[#4F3048] hover:text-[#B93778]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Branch Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compare')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'compare'
                    ? 'bg-white text-[#B93778] shadow-xs'
                    : 'text-[#4F3048] hover:text-[#B93778]'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Compare Branches</span>
              </button>
            </div>
          </div>

          {activeSession && (
            <div className="space-y-5">
              <div className="stationery-card rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-medium text-[#B93778]">
                    {activeSession.changeType}
                    {activeSession.isSample ? ' · Sample Demonstration Output' : ''}
                  </div>
                  <h2 className="font-editorial text-xl font-bold text-[#4F3048] mt-0.5">
                    "{activeSession.question}"
                  </h2>
                </div>
                <div className="text-xs text-[#766B74]">{activeSession.contextNotice}</div>
              </div>

              {viewMode === 'compare' ? (
                <BranchComparison branches={activeSession.branches} />
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
                  {activeSession.branches.map((branch, index) => (
                    <BranchCard
                      key={branch.id}
                      branch={branch}
                      variantIndex={index}
                      onSaveAsExperiment={() =>
                        onSetBranchStatus(activeSession.id, branch.id, 'experimental')
                      }
                      onReject={() =>
                        onSetBranchStatus(activeSession.id, branch.id, 'rejected')
                      }
                      onOpenPromoteModal={() =>
                        setPromoteTarget({ sessionId: activeSession.id, branch })
                      }
                      onRenameBranch={(newTitle) =>
                        onUpdateBranch(activeSession.id, branch.id, (b) => ({
                          ...b,
                          title: newTitle,
                        }))
                      }
                      onExploreFurther={async (followUpPrompt) => {
                        const res = await requestBranchExpansion({
                          project,
                          branch,
                          followUpPrompt,
                        });
                        onUpdateBranch(activeSession.id, branch.id, (b) => ({
                          ...b,
                          expansions: [
                            ...b.expansions,
                            {
                              id: createId('exp'),
                              prompt: followUpPrompt,
                              response: res.expansion,
                              createdAt: new Date().toISOString(),
                            },
                          ],
                        }));
                      }}
                      onResolveConflict={(conflictId, resolution) =>
                        onResolveConflict(
                          activeSession.id,
                          branch.id,
                          conflictId,
                          resolution
                        )
                      }
                      onJumpToCanon={onJumpToCanon}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {project.whatIfSessions.length === 0 && !loading && (
        <div className="stationery-card rounded-3xl p-10 text-center max-w-xl mx-auto">
          <h2 className="font-editorial text-2xl font-bold text-[#4F3048]">
            No hypothetical branches yet
          </h2>
          <p className="mt-2 text-sm text-[#6E626C]">
            Ask a bold question above to test three divergent story paths against your established
            canon—without risking a single confirmed fact.
          </p>
        </div>
      )}

      <PromoteCanonModal
        open={Boolean(promoteTarget)}
        branch={promoteTarget?.branch ?? null}
        onConfirm={(decisions) => {
          if (promoteTarget) {
            onPromoteChanges(promoteTarget.sessionId, promoteTarget.branch.id, decisions);
            const approved = decisions.filter((d) => d.action === 'approved-canon').length;
            const experimental = decisions.filter(
              (d) => d.action === 'saved-experimental'
            ).length;
            setPromoNotice(
              `Saved ${approved} ${approved === 1 ? 'entry' : 'entries'} to Canon and ${experimental} ${experimental === 1 ? 'note' : 'notes'} to Experimental in Canon Keeper.`
            );
          }
          setPromoteTarget(null);
        }}
        onClose={() => setPromoteTarget(null)}
      />
    </div>
  );
};
