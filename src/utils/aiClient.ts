import type {
  ContinuityCheckResult,
  NarrativeBranch,
  ProposedCanonChange,
  StoryProject,
  WhatIfChangeType,
} from '../types/plotline';
import { createId } from '../store/usePlotlineStore';

function buildApprovedContext(project: StoryProject) {
  const approvedCanon = project.canonEntries
    .filter((entry) => entry.status === 'canon')
    .map((entry) => ({
      id: entry.id,
      title: entry.title,
      description: entry.description,
      category: entry.category,
      status: entry.status,
      linkedCharacterNames: entry.linkedCharacterIds
        .map((id) => project.characters.find((c) => c.id === id)?.fullName)
        .filter((n): n is string => Boolean(n)),
    }));

  const characters = project.characters.map((ch) => ({
    id: ch.id,
    fullName: ch.fullName,
    nickname: ch.nickname,
    role: ch.role,
    coreTraits: ch.coreTraits,
    externalGoal: ch.externalGoal,
    internalDesire: ch.internalDesire,
    centralMotivation: ch.centralMotivation,
    secrets: ch.secrets,
    moralBoundaries: ch.moralBoundaries,
    relationshipsSummary: ch.relationships
      .map((r) => `${r.targetName} (${r.relationshipType}: ${r.currentStatus})`)
      .join('; '),
  }));

  return { approvedCanon, characters };
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function checkAiHealth(): Promise<{
  ok: boolean;
  aiConfigured: boolean;
  provider: string;
  model: string;
}> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error('Could not reach Plotline AI service.');
  }
  return res.json();
}

export async function requestWhatIfBranches(params: {
  project: StoryProject;
  question: string;
  changeType: WhatIfChangeType;
  includedExperimentalIds: string[];
}): Promise<{ contextNotice: string; branches: NarrativeBranch[] }> {
  const { approvedCanon, characters } = buildApprovedContext(params.project);

  const selectedExperiments = params.project.whatIfSessions
    .flatMap((s) => s.branches)
    .filter((b) => params.includedExperimentalIds.includes(b.id))
    .map((b) => ({
      title: b.title,
      premise: b.premise,
      plotConsequences: b.plotConsequences,
    }));

  // Also include explicitly chosen experimental canon notes if selected
  const extraExpNotes = params.project.canonEntries
    .filter((e) => e.status === 'experimental' && params.includedExperimentalIds.includes(e.id))
    .map((e) => ({
      title: e.title,
      premise: e.description,
      plotConsequences: [] as string[],
    }));

  interface RawBranch {
    title: string;
    approachLabel: string;
    premise: string;
    plotConsequences: string[];
    charactersAffected: string[];
    relationshipOrMotivationChanges: string;
    newConflicts: string[];
    emotionalThematicImpact: string;
    continuityConflicts: Array<{
      description: string;
      relatedCanonTitle: string;
      severity: 'direct-contradiction' | 'potential-tension' | 'needs-decision';
    }>;
    openQuestions: string[];
    proposedCanonChanges: Array<{
      title: string;
      description: string;
      category: ProposedCanonChange['category'];
      linkedCharacterNames: string[];
      rationale: string;
    }>;
  }

  const data = await postJson<{ contextNotice: string; branches: RawBranch[] }>(
    '/api/ai/what-if',
    {
      projectTitle: params.project.title,
      genres: params.project.genres,
      synopsis: params.project.synopsis,
      question: params.question,
      changeType: params.changeType,
      canonEntries: approvedCanon,
      characters,
      selectedExperiments: [...selectedExperiments, ...extraExpNotes],
    }
  );

  const now = new Date().toISOString();
  const branches: NarrativeBranch[] = data.branches.map((b) => ({
    id: createId('branch'),
    title: b.title,
    approachLabel: b.approachLabel,
    premise: b.premise,
    plotConsequences: b.plotConsequences,
    charactersAffected: b.charactersAffected,
    relationshipOrMotivationChanges: b.relationshipOrMotivationChanges,
    newConflicts: b.newConflicts,
    emotionalThematicImpact: b.emotionalThematicImpact,
    continuityConflicts: (b.continuityConflicts || []).map((cf) => ({
      id: createId('cf'),
      description: cf.description,
      relatedCanonTitle: cf.relatedCanonTitle,
      severity: cf.severity || 'potential-tension',
      resolution: 'pending',
    })),
    openQuestions: b.openQuestions || [],
    proposedCanonChanges: (b.proposedCanonChanges || []).map((pc) => ({
      id: createId('pcc'),
      title: pc.title,
      description: pc.description,
      category: pc.category || 'Plot',
      linkedCharacterNames: pc.linkedCharacterNames || [],
      rationale: pc.rationale || '',
      decision: 'pending',
    })),
    status: 'candidate',
    expansions: [],
    writerNotes: '',
    createdAt: now,
    updatedAt: now,
  }));

  return {
    contextNotice: data.contextNotice,
    branches,
  };
}

export async function requestBranchExpansion(params: {
  project: StoryProject;
  branch: NarrativeBranch;
  followUpPrompt: string;
}): Promise<{ expansion: string; contextNotice: string }> {
  const { approvedCanon, characters } = buildApprovedContext(params.project);
  return postJson('/api/ai/what-if/explore-further', {
    projectTitle: params.project.title,
    canonEntries: approvedCanon,
    characters,
    branchTitle: params.branch.title,
    branchPremise: params.branch.premise,
    branchConsequences: params.branch.plotConsequences,
    followUpPrompt: params.followUpPrompt,
  });
}

export async function requestCompanionReply(params: {
  project: StoryProject;
  attachedBranchIds: string[];
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  message: string;
}): Promise<{ reply: string; contextNotice: string; canonWarnings: string[] }> {
  const { approvedCanon, characters } = buildApprovedContext(params.project);
  const attachedBranches = params.project.whatIfSessions
    .flatMap((s) => s.branches)
    .filter((b) => params.attachedBranchIds.includes(b.id))
    .map((b) => ({
      title: b.title,
      premise: b.premise,
      plotConsequences: b.plotConsequences,
    }));

  return postJson('/api/ai/chat', {
    projectTitle: params.project.title,
    genres: params.project.genres,
    synopsis: params.project.synopsis,
    canonEntries: approvedCanon,
    characters,
    attachedBranches,
    history: params.history,
    message: params.message,
  });
}

export async function requestContinuityCheck(params: {
  project: StoryProject;
  sceneTitle: string;
  sceneText: string;
}): Promise<ContinuityCheckResult> {
  const { approvedCanon, characters } = buildApprovedContext(params.project);
  return postJson('/api/ai/continuity-check', {
    projectTitle: params.project.title,
    sceneTitle: params.sceneTitle,
    sceneText: params.sceneText,
    canonEntries: approvedCanon,
    characters,
  });
}

export async function requestContinuityRevision(params: {
  project: StoryProject;
  sceneText: string;
  findingsSummary: string;
}): Promise<{ suggestedRevision: string; revisionNotes: string; contextNotice: string }> {
  const { approvedCanon } = buildApprovedContext(params.project);
  return postJson('/api/ai/continuity-revise', {
    projectTitle: params.project.title,
    sceneText: params.sceneText,
    findingsSummary: params.findingsSummary,
    canonEntries: approvedCanon,
  });
}
