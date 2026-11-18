import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSampleGlassOrchardProject } from '../data/sampleProject';
import type {
  BranchStatus,
  CanonEntry,
  CanonStatus,
  CharacterProfile,
  ChatMessage,
  ContinuityConflictFlag,
  Conversation,
  NarrativeBranch,
  PlotCard,
  ProposedCanonChange,
  StoryProject,
  UserPreferences,
  WhatIfSession,
} from '../types/plotline';

const STORAGE_KEY = 'plotline_workspace_v1';

export interface WorkspacePersistedState {
  version: 1;
  activeProjectId: string | null;
  projects: StoryProject[];
  preferences: UserPreferences;
}

export type SaveStatus = 'saved' | 'saving' | 'error';

const DEFAULT_PREFERENCES: UserPreferences = {
  writingFontSize: 'medium',
  sidebarCollapsed: false,
  compactCards: false,
};

export function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function loadInitialState(): { state: WorkspacePersistedState; error: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const sample = createSampleGlassOrchardProject();
      return {
        state: {
          version: 1,
          activeProjectId: sample.id,
          projects: [sample],
          preferences: DEFAULT_PREFERENCES,
        },
        error: null,
      };
    }

    const parsed = JSON.parse(raw) as Partial<WorkspacePersistedState>;
    const projects = Array.isArray(parsed.projects) ? parsed.projects : [];
    const activeProjectId =
      typeof parsed.activeProjectId === 'string' &&
      projects.some((p) => p.id === parsed.activeProjectId)
        ? parsed.activeProjectId
        : projects[0]?.id ?? null;

    return {
      state: {
        version: 1,
        activeProjectId,
        projects,
        preferences: {
          ...DEFAULT_PREFERENCES,
          ...(parsed.preferences ?? {}),
        },
      },
      error: null,
    };
  } catch (err) {
    const sample = createSampleGlassOrchardProject();
    return {
      state: {
        version: 1,
        activeProjectId: sample.id,
        projects: [sample],
        preferences: DEFAULT_PREFERENCES,
      },
      error:
        err instanceof Error
          ? `Could not read saved workspace (${err.message}). Loaded fresh sample workspace.`
          : 'Could not read saved workspace from local storage.',
    };
  }
}

