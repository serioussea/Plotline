import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

export interface CanonContextItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  linkedCharacterNames: string[];
}

export interface CharacterContextItem {
  id: string;
  fullName: string;
  nickname?: string;
  role: string;
  coreTraits: string;
  externalGoal: string;
  internalDesire: string;
  centralMotivation: string;
  secrets: string;
  moralBoundaries: string;
  relationshipsSummary: string;
}

export interface ExperimentalBranchContext {
  title: string;
  premise: string;
  plotConsequences: string[];
}

export interface WhatIfGenerationInput {
  projectTitle: string;
  genres: string[];
  synopsis: string;
  question: string;
  changeType: string;
  canonEntries: CanonContextItem[];
  characters: CharacterContextItem[];
  selectedExperiments: ExperimentalBranchContext[];
}

export interface GeneratedBranchPayload {
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
    category:
      | 'Character'
      | 'Relationship'
      | 'Worldbuilding'
      | 'Timeline'
      | 'Location'
      | 'Plot'
      | 'Other';
    linkedCharacterNames: string[];
    rationale: string;
  }>;
}

export interface WhatIfGenerationResult {
  contextNotice: string;
  branches: GeneratedBranchPayload[];
}

export interface ExploreFurtherInput {
  projectTitle: string;
  canonEntries: CanonContextItem[];
  characters: CharacterContextItem[];
  branchTitle: string;
  branchPremise: string;
  branchConsequences: string[];
  followUpPrompt: string;
}

export interface CompanionChatInput {
  projectTitle: string;
  genres: string[];
  synopsis: string;
  canonEntries: CanonContextItem[];
  characters: CharacterContextItem[];
  attachedBranches: ExperimentalBranchContext[];
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  message: string;
}

export interface ContinuityCheckInput {
  projectTitle: string;
  sceneTitle: string;
  sceneText: string;
  canonEntries: CanonContextItem[];
  characters: CharacterContextItem[];
}

export interface ContinuityFindingOutput {
  summary: string;
  explanation: string;
  relatedCanonTitle: string;
  excerpt: string;
}

export interface ContinuityCheckOutput {
  disclaimer: string;
  contextNotice: string;
  potentialContradictions: ContinuityFindingOutput[];
  needsClarification: ContinuityFindingOutput[];
  noConflictDetected: ContinuityFindingOutput[];
}

export interface NarrativeAIProvider {
  readonly providerName: string;
  readonly modelName: string;
  isConfigured(): boolean;
  generateWhatIfBranches(input: WhatIfGenerationInput): Promise<WhatIfGenerationResult>;
  exploreBranchFurther(input: ExploreFurtherInput): Promise<{ expansion: string; contextNotice: string }>;
  chatWithCompanion(input: CompanionChatInput): Promise<{ reply: string; contextNotice: string; canonWarnings: string[] }>;
  checkContinuity(input: ContinuityCheckInput): Promise<ContinuityCheckOutput>;
  suggestSceneRevision(input: {
    projectTitle: string;
    sceneText: string;
    findingsSummary: string;
    canonEntries: CanonContextItem[];
  }): Promise<{ suggestedRevision: string; revisionNotes: string; contextNotice: string }>;
}

const MAX_CANON_ITEMS = 45;
const MAX_CHARACTER_ITEMS = 25;

function buildContextSlice(
  canonEntries: CanonContextItem[],
  characters: CharacterContextItem[]
): {
  canonSlice: CanonContextItem[];
  characterSlice: CharacterContextItem[];
  truncated: boolean;
  contextNotice: string;
} {
  const canonTruncated = canonEntries.length > MAX_CANON_ITEMS;
  const charTruncated = characters.length > MAX_CHARACTER_ITEMS;
  const canonSlice = canonEntries.slice(0, MAX_CANON_ITEMS);
  const characterSlice = characters.slice(0, MAX_CHARACTER_ITEMS);
  const truncated = canonTruncated || charTruncated;

  const contextNotice = truncated
    ? `Context limit notice: Plotline sent ${canonSlice.length} of ${canonEntries.length} canon entries and ${characterSlice.length} of ${characters.length} character profiles to keep responses reliable.`
    : `Grounded in ${canonSlice.length} approved canon ${canonSlice.length === 1 ? 'entry' : 'entries'} and ${characterSlice.length} character ${characterSlice.length === 1 ? 'profile' : 'profiles'}.`;

  return { canonSlice, characterSlice, truncated, contextNotice };
}

