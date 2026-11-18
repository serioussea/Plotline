import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Database,
  Download,
  FileJson,
  FileText,
  RotateCcw,
  Upload,
} from 'lucide-react';
import type { StoryProject, UserPreferences } from '../types/plotline';
import { checkAiHealth } from '../utils/aiClient';
import { parseAndValidateProjectImport } from '../utils/exportImport';

interface SettingsProps {
  projects: StoryProject[];
  activeProject: StoryProject | null;
  preferences: UserPreferences;
  onUpdatePreferences: (patch: Partial<UserPreferences>) => void;
  onEditActiveProject: () => void;
  onDuplicateActiveProject: () => void;
  onRestoreSampleProject: () => void;
  onExportActiveJson: () => void;
  onExportActiveMarkdown: () => void;
  onExportAllJson: () => void;
  onImportProjects: (imported: StoryProject[]) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  projects,
  activeProject,
  preferences,
  onUpdatePreferences,
  onEditActiveProject,
  onDuplicateActiveProject,
  onRestoreSampleProject,
  onExportActiveJson,
  onExportActiveMarkdown,
  onExportAllJson,
  onImportProjects,
}) => {
  const [aiStatus, setAiStatus] = useState<{
    checked: boolean;
    aiConfigured: boolean;
    model: string;
    error?: string;
  }>({ checked: false, aiConfigured: false, model: '' });

  const [importNotice, setImportNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    checkAiHealth()
      .then((res) =>
        setAiStatus({
          checked: true,
          aiConfigured: res.aiConfigured,
          model: res.model,
        })
      )
      .catch((err) =>
        setAiStatus({
          checked: true,
          aiConfigured: false,
          model: '',
          error: err instanceof Error ? err.message : 'Service unreachable',
        })
      );
  }, []);

  const storageBytes = (() => {
    try {
      const raw = localStorage.getItem('plotline_workspace_v1') || '';
      return new Blob([raw]).size;
    } catch {
      return 0;
    }
  })();

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const result = parseAndValidateProjectImport(text);
      if (!result.valid) {
        setImportNotice({
          type: 'error',
          text: result.error || 'Could not import JSON file.',
        });
        return;
      }
      onImportProjects(result.projects);
      setImportNotice({
        type: 'success',
        text: `Imported ${result.projects.length} ${
          result.projects.length === 1 ? 'story project' : 'story projects'
        } into your workspace.`,
      });
    };
    reader.onerror = () => {
      setImportNotice({ type: 'error', text: 'Failed to read the selected file.' });
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-editorial text-3xl font-bold text-[#4F3048]">Settings</h1>
        <p className="text-sm text-[#6E626C] mt-1">
          Personalize your writing studio, back up your stories, and check workspace status.
        </p>
      </div>

      {/* Writing Preferences */}
      <section className="stationery-card rounded-2xl p-6 space-y-5">
        <h2 className="font-editorial text-xl font-bold text-[#4F3048]">
          Writing Interface Preferences
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-[#4F3048]">Writing Font Size</div>
            <p className="text-xs text-[#766B74]">
              Applies to character dossiers, canon notes, What-If prompts, and companion prose.
            </p>
          </div>
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#FCE4EC]/70 border border-[#EFA7C5]/50 self-start">
            {(
              [
                { id: 'small', label: 'Small (14px)' },
                { id: 'medium', label: 'Medium (16px)' },
                { id: 'large', label: 'Large (18px)' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdatePreferences({ writingFontSize: opt.id })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  preferences.writingFontSize === opt.id
                    ? 'bg-white text-[#B93778] shadow-xs'
                    : 'text-[#4F3048] hover:text-[#B93778]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Export & Import */}
      <section className="stationery-card rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="font-editorial text-xl font-bold text-[#4F3048]">
            Export & Import Stories
          </h2>
          <p className="text-xs text-[#6E626C] mt-0.5">
            Download clean JSON backups or formatted Markdown Story Bibles, or re-import saved
            stories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={!activeProject}
            onClick={onExportActiveJson}
            className="flex items-center gap-3 p-4 rounded-2xl bg-[#FFFAFC] border border-[#EFA7C5]/60 hover:bg-[#FCE4EC]/50 disabled:opacity-50 text-left transition-colors"
          >
            <FileJson className="w-5 h-5 text-[#B93778] shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[#4F3048]">
                Export Active Story (JSON)
              </div>
              <div className="text-xs text-[#766B74]">
                {activeProject ? activeProject.title : 'No active story'}
              </div>
            </div>
          </button>

          <button
            type="button"
            disabled={!activeProject}
            onClick={onExportActiveMarkdown}
            className="flex items-center gap-3 p-4 rounded-2xl bg-[#FFFAFC] border border-[#EFA7C5]/60 hover:bg-[#FCE4EC]/50 disabled:opacity-50 text-left transition-colors"
          >
            <FileText className="w-5 h-5 text-[#8C5B7C] shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[#4F3048]">
                Export Story Bible (.md)
              </div>
              <div className="text-xs text-[#766B74]">
                Overview, characters, canon & plot outline
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onExportAllJson}
            className="flex items-center gap-3 p-4 rounded-2xl bg-[#FFFAFC] border border-[#EFA7C5]/60 hover:bg-[#FCE4EC]/50 text-left transition-colors"
          >
            <Download className="w-5 h-5 text-[#B93778] shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[#4F3048]">
                Export Full Workspace (JSON)
              </div>
              <div className="text-xs text-[#766B74] font-mono-tabular">
                All {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </div>
            </div>
          </button>

          <label className="flex items-center gap-3 p-4 rounded-2xl bg-[#FCE4EC]/45 border border-[#D94F93]/40 hover:bg-[#FCE4EC]/75 text-left cursor-pointer transition-colors">
            <Upload className="w-5 h-5 text-[#B93778] shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[#4F3048]">Import Story JSON</div>
              <div className="text-xs text-[#766B74]">
                Restore a project or workspace backup
              </div>
            </div>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileImport}
              className="sr-only"
            />
          </label>
        </div>

        {importNotice && (
          <div
            className={`p-3.5 rounded-xl text-sm flex items-center gap-2 ${
              importNotice.type === 'success'
                ? 'bg-[#FCE4EC]/70 text-[#4F3048] border border-[#EFA7C5]'
                : 'bg-[#FCE4EC] text-[#B93778] border border-[#D94F93]/50'
            }`}
          >
            {importNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#B93778] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#B93778] shrink-0" />
            )}
            <span>{importNotice.text}</span>
          </div>
        )}
      </section>

      {/* Project Management */}
      <section className="stationery-card rounded-2xl p-6 space-y-4">
        <h2 className="font-editorial text-xl font-bold text-[#4F3048]">Project Management</h2>
        <div className="flex flex-wrap gap-3">
          {activeProject && (
            <>
              <button
                type="button"
                onClick={onEditActiveProject}
                className="px-4 py-2 rounded-xl bg-white border border-[#EFA7C5]/60 hover:bg-[#FCE4EC]/50 text-sm font-medium text-[#4F3048]"
              >
                Edit "{activeProject.title}" Details
              </button>
              <button
                type="button"
                onClick={onDuplicateActiveProject}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#EFA7C5]/60 hover:bg-[#FCE4EC]/50 text-sm font-medium text-[#4F3048]"
              >
                <Copy className="w-4 h-4 text-[#8C5B7C]" />
                <span>Duplicate Active Story</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onRestoreSampleProject}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F3E8F7]/70 hover:bg-[#F3E8F7] text-sm font-medium text-[#4F3048]"
          >
            <RotateCcw className="w-4 h-4 text-[#8C5B7C]" />
            <span>Reset / Restore "The Glass Orchard" Sample</span>
          </button>
        </div>
      </section>

      {/* AI Feature Status & Storage Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="stationery-card rounded-2xl p-6 space-y-2.5">
          <h2 className="font-editorial text-lg font-bold text-[#4F3048]">AI Feature Status</h2>
          {!aiStatus.checked ? (
            <p className="text-sm text-[#766B74]">Checking server AI connection...</p>
          ) : aiStatus.aiConfigured ? (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4F3048]">
                <CheckCircle2 className="w-4 h-4 text-[#B93778]" />
                <span>Connected to server-side Gemini service</span>
              </div>
              <p className="text-xs text-[#766B74]">
                Active model: <span className="font-mono-tabular">{aiStatus.model}</span>. Requests
                are processed securely on the server.
              </p>
            </div>
          ) : (
            <div className="space-y-1 text-sm text-[#B93778]">
              <div className="inline-flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4" />
                <span>AI key not detected on server</span>
              </div>
              <p className="text-xs text-[#6E626C]">
                {aiStatus.error ||
                  'Configure GEMINI_API_KEY in AI Studio Secrets to enable live What-If generation, Writing Companion, and Continuity Checker.'}
              </p>
            </div>
          )}
        </section>

        <section className="stationery-card rounded-2xl p-6 space-y-2.5">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#B93778]" />
            <h2 className="font-editorial text-lg font-bold text-[#4F3048]">
              Data Storage Information
            </h2>
          </div>
          <p className="text-xs text-[#6E626C] leading-relaxed">
            Your workspace currently uses{' '}
            <span className="font-mono-tabular font-semibold text-[#4F3048]">
              {(storageBytes / 1024).toFixed(1)} KB
            </span>{' '}
            in browser-local storage.
          </p>
          <p className="text-xs text-[#B93778] leading-relaxed font-medium">
            Reminder: Browser-local storage is not a cloud backup and may be lost if you clear site
            data or switch browsers. Use JSON Export regularly to keep safe backups.
          </p>
        </section>
      </div>
    </div>
  );
};
