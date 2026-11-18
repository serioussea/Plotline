import type { CanonCategory, StoryProject } from '../types/plotline';

function triggerDownload(blob: Blob, filename: string): boolean {
  if (!blob || blob.size === 0) return false;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'plotline-story'
  );
}

export interface ExportResult {
  success: boolean;
  filename?: string;
  error?: string;
}

export function exportProjectAsJson(project: StoryProject): ExportResult {
  try {
    const payload = {
      format: 'plotline-project-v1',
      exportedAt: new Date().toISOString(),
      project,
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const filename = `${slugify(project.title)}.plotline.json`;
    const ok = triggerDownload(blob, filename);
    if (!ok) {
      return { success: false, error: 'Failed to generate export file.' };
    }
    return { success: true, filename };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unable to serialize project.',
    };
  }
}

export function exportAllProjectsAsJson(projects: StoryProject[]): ExportResult {
  try {
    const payload = {
      format: 'plotline-workspace-v1',
      exportedAt: new Date().toISOString(),
      projects,
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const filename = `plotline-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    const ok = triggerDownload(blob, filename);
    if (!ok) {
      return { success: false, error: 'Failed to generate workspace backup file.' };
    }
    return { success: true, filename };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unable to serialize workspace.',
    };
  }
}

export function exportProjectAsMarkdown(
  project: StoryProject,
  includeArchived = false
): ExportResult {
  try {
    const lines: string[] = [];
    lines.push(`# ${project.title}`);
    lines.push('');
    if (project.genres.length > 0) {
      lines.push(`**Genres:** ${project.genres.join(' · ')}`);
    }
    lines.push(`**Exported:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
    lines.push('');
    lines.push('## Synopsis');
    lines.push('');
    lines.push(project.synopsis || '_No synopsis written yet._');
    lines.push('');

    lines.push('---');
    lines.push('');
    lines.push('## Cast of Characters');
    lines.push('');
    if (project.characters.length === 0) {
      lines.push('_No characters recorded yet._');
      lines.push('');
    } else {
      for (const ch of project.characters) {
        lines.push(`### ${ch.fullName}${ch.nickname ? ` ("${ch.nickname}")` : ''}`);
        const meta = [ch.role, ch.age && `Age ${ch.age}`, ch.pronouns, ch.occupation]
          .filter(Boolean)
          .join(' · ');
        if (meta) lines.push(`*${meta}*`);
        lines.push('');
        if (ch.physicalDescription) lines.push(`- **Appearance:** ${ch.physicalDescription}`);
        if (ch.coreTraits) lines.push(`- **Core Traits:** ${ch.coreTraits}`);
        if (ch.strengths) lines.push(`- **Strengths:** ${ch.strengths}`);
        if (ch.flaws) lines.push(`- **Flaws:** ${ch.flaws}`);
        if (ch.externalGoal) lines.push(`- **External Goal:** ${ch.externalGoal}`);
        if (ch.internalDesire) lines.push(`- **Internal Desire:** ${ch.internalDesire}`);
        if (ch.centralMotivation) lines.push(`- **Central Motivation:** ${ch.centralMotivation}`);
        if (ch.emotionalWound) lines.push(`- **Emotional Wound:** ${ch.emotionalWound}`);
        if (ch.secrets) lines.push(`- **Secrets:** ${ch.secrets}`);
        if (ch.moralBoundaries) lines.push(`- **Moral Boundaries:** ${ch.moralBoundaries}`);
        if (ch.characterArc) lines.push(`- **Character Arc:** ${ch.characterArc}`);
        if (ch.relationships.length > 0) {
          lines.push('- **Relationships:**');
          for (const rel of ch.relationships) {
            lines.push(
              `  - *${rel.targetName}* (${rel.relationshipType || 'Connection'} — ${rel.currentStatus || 'Active'}): ${rel.majorConflicts || rel.hiddenFeelings || ''}`
            );
          }
        }
        if (ch.backstory) lines.push(`- **Backstory:** ${ch.backstory}`);
        if (ch.authorsNotes) lines.push(`- **Author's Notes:** ${ch.authorsNotes}`);
        lines.push('');
      }
    }

    lines.push('---');
    lines.push('');
    lines.push('## Established Story Canon');
    lines.push('');
    const approvedCanon = project.canonEntries.filter((e) => e.status === 'canon');
    const categories: CanonCategory[] = [
      'Character',
      'Relationship',
      'Worldbuilding',
      'Timeline',
      'Location',
      'Plot',
      'Other',
    ];

    if (approvedCanon.length === 0) {
      lines.push('_No established canon entries yet._');
      lines.push('');
    } else {
      for (const cat of categories) {
        const items = approvedCanon.filter((e) => e.category === cat);
        if (items.length === 0) continue;
        lines.push(`### ${cat}`);
        lines.push('');
        for (const item of items) {
          const linkedNames = item.linkedCharacterIds
            .map((cid) => project.characters.find((c) => c.id === cid)?.fullName)
            .filter(Boolean);
          lines.push(`- **${item.title}**${linkedNames.length ? ` _(${linkedNames.join(', ')})_` : ''}`);
          lines.push(`  ${item.description}`);
        }
        lines.push('');
      }
    }

    const experimentalCanon = project.canonEntries.filter((e) => e.status === 'experimental');
    if (experimentalCanon.length > 0) {
      lines.push('### Experimental Ideas (Not Yet Canon)');
      lines.push('');
      for (const item of experimentalCanon) {
        lines.push(`- **${item.title}** _(${item.category})_: ${item.description}`);
      }
      lines.push('');
    }

    if (includeArchived) {
      const archivedCanon = project.canonEntries.filter((e) => e.status === 'archived');
      if (archivedCanon.length > 0) {
        lines.push('### Archived Reference');
        lines.push('');
        for (const item of archivedCanon) {
          lines.push(`- **${item.title}** _(${item.category})_: ${item.description}`);
        }
        lines.push('');
      }
    }

    lines.push('---');
    lines.push('');
    lines.push('## Plot Outline');
    lines.push('');
    const orderedCards = [...project.plotCards].sort((a, b) => a.order - b.order);
    if (orderedCards.length === 0) {
      lines.push('_No plot cards created yet._');
    } else {
      for (const card of orderedCards) {
        lines.push(`### ${card.order}. ${card.title} (${card.cardType} · ${card.status})`);
        if (card.location) lines.push(`*Location: ${card.location}*`);
        lines.push('');
        lines.push(card.summary || '_No summary yet._');
        if (card.authorsNotes) {
          lines.push('');
          lines.push(`> Author's note: ${card.authorsNotes}`);
        }
        lines.push('');
      }
    }

    const markdown = lines.join('\n');
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const filename = `${slugify(project.title)}-story-bible.md`;
    const ok = triggerDownload(blob, filename);
    if (!ok) {
      return { success: false, error: 'Failed to generate Markdown file.' };
    }
    return { success: true, filename };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unable to export Markdown story bible.',
    };
  }
}