function formatStoryContext(
  projectTitle: string,
  genres: string[],
  synopsis: string,
  canonSlice: CanonContextItem[],
  characterSlice: CharacterContextItem[],
  attachedBranches: ExperimentalBranchContext[] = []
): string {
  const canonText =
    canonSlice.length > 0
      ? canonSlice
          .map(
            (c, i) =>
              `${i + 1}. [${c.category} · ${c.status.toUpperCase()}] "${c.title}": ${c.description}${
                c.linkedCharacterNames.length > 0
                  ? ` (Linked characters: ${c.linkedCharacterNames.join(', ')})`
                  : ''
              }`
          )
          .join('\n')
      : 'None yet (no established canon entries have been recorded).';

  const charText =
    characterSlice.length > 0
      ? characterSlice
          .map(
            (ch) =>
              `- ${ch.fullName}${ch.nickname ? ` ("${ch.nickname}")` : ''} [${ch.role || 'Unspecified role'}]\n  Traits: ${ch.coreTraits || '—'}\n  Goal: ${ch.externalGoal || '—'} | Desire: ${ch.internalDesire || '—'} | Motivation: ${ch.centralMotivation || '—'}\n  Secrets: ${ch.secrets || '—'} | Moral boundaries: ${ch.moralBoundaries || '—'}\n  Relationships: ${ch.relationshipsSummary || '—'}`
          )
          .join('\n')
      : 'No character profiles yet.';

  const expText =
    attachedBranches.length > 0
      ? `\nEXPLICITLY ATTACHED EXPERIMENTAL BRANCHES (NOT ESTABLISHED CANON — treat strictly as speculative hypotheses):\n${attachedBranches
          .map(
            (b, i) =>
              `${i + 1}. "${b.title}": ${b.premise}\n   Consequences: ${b.plotConsequences.join('; ')}`
          )
          .join('\n')}`
      : '';

  return `STORY PROJECT: "${projectTitle}"
GENRES: ${genres.length > 0 ? genres.join(', ') : 'Unspecified'}
SYNOPSIS: ${synopsis || 'No synopsis provided yet.'}

APPROVED ESTABLISHED CANON (Authoritative facts — never treat as speculative):
${canonText}

ESTABLISHED CHARACTER PROFILES (Authoritative character details):
${charText}${expText}`;
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? Number((err as { status?: number }).status)
          : 0;
      if (status === 400 || status === 401 || status === 403 || status === 404) {
        throw err;
      }
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
      }
    }
  }
  throw lastError;
}

export class GeminiNarrativeProvider implements NarrativeAIProvider {
  readonly providerName = 'gemini';
  readonly modelName = 'gemini-4-hydrogen';

  private getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      const error = new Error(
        'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in Settings > Secrets.'
      );
      (error as Error & { status?: number }).status = 503;
      throw error;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  isConfigured(): boolean {
    const apiKey = process.env.GEMINI_API_KEY;
    return Boolean(apiKey && apiKey.trim().length > 0 && apiKey !== 'MY_GEMINI_API_KEY');
  }

