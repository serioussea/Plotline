import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { AppShell } from './components/AppShell';
import { CanonKeeper } from './components/CanonKeeper';
import { CharacterBible } from './components/CharacterBible';
import { Dashboard } from './components/Dashboard';
import { MyStories } from './components/MyStories';
import { PlotBoard } from './components/PlotBoard';
import { ProjectEditor } from './components/ProjectEditor';
import { Settings } from './components/Settings';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { WhatIfEngine } from './components/WhatIfEngine';
import { WritingCompanion } from './components/WritingCompanion';
import { usePlotlineStore } from './store/usePlotlineStore';
import type { SectionId, StoryProject } from './types/plotline';
import {
  exportAllProjectsAsJson,
  exportProjectAsJson,
  exportProjectAsMarkdown,
} from './utils/exportImport';

export default function App() {
  const store = usePlotlineStore();
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard');
  const [projectEditorOpen, setProjectEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<StoryProject | null>(null);
  const [pendingDeleteProject, setPendingDeleteProject] = useState<StoryProject | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    window.setTimeout(() => {
      setToast((current) => (current?.text === text ? null : current));
    }, 3500);
  };

  const { activeProject } = store;

  const handleOpenProject = (projectId: string) => {
    store.setActiveProjectId(projectId);
    if (activeSection === 'dashboard' || activeSection === 'stories') {
      setActiveSection('characters');
    }
  };

  const handleExportActiveJson = () => {
    if (!activeProject) return;
    const res = exportProjectAsJson(activeProject);
    if (res.success) {
      showToast('success', `Exported ${res.filename}`);
    } else {
      showToast('error', res.error || 'Failed to export JSON.');
    }
  };

  const handleExportActiveMarkdown = () => {
    if (!activeProject) return;
    const res = exportProjectAsMarkdown(activeProject);
    if (res.success) {
      showToast('success', `Exported ${res.filename}`);
    } else {
      showToast('error', res.error || 'Failed to export Markdown Story Bible.');
    }
  };

  const handleExportAllJson = () => {
    const res = exportAllProjectsAsJson(store.workspace.projects);
    if (res.success) {
      showToast('success', `Exported ${res.filename}`);
    } else {
      showToast('error', res.error || 'Failed to export workspace backup.');
    }
  };

  const renderMissingProjectPrompt = () => (
    <div className="stationery-card rounded-3xl p-10 text-center max-w-xl mx-auto">
      <h2 className="font-editorial text-2xl font-bold text-[#4F3048]">
        Select or create a story first
      </h2>
      <p className="mt-2 text-sm text-[#6E626C]">
        Choose a story from your library or create a new project to open this workspace.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => setActiveSection('dashboard')}
          className="px-4 py-2 rounded-xl bg-white border border-[#BA86A6]/40 text-sm font-medium text-[#4F3048]"
        >
          Go to Dashboard
        </button>
        <button
          type="button"
          onClick={() => {
            setEditingProject(null);
            setProjectEditorOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-[#C53B7D] hover:bg-[#B93778] text-white text-sm font-medium"
        >
          + Create New Story
        </button>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <Dashboard
            projects={store.workspace.projects}
            activeProject={activeProject}
            onCreateNew={() => {
              setEditingProject(null);
              setProjectEditorOpen(true);
            }}
            onOpenProject={handleOpenProject}
            onEditProject={(proj) => {
              setEditingProject(proj);
              setProjectEditorOpen(true);
            }}
            onDuplicateProject={(id) => {
              store.duplicateProject(id);
              showToast('success', 'Story project duplicated.');
            }}
            onDeleteProject={(proj) => setPendingDeleteProject(proj)}
            onNavigate={setActiveSection}
            onRestoreSample={() => {
              store.restoreSampleProject();
              showToast('success', 'Restored sample story "The Glass Orchard".');
            }}
          />
        );

      case 'stories':
        return (
          <MyStories
            projects={store.workspace.projects}
            activeProjectId={activeProject?.id ?? null}
            onCreateNew={() => {
              setEditingProject(null);
              setProjectEditorOpen(true);
            }}
            onOpenProject={handleOpenProject}
            onEditProject={(proj) => {
              setEditingProject(proj);
              setProjectEditorOpen(true);
            }}
            onDuplicateProject={(id) => {
              store.duplicateProject(id);
              showToast('success', 'Story project duplicated.');
            }}
            onDeleteProject={(proj) => setPendingDeleteProject(proj)}
          />
        );

      case 'characters':
        return activeProject ? (
          <CharacterBible
            project={activeProject}
            onUpsertCharacter={(ch) => store.upsertCharacter(activeProject.id, ch)}
            onDeleteCharacter={(charId) => store.deleteCharacter(activeProject.id, charId)}
          />
        ) : (
          renderMissingProjectPrompt()
        );

      case 'canon':
        return activeProject ? (
          <CanonKeeper
            project={activeProject}
            onUpsertEntry={(entry) => store.upsertCanonEntry(activeProject.id, entry)}
            onChangeStatus={(entryId, status) =>
              store.setCanonEntryStatus(activeProject.id, entryId, status)
            }
            onDeleteEntry={(entryId) => store.deleteCanonEntry(activeProject.id, entryId)}
          />
        ) : (
          renderMissingProjectPrompt()
        );

      case 'plot-board':
        return activeProject ? (
          <PlotBoard
            project={activeProject}
            onUpsertCard={(card) => store.upsertPlotCard(activeProject.id, card)}
            onDeleteCard={(cardId) => store.deletePlotCard(activeProject.id, cardId)}
            onReorderCards={(ids) => store.reorderPlotCards(activeProject.id, ids)}
          />
        ) : (
          renderMissingProjectPrompt()
        );

      case 'what-if':
        return activeProject ? (
          <WhatIfEngine
            project={activeProject}
            onAddSession={(sess) => store.addWhatIfSession(activeProject.id, sess)}
            onUpdateBranch={(sessId, branchId, updater) =>
              store.updateBranch(activeProject.id, sessId, branchId, updater)
            }
            onSetBranchStatus={(sessId, branchId, status) =>
              store.setBranchStatus(activeProject.id, sessId, branchId, status)
            }
            onResolveConflict={(sessId, branchId, cfId, res) =>
              store.resolveConflictFlag(activeProject.id, sessId, branchId, cfId, res)
            }
            onPromoteChanges={(sessId, branchId, decisions) =>
              store.promoteProposedChanges(activeProject.id, sessId, branchId, decisions)
            }
            onJumpToCanon={() => setActiveSection('canon')}
          />
        ) : (
          renderMissingProjectPrompt()
        );

      case 'companion':
        return activeProject ? (
          <WritingCompanion
            project={activeProject}
            onCreateConversation={(title) =>
              store.createConversation(activeProject.id, title)
            }
            onRenameConversation={(convId, title) =>
              store.renameConversation(activeProject.id, convId, title)
            }
            onDeleteConversation={(convId) =>
              store.deleteConversation(activeProject.id, convId)
            }
            onSetAttachedBranches={(convId, branchIds) =>
              store.setConversationAttachedBranches(activeProject.id, convId, branchIds)
            }
            onAppendMessages={(convId, msgs) =>
              store.appendMessagesToConversation(activeProject.id, convId, msgs)
            }
            onSaveAsExperimentalNote={(convId, msgId, entry) => {
              store.upsertCanonEntry(activeProject.id, entry);
              store.markMessageSavedAsNote(activeProject.id, convId, msgId);
              showToast('success', 'Saved response as an Experimental Note in Canon Keeper.');
            }}
          />
        ) : (
          renderMissingProjectPrompt()
        );

      case 'settings':
        return (
          <Settings
            projects={store.workspace.projects}
            activeProject={activeProject}
            preferences={store.workspace.preferences}
            onUpdatePreferences={store.updatePreferences}
            onEditActiveProject={() => {
              if (activeProject) {
                setEditingProject(activeProject);
                setProjectEditorOpen(true);
              }
            }}
            onDuplicateActiveProject={() => {
              if (activeProject) {
                store.duplicateProject(activeProject.id);
                showToast('success', 'Story project duplicated.');
              }
            }}
            onRestoreSampleProject={() => {
              store.restoreSampleProject();
              showToast('success', 'Sample story "The Glass Orchard" restored.');
            }}
            onExportActiveJson={handleExportActiveJson}
            onExportActiveMarkdown={handleExportActiveMarkdown}
            onExportAllJson={handleExportAllJson}
            onImportProjects={(imported) => {
              store.importProjects(imported);
              showToast(
                'success',
                `Imported ${imported.length} ${
                  imported.length === 1 ? 'story' : 'stories'
                } successfully.`
              );
            }}
          />
        );
    }
  };

  return (
    <AppShell
      activeSection={activeSection}
      onSelectSection={setActiveSection}
      projects={store.workspace.projects}
      activeProject={activeProject}
      onSelectProject={(id) => store.setActiveProjectId(id)}
      saveStatus={store.saveStatus}
      storageError={store.storageError}
      lastSavedAt={store.lastSavedAt}
      preferences={store.workspace.preferences}
      onToggleSidebar={() =>
        store.updatePreferences({
          sidebarCollapsed: !store.workspace.preferences.sidebarCollapsed,
        })
      }
      onExportJson={handleExportActiveJson}
      onExportMarkdown={handleExportActiveMarkdown}
    >
      {renderSection()}

      <ProjectEditor
        open={projectEditorOpen}
        initialProject={editingProject}
        onSave={(data) => {
          if (editingProject) {
            store.updateProject(editingProject.id, (prev) => ({
              ...prev,
              ...data,
            }));
            showToast('success', `Saved changes to "${data.title}".`);
          } else {
            const created = store.createProject(data);
            setActiveSection('characters');
            showToast('success', `Created "${created.title}".`);
          }
          setProjectEditorOpen(false);
          setEditingProject(null);
        }}
        onClose={() => {
          setProjectEditorOpen(false);
          setEditingProject(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDeleteProject)}
        title="Delete story project?"
        message={`Permanently delete "${pendingDeleteProject?.title}" and all of its characters, canon entries, plot cards, What-If branches, and conversations?`}
        confirmLabel="Delete Story"
        destructive
        onConfirm={() => {
          if (pendingDeleteProject) {
            const deletedTitle = pendingDeleteProject.title;
            store.deleteProject(pendingDeleteProject.id);
            showToast('success', `Deleted "${deletedTitle}".`);
          }
          setPendingDeleteProject(null);
        }}
        onCancel={() => setPendingDeleteProject(null)}
      />

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl bg-[#4F3048] text-white px-4 py-3 shadow-xl flex items-center gap-2.5 text-sm"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#F8C8DC] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#ED75A7] shrink-0" />
          )}
          <span className="flex-1">{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-lg hover:bg-white/10"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </AppShell>
  );
}
