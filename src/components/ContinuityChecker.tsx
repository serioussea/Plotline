import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  HelpCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Wand2,
} from 'lucide-react';
import type { ContinuityCheckResult, StoryProject } from '../types/plotline';
import { requestContinuityCheck, requestContinuityRevision } from '../utils/aiClient';

interface ContinuityCheckerProps {
  project: StoryProject;
}

export const ContinuityChecker: React.FC<ContinuityCheckerProps> = ({ project }) => {
  const [sceneTitle, setSceneTitle] = useState('');
  const [sceneText, setSceneText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContinuityCheckResult | null>(null);

  const [revLoading, setRevLoading] = useState(false);
  const [revError, setRevError] = useState<string | null>(null);
  const [suggestedRevision, setSuggestedRevision] = useState<{
    suggestedRevision: string;
    revisionNotes: string;
  } | null>(null);
  const [copiedRev, setCopiedRev] = useState(false);

  const canonCount = project.canonEntries.filter((e) => e.status === 'canon').length;

  const handleCheck = async () => {
    if (sceneText.trim().length < 15) {
      setError('Please write or paste at least a short paragraph to check for continuity.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuggestedRevision(null);
    setRevError(null);

    try {
      const checkResult = await requestContinuityCheck({
        project,
        sceneTitle: sceneTitle.trim() || 'Draft Scene',
        sceneText,
      });
      setResult(checkResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to complete continuity analysis.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!result) return;
    setRevLoading(true);
    setRevError(null);
    try {
      const findingsSummary = [
        ...result.potentialContradictions.map((f) => `CONTRADICTION: ${f.summary} — ${f.explanation}`),
        ...result.needsClarification.map((f) => `CLARIFY: ${f.summary} — ${f.explanation}`),
      ].join('\n');

      const rev = await requestContinuityRevision({
        project,
        sceneText,
        findingsSummary,
      });
      setSuggestedRevision({
        suggestedRevision: rev.suggestedRevision,
        revisionNotes: rev.revisionNotes,
      });
    } catch (err) {
      setRevError(
        err instanceof Error ? err.message : 'Unable to generate a suggested revision.'
      );
    } finally {
      setRevLoading(false);
    }
  };

  const handleCopyRevision = async () => {
    if (!suggestedRevision) return;
    await navigator.clipboard.writeText(suggestedRevision.suggestedRevision);
    setCopiedRev(true);
    window.setTimeout(() => setCopiedRev(false), 1800);
  };

  return (
    <div className="space-y-6">
      <div className="stationery-card rounded-2xl p-5 bg-gradient-to-r from-[#FFF5F9] to-[#F3E8F7]/45 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#B93778] mt-0.5 shrink-0" />
          <div>
            <h2 className="font-editorial text-xl font-bold text-[#4F3048]">
              Scene Continuity Checker
            </h2>
            <p className="text-xs text-[#6E626C] mt-0.5">
              Compares your draft against{' '}
              <span className="font-semibold text-[#4F3048]">
                {canonCount} approved canon {canonCount === 1 ? 'entry' : 'entries'}
              </span>{' '}
              and {project.characters.length} character profiles. Your original draft is never
              modified automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Scene Editor */}
      <div className="stationery-card rounded-2xl p-6 space-y-4">
        <div>
          <label htmlFor="continuity-scene-title" className="block text-sm font-medium text-[#4F3048]">
            Scene Title (optional)
          </label>
          <input
            id="continuity-scene-title"
            type="text"
            value={sceneTitle}
            onChange={(e) => setSceneTitle(e.target.value)}
            placeholder="e.g., Chapter 3 — Confrontation in Vault 4"
            className="mt-1.5 w-full max-w-lg px-3.5 py-2 rounded-xl bg-[#FFFAFC] border border-[#BA86A6]/35 text-sm text-[#4F3048] focus:border-[#D94F93] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="continuity-scene-text" className="block text-sm font-medium text-[#4F3048]">
            Scene Draft
          </label>
          <textarea
            id="continuity-scene-text"
            rows={8}
            value={sceneText}
            onChange={(e) => setSceneText(e.target.value)}
            placeholder="Paste or write a scene here to verify character details, timeline logic, worldbuilding rules, and secret knowledge against your established canon..."
            className="mt-1.5 w-full px-4 py-3 rounded-2xl bg-[#FFFAFC] border border-[#BA86A6]/35 text-[#4F3048] placeholder:text-[#BA86A6] focus:border-[#D94F93] focus:bg-white focus:outline-none writing-prose"
          />
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#FCE4EC] border border-[#D94F93]/40 flex items-center justify-between gap-3 text-sm text-[#B93778]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={handleCheck}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white text-[#B93778] text-xs font-semibold border border-[#EFA7C5]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#766B74]">
            Experimental and rejected notes are excluded from continuity verification.
          </span>
          <button
            type="button"
            disabled={loading}
            onClick={handleCheck}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C53B7D] hover:bg-[#B93778] disabled:opacity-60 text-white text-sm font-medium transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking Continuity...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Check Continuity Against Canon</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Output */}
      {result && (
        <div className="space-y-5">
          <div className="rounded-2xl p-4 bg-[#F3E8F7]/65 border border-[#BA86A6]/30 text-xs text-[#4F3048] leading-relaxed">
            <span className="font-semibold">Important limitation:</span> {result.disclaimer}{' '}
            <span className="text-[#6E626C]">({result.contextNotice})</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Potential Contradiction */}
            <div className="stationery-card rounded-2xl p-5 bg-[#FFF5F9]/75 border-[#D94F93]/35 space-y-3">
              <div className="flex items-center gap-2 text-[#B93778]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <h3 className="font-editorial text-lg font-bold">
                  Potential Contradiction ({result.potentialContradictions.length})
                </h3>
              </div>
              {result.potentialContradictions.length === 0 ? (
                <p className="text-xs text-[#766B74]">No potential contradictions flagged.</p>
              ) : (
                <div className="space-y-3">
                  {result.potentialContradictions.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#EFA7C5]/50 space-y-1.5">
                      <div className="text-sm font-semibold text-[#4F3048]">{item.summary}</div>
                      {item.excerpt && (
                        <blockquote className="text-xs italic text-[#766B74] bg-[#FFF5F9] px-2.5 py-1.5 rounded-lg">
                          "{item.excerpt}"
                        </blockquote>
                      )}
                      <p className="text-xs text-[#6E626C] leading-relaxed">{item.explanation}</p>
                      {item.relatedCanonTitle && (
                        <div className="text-[11px] font-medium text-[#B93778]">
                          Canon reference: {item.relatedCanonTitle}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Needs Clarification */}
            <div className="stationery-card rounded-2xl p-5 bg-[#F3E8F7]/55 border-[#BA86A6]/35 space-y-3">
              <div className="flex items-center gap-2 text-[#4F3048]">
                <HelpCircle className="w-4 h-4 shrink-0 text-[#8C5B7C]" />
                <h3 className="font-editorial text-lg font-bold">
                  Needs Clarification ({result.needsClarification.length})
                </h3>
              </div>
              {result.needsClarification.length === 0 ? (
                <p className="text-xs text-[#766B74]">No ambiguous continuity points flagged.</p>
              ) : (
                <div className="space-y-3">
                  {result.needsClarification.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white border border-[#BA86A6]/35 space-y-1.5">
                      <div className="text-sm font-semibold text-[#4F3048]">{item.summary}</div>
                      {item.excerpt && (
                        <blockquote className="text-xs italic text-[#766B74] bg-[#F3E8F7]/50 px-2.5 py-1.5 rounded-lg">
                          "{item.excerpt}"
                        </blockquote>
                      )}
                      <p className="text-xs text-[#6E626C] leading-relaxed">{item.explanation}</p>
                      {item.relatedCanonTitle && (
                        <div className="text-[11px] font-medium text-[#7A4F71]">
                          Related canon: {item.relatedCanonTitle}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* No Conflict Detected */}
            <div className="stationery-card rounded-2xl p-5 bg-white space-y-3">
              <div className="flex items-center gap-2 text-[#4F3048]">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#8C5B7C]" />
                <h3 className="font-editorial text-lg font-bold">
                  No Conflict Detected ({result.noConflictDetected.length})
                </h3>
              </div>
              {result.noConflictDetected.length === 0 ? (
                <p className="text-xs text-[#766B74]">
                  No specific canon matches recorded for this scene yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {result.noConflictDetected.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#FFFAFC] border border-[#EFA7C5]/35 space-y-1.5">
                      <div className="text-sm font-semibold text-[#4F3048]">{item.summary}</div>
                      <p className="text-xs text-[#6E626C] leading-relaxed">{item.explanation}</p>
                      {item.relatedCanonTitle && (
                        <div className="text-[11px] font-medium text-[#6E626C]">
                          Checked against: {item.relatedCanonTitle}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Optional Suggested Revision */}
          {(result.potentialContradictions.length > 0 || result.needsClarification.length > 0) && (
            <div className="stationery-card rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#4F3048]">
                    Optional Suggested Revision
                  </h3>
                  <p className="text-xs text-[#6E626C]">
                    Displayed separately below—your original scene draft above remains untouched.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={revLoading}
                  onClick={handleRequestRevision}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FCE4EC] hover:bg-[#F8C8DC] text-[#4F3048] text-xs font-semibold transition-colors"
                >
                  {revLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Drafting Suggestion...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5 text-[#B93778]" />
                      <span>Request Suggested Revision</span>
                    </>
                  )}
                </button>
              </div>

              {revError && (
                <div className="p-3 rounded-xl bg-[#FCE4EC] text-xs text-[#B93778]">{revError}</div>
              )}

              {suggestedRevision && (
                <div className="rounded-2xl p-4 bg-[#FFFAFC] border border-[#EFA7C5]/45 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#B93778]">
                      AI-Suggested Revision (Adopt selectively)
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyRevision}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#EFA7C5]/60 text-xs text-[#4F3048] hover:bg-[#FCE4EC]/60"
                    >
                      {copiedRev ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRev ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="writing-prose text-[#4F3048] whitespace-pre-wrap">
                    {suggestedRevision.suggestedRevision}
                  </p>
                  {suggestedRevision.revisionNotes && (
                    <div className="pt-2 border-t border-[#EFA7C5]/25 text-xs text-[#6E626C]">
                      <span className="font-semibold text-[#4F3048]">Notes:</span>{' '}
                      {suggestedRevision.revisionNotes}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