  async generateWhatIfBranches(input: WhatIfGenerationInput): Promise<WhatIfGenerationResult> {
    const ai = this.getClient();
    const { canonSlice, characterSlice, contextNotice } = buildContextSlice(
      input.canonEntries,
      input.characters
    );

    const storyContext = formatStoryContext(
      input.projectTitle,
      input.genres,
      input.synopsis,
      canonSlice,
      characterSlice,
      input.selectedExperiments
    );

    const systemInstruction = `You are Plotline's What-If Engine, an insightful literary story-architecture partner.
CRITICAL RULES FOR CANON INTEGRITY:
1. Distinguish sharply between:
   - Existing established canon & character facts (provided in the prompt)
   - Reasonable narrative inference
   - New speculative suggestions
   - Potential contradictions with established canon
2. NEVER claim that a new invention you suggest was already confirmed by the writer.
3. Generate EXACTLY THREE genuinely distinct narrative directions responding to the writer's What-If question. Avoid minor variations of the same idea; each branch should offer a meaningfully different narrative engine (for example, psychological interiority vs. escalating external conflict vs. structural/thematic subversion, tailored authentically to the story's genre).
4. Whenever a branch's consequences would clash with an established canon entry or character boundary/secret, explicitly report it in continuityConflicts and cite the exact canon entry title.
5. In proposedCanonChanges, offer discrete, atomic fact proposals that the writer can individually approve or skip if they choose to adopt parts of the branch.`;

    const prompt = `${storyContext}

WRITER'S HYPOTHETICAL QUESTION:
"${input.question}"
FOCUS TYPE: ${input.changeType}

Generate 3 richly developed, distinct narrative branches in strict JSON matching the schema.`;

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              branches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    approachLabel: {
                      type: Type.STRING,
                      description:
                        'Short 2-4 word label describing the narrative lens (e.g., Psychological Spiral, Political Escalation, Quiet Subversion).',
                    },
                    premise: { type: Type.STRING },
                    plotConsequences: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    charactersAffected: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    relationshipOrMotivationChanges: { type: Type.STRING },
                    newConflicts: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    emotionalThematicImpact: { type: Type.STRING },
                    continuityConflicts: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          description: { type: Type.STRING },
                          relatedCanonTitle: { type: Type.STRING },
                          severity: {
                            type: Type.STRING,
                            enum: [
                              'direct-contradiction',
                              'potential-tension',
                              'needs-decision',
                            ],
                          },
                        },
                        required: ['description', 'relatedCanonTitle', 'severity'],
                      },
                    },
                    openQuestions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    proposedCanonChanges: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          category: {
                            type: Type.STRING,
                            enum: [
                              'Character',
                              'Relationship',
                              'Worldbuilding',
                              'Timeline',
                              'Location',
                              'Plot',
                              'Other',
                            ],
                          },
                          linkedCharacterNames: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          rationale: { type: Type.STRING },
                        },
                        required: [
                          'title',
                          'description',
                          'category',
                          'linkedCharacterNames',
                          'rationale',
                        ],
                      },
                    },
                  },
                  required: [
                    'title',
                    'approachLabel',
                    'premise',
                    'plotConsequences',
                    'charactersAffected',
                    'relationshipOrMotivationChanges',
                    'newConflicts',
                    'emotionalThematicImpact',
                    'continuityConflicts',
                    'openQuestions',
                    'proposedCanonChanges',
                  ],
                },
              },
            },
            required: ['branches'],
          },
        },
      })
    );

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      throw new Error('The AI returned an empty response. Please try again.');
    }

    let parsed: { branches?: GeneratedBranchPayload[] };
    try {
      parsed = JSON.parse(rawText) as { branches?: GeneratedBranchPayload[] };
    } catch {
      throw new Error('The AI response was not valid JSON. Please retry.');
    }

    if (!Array.isArray(parsed.branches) || parsed.branches.length === 0) {
      throw new Error('The AI did not return structured narrative branches. Please retry.');
    }

    return {
      contextNotice,
      branches: parsed.branches.slice(0, 3).map((b) => ({
        title: String(b.title || 'Untitled Narrative Direction'),
        approachLabel: String(b.approachLabel || 'Alternative Direction'),
        premise: String(b.premise || ''),
        plotConsequences: Array.isArray(b.plotConsequences) ? b.plotConsequences.map(String) : [],
        charactersAffected: Array.isArray(b.charactersAffected)
          ? b.charactersAffected.map(String)
          : [],
        relationshipOrMotivationChanges: String(b.relationshipOrMotivationChanges || ''),
        newConflicts: Array.isArray(b.newConflicts) ? b.newConflicts.map(String) : [],
        emotionalThematicImpact: String(b.emotionalThematicImpact || ''),
        continuityConflicts: Array.isArray(b.continuityConflicts) ? b.continuityConflicts : [],
        openQuestions: Array.isArray(b.openQuestions) ? b.openQuestions.map(String) : [],
        proposedCanonChanges: Array.isArray(b.proposedCanonChanges)
          ? b.proposedCanonChanges
          : [],
      })),
    };
  }

  async exploreBranchFurther(
    input: ExploreFurtherInput
  ): Promise<{ expansion: string; contextNotice: string }> {
    const ai = this.getClient();
    const { canonSlice, characterSlice, contextNotice } = buildContextSlice(
      input.canonEntries,
      input.characters
    );

    const storyContext = formatStoryContext(
      input.projectTitle,
      [],
      '',
      canonSlice,
      characterSlice
    );

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: this.modelName,
        contents: `${storyContext}

EXPERIMENTAL BRANCH BEING EXPLORED (Not established canon):
Title: "${input.branchTitle}"
Premise: ${input.branchPremise}
Consequences: ${input.branchConsequences.join('; ')}

WRITER'S FOLLOW-UP REQUEST:
${input.followUpPrompt}

Develop this speculative branch further. Clearly separate what aligns with existing canon, what is a new speculative invention, and any new continuity questions this raises for the writer.`,
        config: {
          systemInstruction:
            'You are a collaborative literary editor helping a writer stress-test an experimental narrative branch without overwriting established story canon. Write clearly with structured prose and short sections.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      })
    );

    const expansion = (response.text ?? '').trim();
    if (!expansion) {
      throw new Error('The AI returned an empty expansion. Please try again.');
    }

    return { expansion, contextNotice };
  }

  async chatWithCompanion(
    input: CompanionChatInput
  ): Promise<{ reply: string; contextNotice: string; canonWarnings: string[] }> {
    const ai = this.getClient();
    const { canonSlice, characterSlice, contextNotice } = buildContextSlice(
      input.canonEntries,
      input.characters
    );

    const storyContext = formatStoryContext(
      input.projectTitle,
      input.genres,
      input.synopsis,
      canonSlice,
      characterSlice,
      input.attachedBranches
    );

    const systemInstruction = `You are Plotline's AI Writing Companion — a thoughtful, candid, craft-focused story-development partner for novelists, screenwriters, and narrative designers.

CORE PRINCIPLES:
1. Respect Canon Authority: Only the "APPROVED ESTABLISHED CANON" and "ESTABLISHED CHARACTER PROFILES" provided below are confirmed facts of the story. Any attached experimental branches or brainstorming ideas in this chat are speculative and NOT canon.
2. Constructive Honesty: Do not reflexively praise every idea. Offer grounded craft critique (pacing, motivation gaps, dramatic tension, thematic resonance) alongside concrete, evocative options.
3. Writer Autonomy: Offer possibilities and questions rather than dictating a single "correct" plot. Respect the writer's genre and tone.
4. Canon Contradiction Alert: If your suggestion or the user's idea conflicts with an approved canon entry or character boundary, point it out explicitly and kindly, citing the canon entry title.

ACTIVE PROJECT CONTEXT:
${storyContext}`;

    const recentHistory = input.history.slice(-14).map((msg) => ({
      role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: this.modelName,
      history: recentHistory,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const response = await withRetry(() => chat.sendMessage({ message: input.message }));
    const reply = (response.text ?? '').trim();
    if (!reply) {
      throw new Error('The AI Writing Companion returned an empty response.');
    }

    const canonWarnings: string[] = [];
    const lowerReply = reply.toLowerCase();
    for (const entry of canonSlice) {
      if (
        lowerReply.includes('contradict') ||
        lowerReply.includes('conflict with canon') ||
        lowerReply.includes('conflicts with')
      ) {
        if (lowerReply.includes(entry.title.toLowerCase())) {
          canonWarnings.push(entry.title);
        }
      }
    }

    return {
      reply,
      contextNotice,
      canonWarnings: Array.from(new Set(canonWarnings)),
    };
  }

  async checkContinuity(input: ContinuityCheckInput): Promise<ContinuityCheckOutput> {
    const ai = this.getClient();
    const { canonSlice, characterSlice, contextNotice } = buildContextSlice(
      input.canonEntries,
      input.characters
    );

    const storyContext = formatStoryContext(
      input.projectTitle,
      [],
      '',
      canonSlice,
      characterSlice
    );

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: this.modelName,
        contents: `${storyContext}

SCENE TITLE: ${input.sceneTitle || 'Untitled Scene'}
SCENE DRAFT TO REVIEW:
"""
${input.sceneText}
"""

Carefully review the scene draft against the approved canon entries and character profiles. Look for conflicting character details, timeline inconsistencies, relationship contradictions, violations of worldbuilding rules, inconsistent motivations, or information characters should not yet know.
Never claim the scene is definitively consistent—note what has no detected conflict based ONLY on the provided entries, and clearly identify ambiguities or potential contradictions.`,
        config: {
          systemInstruction:
            'You are a meticulous continuity editor. Compare the draft scene strictly against the approved canon and character profiles provided. Reference exact canon titles whenever possible. Never invent unstated canon facts.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              potentialContradictions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    summary: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    relatedCanonTitle: { type: Type.STRING },
                    excerpt: { type: Type.STRING },
                  },
                  required: ['summary', 'explanation', 'relatedCanonTitle', 'excerpt'],
                },
              },
              needsClarification: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    summary: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    relatedCanonTitle: { type: Type.STRING },
                    excerpt: { type: Type.STRING },
                  },
                  required: ['summary', 'explanation', 'relatedCanonTitle', 'excerpt'],
                },
              },
              noConflictDetected: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    summary: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    relatedCanonTitle: { type: Type.STRING },
                    excerpt: { type: Type.STRING },
                  },
                  required: ['summary', 'explanation', 'relatedCanonTitle', 'excerpt'],
                },
              },
            },
            required: ['potentialContradictions', 'needsClarification', 'noConflictDetected'],
          },
        },
      })
    );

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      throw new Error('Continuity analysis returned an empty response.');
    }

    let parsed: {
      potentialContradictions?: ContinuityFindingOutput[];
      needsClarification?: ContinuityFindingOutput[];
      noConflictDetected?: ContinuityFindingOutput[];
    };

    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error('Continuity analysis returned malformed data. Please retry.');
    }

    return {
      disclaimer:
        'AI continuity analysis may be incomplete. Findings reflect only the approved canon entries and character profiles included in this check; an absence of flagged conflicts does not guarantee full story consistency.',
      contextNotice,
      potentialContradictions: Array.isArray(parsed.potentialContradictions)
        ? parsed.potentialContradictions
        : [],
      needsClarification: Array.isArray(parsed.needsClarification)
        ? parsed.needsClarification
        : [],
      noConflictDetected: Array.isArray(parsed.noConflictDetected)
        ? parsed.noConflictDetected
        : [],
    };
  }

  async suggestSceneRevision(input: {
    projectTitle: string;
    sceneText: string;
    findingsSummary: string;
    canonEntries: CanonContextItem[];
  }): Promise<{ suggestedRevision: string; revisionNotes: string; contextNotice: string }> {
    const ai = this.getClient();
    const { canonSlice, contextNotice } = buildContextSlice(input.canonEntries, []);

    const canonList = canonSlice
      .map((c) => `- "${c.title}" (${c.category}): ${c.description}`)
      .join('\n');

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: this.modelName,
        contents: `PROJECT: "${input.projectTitle}"
APPROVED CANON:
${canonList || 'None provided.'}

CONTINUITY FINDINGS TO ADDRESS:
${input.findingsSummary}

ORIGINAL SCENE:
"""
${input.sceneText}
"""

Provide an optional revised version of the scene that preserves the writer's voice and resolves the continuity points above, plus concise notes explaining what changed.`,
        config: {
          systemInstruction:
            'You are a careful literary copyeditor. Preserve the author’s voice, rhythm, and prose style while aligning only the flagged continuity details with established canon.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedRevision: { type: Type.STRING },
              revisionNotes: { type: Type.STRING },
            },
            required: ['suggestedRevision', 'revisionNotes'],
          },
        },
      })
    );

    const raw = (response.text ?? '').trim();
    const parsed = JSON.parse(raw) as {
      suggestedRevision?: string;
      revisionNotes?: string;
    };

    return {
      suggestedRevision: String(parsed.suggestedRevision || ''),
      revisionNotes: String(parsed.revisionNotes || ''),
      contextNotice,
    };
  }
}

export const aiProvider: NarrativeAIProvider = new GeminiNarrativeProvider();
