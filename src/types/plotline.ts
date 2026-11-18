export type SectionId =
  | 'dashboard'
  | 'stories'
  | 'characters'
  | 'canon'
  | 'plot-board'
  | 'what-if'
  | 'companion'
  | 'settings';

export type CanonStatus = 'canon' | 'experimental' | 'rejected' | 'archived';

export type CanonCategory =
  | 'Character'
  | 'Relationship'
  | 'Worldbuilding'
  | 'Timeline'
  | 'Location'
  | 'Plot'
  | 'Other';

export type CanonSource = 'manual' | 'approved-ai';

export interface CharacterRelationship {
  id: string;
  targetCharacterId?: string;
  targetName: string;
  relationshipType: string;
  currentStatus: string;
  majorConflicts: string;
  hiddenFeelings: string;
}

export interface CharacterProfile {
  id: string;
  fullName: string;
  nickname: string;
  age: string;
  pronouns: string;
  role: string;
  speciesOrIdentity: string;
  occupation: string;
  physicalDescription: string;
  portraitDataUrl?: string;
  // Personality
  coreTraits: string;
  strengths: string;
  flaws: string;
  habits: string;
  fears: string;
  internalContradictions: string;
  // Narrative psychology
  externalGoal: string;
  internalDesire: string;
  centralMotivation: string;
  emotionalWound: string;
  secrets: string;
  moralBoundaries: string;
  characterArc: string;
  // Relationships
  relationships: CharacterRelationship[];
  // Additional info
  backstory: string;
  importantEvents: string;
  authorsNotes: string;
  customTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CanonEntry {
  id: string;
  title: string;
  description: string;
  category: CanonCategory;
  status: CanonStatus;
  linkedCharacterIds: string[];
  source: CanonSource;
  sourceNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type WhatIfChangeType =
  | 'Character motivation'
  | 'Relationship'
  | 'Plot twist'
  | 'Worldbuilding'
  | 'Ending'
  | 'Conflict'
  | 'Other';

export type BranchStatus =
  | 'candidate'
  | 'experimental'
  | 'rejected'
  | 'promoted_partial';

export interface ContinuityConflictFlag {
  id: string;
  description: string;
  relatedCanonTitle: string;
  severity: 'direct-contradiction' | 'potential-tension' | 'needs-decision';
  resolution?:
    | 'pending'
    | 'preserve-canon'
    | 'modify-canon'
    | 'keep-experimental'
    | 'rejected';
}

export interface ProposedCanonChange {
  id: string;
  title: string;
  description: string;
  category: CanonCategory;
  linkedCharacterNames: string[];
  rationale: string;
  decision?: 'pending' | 'approved-canon' | 'saved-experimental' | 'skipped';
}

export interface BranchExpansion {
  id: string;
  prompt: string;
  response: string;
  createdAt: string;
}

export interface NarrativeBranch {
  id: string;
  title: string;
  approachLabel: string;
  premise: string;
  plotConsequences: string[];
  charactersAffected: string[];
  relationshipOrMotivationChanges: string;
  newConflicts: string[];
  emotionalThematicImpact: string;
  continuityConflicts: ContinuityConflictFlag[];
  openQuestions: string[];
  proposedCanonChanges: ProposedCanonChange[];
  status: BranchStatus;
  expansions: BranchExpansion[];
  writerNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhatIfSession {
  id: string;
  question: string;
  changeType: WhatIfChangeType;
  includedExperimentalIds: string[];
  contextNotice: string;
  branches: NarrativeBranch[];
  isSample?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PlotCardType =
  | 'Chapter'
  | 'Scene'
  | 'Major Event'
  | 'Turning Point'
  | 'Character Arc';

export type PlotCardStatus =
  | 'Idea'
  | 'Planned'
  | 'Drafting'
  | 'Revised'
  | 'Complete';

export interface PlotCard {
  id: string;
  title: string;
  cardType: PlotCardType;
  summary: string;
  order: number;
  relatedCharacterIds: string[];
  location: string;
  status: PlotCardStatus;
  authorsNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  savedAsExperimentalNote?: boolean;
  canonWarnings?: string[];
  contextSummary?: string;
}

export interface Conversation {
  id: string;
  title: string;
  attachedBranchIds: string[];
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface StoryProject {
  id: string;
  title: string;
  synopsis: string;
  genres: string[];
  coverType: 'gradient' | 'image';
  coverGradientId: string;
  coverImageDataUrl?: string;
  isSample?: boolean;
  characters: CharacterProfile[];
  canonEntries: CanonEntry[];
  whatIfSessions: WhatIfSession[];
  plotCards: PlotCard[];
  conversations: Conversation[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  writingFontSize: 'small' | 'medium' | 'large';
  sidebarCollapsed: boolean;
  compactCards: boolean;
}

export interface ContinuityFinding {
  summary: string;
  explanation: string;
  relatedCanonTitle: string;
  excerpt: string;
}

export interface ContinuityCheckResult {
  disclaimer: string;
  contextNotice: string;
  potentialContradictions: ContinuityFinding[];
  needsClarification: ContinuityFinding[];
  noConflictDetected: ContinuityFinding[];
}