export interface ImportValidationResult {
  valid: boolean;
  projects: StoryProject[];
  error?: string;
}

function normalizeProject(raw: unknown): StoryProject | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.title !== 'string' || !obj.title.trim()) return null;

  const now = new Date().toISOString();
  const id =
    typeof obj.id === 'string' && obj.id.trim()
      ? obj.id
      : `proj-${crypto.randomUUID().slice(0, 8)}`;

  return {
    id,
    title: obj.title.trim(),
    synopsis: typeof obj.synopsis === 'string' ? obj.synopsis : '',
    genres: Array.isArray(obj.genres) ? obj.genres.map(String) : [],
    coverType: obj.coverType === 'image' ? 'image' : 'gradient',
    coverGradientId: typeof obj.coverGradientId === 'string' ? obj.coverGradientId : 'rose-quartz',
    coverImageDataUrl: typeof obj.coverImageDataUrl === 'string' ? obj.coverImageDataUrl : undefined,
    isSample: Boolean(obj.isSample),
    characters: Array.isArray(obj.characters) ? (obj.characters as StoryProject['characters']) : [],
    canonEntries: Array.isArray(obj.canonEntries)
      ? (obj.canonEntries as StoryProject['canonEntries'])
      : [],
    whatIfSessions: Array.isArray(obj.whatIfSessions)
      ? (obj.whatIfSessions as StoryProject['whatIfSessions'])
      : [],
    plotCards: Array.isArray(obj.plotCards) ? (obj.plotCards as StoryProject['plotCards']) : [],
    conversations: Array.isArray(obj.conversations)
      ? (obj.conversations as StoryProject['conversations'])
      : [],
    createdAt: typeof obj.createdAt === 'string' ? obj.createdAt : now,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : now,
  };
}

export function parseAndValidateProjectImport(jsonText: string): ImportValidationResult {
  try {
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, projects: [], error: 'The uploaded JSON file is not a valid object.' };
    }

    if (parsed.format === 'plotline-project-v1' && parsed.project) {
      const p = normalizeProject(parsed.project);
      if (!p) {
        return { valid: false, projects: [], error: 'Project data is missing a valid title or structure.' };
      }
      return { valid: true, projects: [p] };
    }

    if (parsed.format === 'plotline-workspace-v1' && Array.isArray(parsed.projects)) {
      const list = parsed.projects
        .map(normalizeProject)
        .filter((p): p is StoryProject => p !== null);
      if (list.length === 0) {
        return { valid: false, projects: [], error: 'No valid projects were found in the workspace file.' };
      }
      return { valid: true, projects: list };
    }

    // Fallback: direct StoryProject object
    const direct = normalizeProject(parsed);
    if (direct) {
      return { valid: true, projects: [direct] };
    }

    return {
      valid: false,
      projects: [],
      error: 'Unrecognized JSON format. Please choose a file exported from Plotline.',
    };
  } catch {
    return {
      valid: false,
      projects: [],
      error: 'Could not parse JSON. The file may be corrupted or not valid JSON.',
    };
  }
}