export function usePlotlineStore() {
  const initial = useMemo(() => loadInitialState(), []);
  const [workspace, setWorkspace] = useState<WorkspacePersistedState>(initial.state);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(initial.error ? 'error' : 'saved');
  const [storageError, setStorageError] = useState<string | null>(initial.error);
  const [lastSavedAt, setLastSavedAt] = useState<string>(new Date().toISOString());

  useEffect(() => {
    setSaveStatus('saving');
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
        setSaveStatus('saved');
        setStorageError(null);
        setLastSavedAt(new Date().toISOString());
      } catch (err) {
        setSaveStatus('error');
        setStorageError(
          err instanceof Error
            ? `Failed to save to browser storage: ${err.message}. Export a JSON backup to avoid data loss.`
            : 'Browser storage quota exceeded or unavailable.'
        );
      }
    }, 120);

    return () => window.clearTimeout(timer);
  }, [workspace]);

  const activeProject = useMemo(
    () => workspace.projects.find((p) => p.id === workspace.activeProjectId) ?? null,
    [workspace.projects, workspace.activeProjectId]
  );

  const setActiveProjectId = useCallback((projectId: string | null) => {
    setWorkspace((prev) => ({
      ...prev,
      activeProjectId: projectId,
    }));
  }, []);

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    setWorkspace((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...patch,
      },
    }));
  }, []);

  const updateProject = useCallback(
    (projectId: string, updater: (project: StoryProject) => StoryProject) => {
      setWorkspace((prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === projectId
            ? { ...updater(p), updatedAt: new Date().toISOString() }
            : p
        ),
      }));
    },
    []
  );

  const createProject = useCallback(
    (data: {
      title: string;
      synopsis: string;
      genres: string[];
      coverType: 'gradient' | 'image';
      coverGradientId: string;
      coverImageDataUrl?: string;
    }): StoryProject => {
      const now = new Date().toISOString();
      const newProject: StoryProject = {
        id: createId('proj'),
        title: data.title.trim() || 'Untitled Story',
        synopsis: data.synopsis.trim(),
        genres: data.genres,
        coverType: data.coverType,
        coverGradientId: data.coverGradientId,
        coverImageDataUrl: data.coverImageDataUrl,
        isSample: false,
        characters: [],
        canonEntries: [],
        whatIfSessions: [],
        plotCards: [],
        conversations: [
          {
            id: createId('conv'),
            title: 'Story Brainstorming',
            attachedBranchIds: [],
            messages: [],
            createdAt: now,
            updatedAt: now,
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      setWorkspace((prev) => ({
        ...prev,
        activeProjectId: newProject.id,
        projects: [newProject, ...prev.projects],
      }));

      return newProject;
    },
    []
  );

  const duplicateProject = useCallback((projectId: string) => {
    setWorkspace((prev) => {
      const source = prev.projects.find((p) => p.id === projectId);
      if (!source) return prev;
      const now = new Date().toISOString();
      const clone: StoryProject = {
        ...JSON.parse(JSON.stringify(source)),
        id: createId('proj'),
        title: `${source.title} (Copy)`,
        isSample: false,
        createdAt: now,
        updatedAt: now,
      };
      return {
        ...prev,
        activeProjectId: clone.id,
        projects: [clone, ...prev.projects],
      };
    });
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setWorkspace((prev) => {
      const remaining = prev.projects.filter((p) => p.id !== projectId);
      const nextActive =
        prev.activeProjectId === projectId ? remaining[0]?.id ?? null : prev.activeProjectId;
      return {
        ...prev,
        activeProjectId: nextActive,
        projects: remaining,
      };
    });
  }, []);

  const importProjects = useCallback((imported: StoryProject[]) => {
    setWorkspace((prev) => {
      const existingIds = new Set(prev.projects.map((p) => p.id));
      const sanitized = imported.map((proj) => {
        const needsNewId = existingIds.has(proj.id);
        const finalId = needsNewId ? createId('proj') : proj.id;
        existingIds.add(finalId);
        return {
          ...proj,
          id: finalId,
          isSample: false,
          updatedAt: new Date().toISOString(),
        };
      });
      return {
        ...prev,
        activeProjectId: sanitized[0]?.id ?? prev.activeProjectId,
        projects: [...sanitized, ...prev.projects],
      };
    });
  }, []);

  const restoreSampleProject = useCallback(() => {
    const sample = createSampleGlassOrchardProject();
    setWorkspace((prev) => {
      const filtered = prev.projects.filter((p) => p.id !== sample.id);
      return {
        ...prev,
        activeProjectId: sample.id,
        projects: [...filtered, sample],
      };
    });
  }, []);

  // Character CRUD
  const upsertCharacter = useCallback(
    (projectId: string, character: CharacterProfile) => {
      const now = new Date().toISOString();
      updateProject(projectId, (proj) => {
        const exists = proj.characters.some((c) => c.id === character.id);
        return {
          ...proj,
          characters: exists
            ? proj.characters.map((c) =>
                c.id === character.id ? { ...character, updatedAt: now } : c
              )
            : [{ ...character, createdAt: now, updatedAt: now }, ...proj.characters],
        };
      });
    },
    [updateProject]
  );

  const deleteCharacter = useCallback(
    (projectId: string, characterId: string) => {
      updateProject(projectId, (proj) => ({
        ...proj,
        characters: proj.characters.filter((c) => c.id !== characterId),
        canonEntries: proj.canonEntries.map((entry) => ({
          ...entry,
          linkedCharacterIds: entry.linkedCharacterIds.filter((id) => id !== characterId),
        })),
        plotCards: proj.plotCards.map((card) => ({
          ...card,
          relatedCharacterIds: card.relatedCharacterIds.filter((id) => id !== characterId),
        })),
      }));
    },
    [updateProject]
  );

  // Canon CRUD
  const upsertCanonEntry = useCallback(
    (projectId: string, entry: CanonEntry) => {
      const now = new Date().toISOString();
      updateProject(projectId, (proj) => {
        const exists = proj.canonEntries.some((e) => e.id === entry.id);
        return {
          ...proj,
          canonEntries: exists
            ? proj.canonEntries.map((e) => (e.id === entry.id ? { ...entry, updatedAt: now } : e))
            : [{ ...entry, createdAt: now, updatedAt: now }, ...proj.canonEntries],
        };
      });
    },
    [updateProject]
  );

  const setCanonEntryStatus = useCallback(
    (projectId: string, entryId: string, status: CanonStatus) => {
      const now = new Date().toISOString();
      updateProject(projectId, (proj) => ({
        ...proj,
        canonEntries: proj.canonEntries.map((e) =>
          e.id === entryId ? { ...e, status, updatedAt: now } : e
        ),
      }));
    },
    [updateProject]
  );

  const deleteCanonEntry = useCallback(
    (projectId: string, entryId: string) => {
      updateProject(projectId, (proj) => ({
        ...proj,
        canonEntries: proj.canonEntries.filter((e) => e.id !== entryId),
      }));
    },
    [updateProject]
  );

  // What-If Sessions & Branches
  const addWhatIfSession = useCallback(
    (projectId: string, session: WhatIfSession) => {
      updateProject(projectId, (proj) => ({
        ...proj,
        whatIfSessions: [session, ...proj.whatIfSessions],
      }));
    },
    [updateProject]
  );

  const updateBranch = useCallback(
    (
      projectId: string,
      sessionId: string,
      branchId: string,
      updater: (branch: NarrativeBranch) => NarrativeBranch
    ) => {
      const now = new Date().toISOString();
      updateProject(projectId, (proj) => ({
        ...proj,
        whatIfSessions: proj.whatIfSessions.map((sess) =>
          sess.id === sessionId
            ? {
                ...sess,
                updatedAt: now,
                branches: sess.branches.map((br) =>
                  br.id === branchId ? { ...updater(br), updatedAt: now } : br
                ),
              }
            : sess
        ),
      }));
    },
    [updateProject]
  );

  const setBranchStatus = useCallback(
    (projectId: string, sessionId: string, branchId: string, status: BranchStatus) => {
      updateBranch(projectId, sessionId, branchId, (br) => ({ ...br, status }));
    },
    [updateBranch]
  );

  const resolveConflictFlag = useCallback(
    (
      projectId: string,
      sessionId: string,
      branchId: string,
      conflictId: string,
      resolution: ContinuityConflictFlag['resolution']
    ) => {
      updateBranch(projectId, sessionId, branchId, (br) => ({
        ...br,
        continuityConflicts: br.continuityConflicts.map((cf) =>
          cf.id === conflictId ? { ...cf, resolution } : cf
        ),
      }));
    },
    [updateBranch]
  );

  const promoteProposedChanges = useCallback(
    (
      projectId: string,
      sessionId: string,
      branchId: string,
      decisions: Array<{
        change: ProposedCanonChange;
        action: 'approved-canon' | 'saved-experimental' | 'skipped';
        editedTitle: string;
        editedDescription: string;
        editedCategory: CanonEntry['category'];
      }>
    ) => {
      const now = new Date().toISOString();
      updateProject(projectId, (proj) => {
        const newCanonEntries: CanonEntry[] = [];
        const decisionMap = new Map<string, ProposedCanonChange['decision']>();

        for (const item of decisions) {
          decisionMap.set(item.change.id, item.action);
          if (item.action === 'approved-canon' || item.action === 'saved-experimental') {
            const linkedIds = item.change.linkedCharacterNames
              .map((name) =>
                proj.characters.find(
                  (c) =>
                    c.fullName.toLowerCase() === name.toLowerCase() ||
                    c.nickname.toLowerCase() === name.toLowerCase()
                )?.id
              )
              .filter((id): id is string => Boolean(id));

            newCanonEntries.push({
              id: createId('canon'),
              title: item.editedTitle.trim() || item.change.title,
              description: item.editedDescription.trim() || item.change.description,
              category: item.editedCategory,
              status: item.action === 'approved-canon' ? 'canon' : 'experimental',
              linkedCharacterIds: linkedIds,
              source: 'approved-ai',
              sourceNote: `Promoted from What-If Engine`,
              createdAt: now,
              updatedAt: now,
            });
          }
        }

        const hasApprovedCanon = decisions.some((d) => d.action === 'approved-canon');

        return {
          ...proj,
          canonEntries: [...newCanonEntries, ...proj.canonEntries],
          whatIfSessions: proj.whatIfSessions.map((sess) =>
            sess.id === sessionId
              ? {
                  ...sess,
                  updatedAt: now,
                  branches: sess.branches.map((br) =>
                    br.id === branchId
                      ? {
                          ...br,
                          status: hasApprovedCanon ? 'promoted_partial' : br.status,
                          proposedCanonChanges: br.proposedCanonChanges.map((ch) => ({
                            ...ch,
                            decision: decisionMap.get(ch.id) ?? ch.decision ?? 'pending',
                          })),
                          updatedAt: now,
                        }
                      : br
                  ),
                }
              : sess
          ),
        };
      });
    },
    [updateProject]
  );

  // Plot Board CRUD
  const upsertPlotCard = useCallback(
    (projectId: string, card: PlotCard) => {
      const now = new Date().toISOString();
      updateProject(projectId, (proj) => {
        const exists = proj.plotCards.some((c) => c.id === card.id);
        const nextCards = exists
          ? proj.plotCards.map((c) => (c.id === card.id ? { ...card, updatedAt: now } : c))
          : [...proj.plotCards, { ...card, createdAt: now, updatedAt: now }];
        return {
          ...proj,
          plotCards: nextCards,
        };
      });
    },
    [updateProject]
  );

  const deletePlotCard = useCallback(
    (projectId: string, cardId: string) => {
      updateProject(projectId, (proj) => {
        const filtered = proj.plotCards
          .filter((c) => c.id !== cardId)
          .sort((a, b) => a.order - b.order)
          .map((c, idx) => ({ ...c, order: idx + 1 }));
        return { ...proj, plotCards: filtered };
      });
    },
    [updateProject]
  );

  const reorderPlotCards = useCallback(
    (projectId: string, orderedIds: string[]) => {
      const now = new Date().toISOString();
      updateProject(projectId, (proj) => {
        const map = new Map(proj.plotCards.map((c) => [c.id, c]));
        const reordered: PlotCard[] = [];
        orderedIds.forEach((id, index) => {
          const item = map.get(id);
          if (item) {
            reordered.push({ ...item, order: index + 1, updatedAt: now });
          }
        });
        return { ...proj, plotCards: reordered };
      });
    },
    [updateProject]
  );

  // Conversations
  const createConversation = useCallback(
    (projectId: string, title = 'New Story Conversation'): string => {
      const id = createId('conv');
      const now = new Date().toISOString();
      const conv: Conversation = {
        id,
        title,
        attachedBranchIds: [],
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      updateProject(projectId, (proj) => ({
        ...proj,
        conversations: [conv, ...proj.conversations],
      }));
      return id;
    },
    [updateProject]
  );

  const renameConversation = useCallback(
    (projectId: string, conversationId: string, title: string) => {
      updateProject(projectId, (proj) => ({
        ...proj,
        conversations: proj.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, title: title.trim() || c.title, updatedAt: new Date().toISOString() }
            : c
        ),
      }));
    },
    [updateProject]
  );

  const deleteConversation = useCallback(
    (projectId: string, conversationId: string) => {
      updateProject(projectId, (proj) => ({
        ...proj,
        conversations: proj.conversations.filter((c) => c.id !== conversationId),
      }));
    },
    [updateProject]
  );

  const setConversationAttachedBranches = useCallback(
    (projectId: string, conversationId: string, branchIds: string[]) => {
      updateProject(projectId, (proj) => ({
        ...proj,
        conversations: proj.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, attachedBranchIds: branchIds, updatedAt: new Date().toISOString() }
            : c
        ),
      }));
    },
    [updateProject]
  );

  const appendMessagesToConversation = useCallback(
    (projectId: string, conversationId: string, messagesToAdd: ChatMessage[]) => {
      const now = new Date().toISOString();
      updateProject(projectId, (proj) => ({
        ...proj,
        conversations: proj.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, ...messagesToAdd], updatedAt: now }
            : c
        ),
      }));
    },
    [updateProject]
  );

  const markMessageSavedAsNote = useCallback(
    (projectId: string, conversationId: string, messageId: string) => {
      updateProject(projectId, (proj) => ({
        ...proj,
        conversations: proj.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId ? { ...m, savedAsExperimentalNote: true } : m
                ),
              }
            : c
        ),
      }));
    },
    [updateProject]
  );

  return {
    workspace,
    activeProject,
    saveStatus,
    storageError,
    lastSavedAt,
    setActiveProjectId,
    updatePreferences,
    updateProject,
    createProject,
    duplicateProject,
    deleteProject,
    importProjects,
    restoreSampleProject,
    upsertCharacter,
    deleteCharacter,
    upsertCanonEntry,
    setCanonEntryStatus,
    deleteCanonEntry,
    addWhatIfSession,
    updateBranch,
    setBranchStatus,
    resolveConflictFlag,
    promoteProposedChanges,
    upsertPlotCard,
    deletePlotCard,
    reorderPlotCards,
    createConversation,
    renameConversation,
    deleteConversation,
    setConversationAttachedBranches,
    appendMessagesToConversation,
    markMessageSavedAsNote,
  };
}
