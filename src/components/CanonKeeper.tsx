import React, { useMemo, useState } from 'react';
import {
  Archive,
  CheckCircle2,
  Edit3,
  FlaskConical,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';
import type {
  CanonCategory,
  CanonEntry,
  CanonStatus,
  StoryProject,
} from '../types/plotline';
import { CanonEntryEditor } from './CanonEntryEditor';
import { ContinuityChecker } from './ContinuityChecker';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface CanonKeeperProps {
  project: StoryProject;
  onUpsertEntry: (entry: CanonEntry) => void;
  onChangeStatus: (entryId: string, status: CanonStatus) => void;
  onDeleteEntry: (entryId: string) => void;
}

const STATUS_META: Record<
  CanonStatus,
  {
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    cardTone: string;
    badgeTone: string;
  }
> = {
  canon: {
    label: 'Canon · Established Fact',
    shortLabel: 'Canon',
    icon: CheckCircle2,
    cardTone: 'bg-white border-[#EFA7C5]/55',
    badgeTone: 'bg-[#FCE4EC] text-[#B93778]',
  },
  experimental: {
    label: 'Experimental · Under Consideration',
    shortLabel: 'Experimental',
    icon: FlaskConical,
    cardTone: 'bg-[#F3E8F7]/45 border-[#BA86A6]/45',
    badgeTone: 'bg-[#F3E8F7] text-[#4F3048]',
  },
  rejected: {
    label: 'Rejected · Not Pursued',
    shortLabel: 'Rejected',
    icon: XCircle,
    cardTone: 'bg-[#FFF5F9]/60 border-[#BA86A6]/30',
    badgeTone: 'bg-[#F5EDF2] text-[#766B74]',
  },
  archived: {
    label: 'Archived · Reference',
    shortLabel: 'Archived',
    icon: Archive,
    cardTone: 'bg-[#FFFAFC] border-[#BA86A6]/30',
    badgeTone: 'bg-[#F5EDF2] text-[#6E626C]',
  },
};

const CATEGORIES: Array<'All' | CanonCategory> = [
  'All',
  'Character',
  'Relationship',
  'Worldbuilding',
  'Timeline',
  'Location',
  'Plot',
  'Other',
];

export const CanonKeeper: React.FC<CanonKeeperProps> = ({
  project,
  onUpsertEntry,
  onChangeStatus,
  onDeleteEntry,
}) => {
  const [workspaceTab, setWorkspaceTab] = useState<'keeper' | 'continuity'>('keeper');
  const [statusFilter, setStatusFilter] = useState<'all' | CanonStatus>('canon');
  const [categoryFilter, setCategoryFilter] = useState<'All' | CanonCategory>('All');
  const [query, setQuery] = useState('');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CanonEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CanonEntry | null>(null);

  const counts = useMemo(() => {
    const map: Record<'all' | CanonStatus, number> = {
      all: project.canonEntries.length,
      canon: 0,
      experimental: 0,
      rejected: 0,
      archived: 0,
    };
    project.canonEntries.forEach((e) => {
      map[e.status] += 1;
    });
    return map;
  }, [project.canonEntries]);

  const filteredEntries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return project.canonEntries.filter((e) => {
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      const matchCategory = categoryFilter === 'All' || e.category === categoryFilter;
      const matchQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q);
      return matchStatus && matchCategory && matchQuery;
    });
  }, [project.canonEntries, statusFilter, categoryFilter, query]);

  return (
    <div className="space-y-6">
      {/* Header & Workspace Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-[#4F3048]">Story Canon</h1>
          <p className="text-sm text-[#6E626C] mt-1">
            Protect established truths in <span className="font-medium">{project.title}</span> and
            verify scenes against canon.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#FCE4EC]/70 border border-[#EFA7C5]/50 self-start">
          <button
            type="button"
            onClick={() => setWorkspaceTab('keeper')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              workspaceTab === 'keeper'
                ? 'bg-white text-[#B93778] shadow-xs'
                : 'text-[#4F3048]/80 hover:text-[#4F3048]'
            }`}
          >
            Canon Keeper
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceTab('continuity')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              workspaceTab === 'continuity'
                ? 'bg-white text-[#B93778] shadow-xs'
                : 'text-[#4F3048]/80 hover:text-[#4F3048]'
            }`}
          >
            Continuity Checker
          </button>
        </div>
      </div>

      {workspaceTab === 'continuity' ? (
        <ContinuityChecker project={project} />
      ) : (
        <>
          {/* Canon Authority Notice + New Entry CTA */}
          <div className="stationery-card rounded-2xl p-5 bg-gradient-to-r from-[#FFFAFC] to-[#FCE4EC]/55 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#B93778] mt-0.5 shrink-0" />
              <div className="text-sm text-[#4F3048]">
                <span className="font-semibold">Canon Authority Rule:</span> Only entries marked{' '}
                <span className="font-semibold text-[#B93778]">Canon</span> are fed as authoritative
                facts to the What-If Engine, Writing Companion, and Continuity Checker. Experimental
                ideas stay quarantined until you promote them.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingEntry(null);
                setEditorOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C53B7D] hover:bg-[#B93778] text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Add Canon Entry</span>
            </button>
          </div>

          {/* Status Tabs & Filters */}
          <div className="stationery-card rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'canon', label: 'Canon' },
                  { id: 'experimental', label: 'Experimental' },
                  { id: 'rejected', label: 'Rejected' },
                  { id: 'archived', label: 'Archived' },
                  { id: 'all', label: 'All Entries' },
                ] as const
              ).map((tab) => {
                const active = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap font-mono-tabular ${
                      active
                        ? 'bg-[#C53B7D] text-white'
                        : 'bg-[#FFFAFC] text-[#4F3048] border border-[#BA86A6]/30 hover:bg-[#FCE4EC]/60'
                    }`}
                  >
                    {tab.label} ({counts[tab.id]})
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#8C5B7C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search canon titles or descriptions..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FFFAFC] border border-[#BA86A6]/30 text-sm text-[#4F3048] placeholder:text-[#BA86A6] focus:border-[#D94F93] focus:outline-none"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'All' | CanonCategory)}
                aria-label="Filter canon by category"
                className="px-3 py-2 rounded-xl bg-[#FFFAFC] border border-[#BA86A6]/30 text-sm text-[#4F3048]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Entries List */}
          {filteredEntries.length === 0 ? (
            <div className="stationery-card rounded-3xl p-10 text-center max-w-xl mx-auto">
              <h2 className="font-editorial text-xl font-bold text-[#4F3048]">
                No entries in this view
              </h2>
              <p className="mt-2 text-sm text-[#6E626C]">
                {statusFilter === 'canon'
                  ? 'Record your first established rule, timeline date, or secret so Plotline can protect your continuity.'
                  : 'No entries match your current status, category, or search filter.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingEntry(null);
                  setEditorOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C53B7D] hover:bg-[#B93778] text-white text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Entry</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry) => {
                const meta = STATUS_META[entry.status];
                const StatusIcon = meta.icon;
                const linkedChars = entry.linkedCharacterIds
                  .map((id) => project.characters.find((c) => c.id === id)?.fullName)
                  .filter((n): n is string => Boolean(n));

                return (
                  <article
                    key={entry.id}
                    className={`rounded-2xl border p-5 shadow-xs transition-colors ${meta.cardTone}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-semibold ${meta.badgeTone}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{meta.label}</span>
                          </span>
                          <span className="text-[#766B74]">·</span>
                          <span className="font-medium text-[#4F3048]">{entry.category}</span>
                          <span className="text-[#766B74]">·</span>
                          <span className="text-[#766B74]">
                            {entry.source === 'approved-ai'
                              ? 'Approved AI Suggestion'
                              : 'Manual Entry'}
                          </span>
                          <span className="text-[#766B74]">·</span>
                          <span className="font-mono-tabular text-[#766B74]">{entry.id}</span>
                        </div>

                        <h3 className="font-editorial text-xl font-bold text-[#4F3048]">
                          {entry.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEntry(entry);
                            setEditorOpen(true);
                          }}
                          className="p-2 rounded-lg text-[#6E626C] hover:text-[#4F3048] hover:bg-[#FCE4EC]/70"
                          title="Edit entry"
                          aria-label={`Edit ${entry.title}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(entry)}
                          className="p-2 rounded-lg text-[#6E626C] hover:text-[#B93778] hover:bg-[#FCE4EC]/70"
                          title="Delete entry"
                          aria-label={`Delete ${entry.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 writing-prose text-[#4F3048]/90 leading-relaxed whitespace-pre-wrap">
                      {entry.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-[#EFA7C5]/25 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-[#766B74]">
                        {linkedChars.length > 0 && (
                          <span className="mr-3 text-[#4F3048] font-medium">
                            Linked: {linkedChars.join(', ')}
                          </span>
                        )}
                        <span className="font-mono-tabular">
                          Updated {new Date(entry.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {entry.status !== 'canon' && (
                          <button
                            type="button"
                            onClick={() => onChangeStatus(entry.id, 'canon')}
                            className="px-3 py-1 rounded-lg bg-[#C53B7D] hover:bg-[#B93778] text-white text-xs font-medium"
                          >
                            Approve as Canon
                          </button>
                        )}
                        {entry.status !== 'experimental' && (
                          <button
                            type="button"
                            onClick={() => onChangeStatus(entry.id, 'experimental')}
                            className="px-3 py-1 rounded-lg bg-[#F3E8F7] hover:bg-[#E7D4EE] text-[#4F3048] text-xs font-medium"
                          >
                            Move to Experimental
                          </button>
                        )}
                        {entry.status !== 'archived' && (
                          <button
                            type="button"
                            onClick={() => onChangeStatus(entry.id, 'archived')}
                            className="px-3 py-1 rounded-lg bg-white border border-[#BA86A6]/35 hover:bg-[#FFF5F9] text-[#6E626C] text-xs font-medium"
                          >
                            Archive
                          </button>
                        )}
                        {entry.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => onChangeStatus(entry.id, 'rejected')}
                            className="px-3 py-1 rounded-lg bg-white border border-[#BA86A6]/35 hover:bg-[#FCE4EC]/60 text-[#6E626C] text-xs font-medium"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <CanonEntryEditor
            open={editorOpen}
            initialEntry={editingEntry}
            characters={project.characters}
            defaultStatus={statusFilter === 'all' ? 'canon' : statusFilter}
            onSave={(entry) => {
              onUpsertEntry(entry);
              setEditorOpen(false);
              setEditingEntry(null);
            }}
            onClose={() => {
              setEditorOpen(false);
              setEditingEntry(null);
            }}
          />

          <ConfirmDialog
            open={Boolean(pendingDelete)}
            title="Delete canon entry?"
            message={`Permanently remove "${pendingDelete?.title}"? If you only want to stop pursuing this idea, you can mark it Rejected or Archived instead.`}
            confirmLabel="Delete Entry"
            destructive
            onConfirm={() => {
              if (pendingDelete) {
                onDeleteEntry(pendingDelete.id);
              }
              setPendingDelete(null);
            }}
            onCancel={() => setPendingDelete(null)}
          />
        </>
      )}
    </div>
  );
};
