import React, { useMemo, useState } from 'react';
import { Plus, Search, UserPlus } from 'lucide-react';
import { createId } from '../store/usePlotlineStore';
import type { CharacterProfile, StoryProject } from '../types/plotline';
import { CharacterEditor } from './CharacterEditor';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface CharacterBibleProps {
  project: StoryProject;
  onUpsertCharacter: (character: CharacterProfile) => void;
  onDeleteCharacter: (characterId: string) => void;
}

function createBlankCharacter(): CharacterProfile {
  const now = new Date().toISOString();
  return {
    id: createId('char'),
    fullName: 'New Character',
    nickname: '',
    age: '',
    pronouns: '',
    role: 'Supporting',
    speciesOrIdentity: '',
    occupation: '',
    physicalDescription: '',
    coreTraits: '',
    strengths: '',
    flaws: '',
    habits: '',
    fears: '',
    internalContradictions: '',
    externalGoal: '',
    internalDesire: '',
    centralMotivation: '',
    emotionalWound: '',
    secrets: '',
    moralBoundaries: '',
    characterArc: '',
    relationships: [],
    backstory: '',
    importantEvents: '',
    authorsNotes: '',
    customTags: [],
    createdAt: now,
    updatedAt: now,
  };
}

export const CharacterBible: React.FC<CharacterBibleProps> = ({
  project,
  onUpsertCharacter,
  onDeleteCharacter,
}) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [pendingDelete, setPendingDelete] = useState<CharacterProfile | null>(null);

  const selectedCharacter = useMemo(
    () => project.characters.find((c) => c.id === selectedCharacterId) ?? null,
    [project.characters, selectedCharacterId]
  );

  const roles = useMemo(() => {
    const set = new Set<string>();
    project.characters.forEach((c) => {
      if (c.role.trim()) set.add(c.role.trim());
    });
    return ['All', ...Array.from(set)];
  }, [project.characters]);

  const filteredCharacters = useMemo(() => {
    return project.characters.filter((c) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        c.nickname.toLowerCase().includes(q) ||
        c.coreTraits.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'All' || c.role.trim() === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [project.characters, query, roleFilter]);

  const handleCreateCharacter = () => {
    const fresh = createBlankCharacter();
    onUpsertCharacter(fresh);
    setSelectedCharacterId(fresh.id);
  };

  if (selectedCharacter) {
    return (
      <>
        <CharacterEditor
          character={selectedCharacter}
          allCharacters={project.characters}
          onChange={onUpsertCharacter}
          onDelete={(ch) => setPendingDelete(ch)}
          onBack={() => setSelectedCharacterId(null)}
        />
        <ConfirmDialog
          open={Boolean(pendingDelete)}
          title="Delete character?"
          message={`Permanently delete "${pendingDelete?.fullName}" from "${project.title}"? This will unlink them from any canon entries or plot cards.`}
          confirmLabel="Delete Character"
          destructive
          onConfirm={() => {
            if (pendingDelete) {
              onDeleteCharacter(pendingDelete.id);
              setSelectedCharacterId(null);
            }
            setPendingDelete(null);
          }}
          onCancel={() => setPendingDelete(null)}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-[#4F3048]">Character Bible</h1>
          <p className="text-sm text-[#6E626C] mt-1">
            Established character dossiers for <span className="font-medium">{project.title}</span>
            . Speculative AI ideas never overwrite these profiles without your explicit approval.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateCharacter}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C53B7D] hover:bg-[#B93778] text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Character</span>
        </button>
      </div>

      {/* Search & Role Filter */}
      {project.characters.length > 0 && (
        <div className="stationery-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8C5B7C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search characters by name, role, or traits..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FFFAFC] border border-[#BA86A6]/30 text-sm text-[#4F3048] placeholder:text-[#BA86A6] focus:border-[#D94F93] focus:outline-none"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter characters by role"
            className="px-3 py-2 rounded-xl bg-[#FFFAFC] border border-[#BA86A6]/30 text-sm text-[#4F3048]"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r === 'All' ? 'All Roles' : r}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Character Gallery */}
      {project.characters.length === 0 ? (
        <div className="stationery-card rounded-3xl p-10 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#FCE4EC] text-[#B93778] flex items-center justify-center mx-auto">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="mt-4 font-editorial text-2xl font-bold text-[#4F3048]">
            No characters yet
          </h2>
          <p className="mt-2 text-sm text-[#6E626C]">
            Create your cast to ground Plotline's Canon Keeper, What-If Engine, and Writing
            Companion in real character motivations and secrets.
          </p>
          <button
            type="button"
            onClick={handleCreateCharacter}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C53B7D] hover:bg-[#B93778] text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Character</span>
          </button>
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="stationery-card rounded-2xl p-8 text-center text-sm text-[#6E626C]">
          No characters match "{query}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCharacters.map((char) => {
            const initials = (char.fullName || 'Ch')
              .split(/\s+/)
              .map((s) => s[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            const summary =
              char.coreTraits ||
              char.centralMotivation ||
              char.physicalDescription ||
              'Profile ready for personality, psychology, and relationship details.';

            const affiliations = [
              ...char.relationships.map((r) => `${r.targetName}`),
              ...char.customTags,
            ].slice(0, 4);

            return (
              <article
                key={char.id}
                className="stationery-card-interactive rounded-2xl p-6 flex flex-col justify-between gap-5 border border-[#EFA7C5]/45"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#EFA7C5]/60 bg-gradient-to-br from-[#FCE4EC] to-[#F3E8F7] flex items-center justify-center shrink-0">
                      {char.portraitDataUrl ? (
                        <img
                          src={char.portraitDataUrl}
                          alt={char.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-editorial text-xl font-bold text-[#B93778]">
                          {initials}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-[#B93778] truncate">
                        {char.role || 'Character'}
                        {char.pronouns ? ` · ${char.pronouns}` : ''}
                      </div>
                      <h3 className="font-editorial text-xl font-bold text-[#4F3048] truncate mt-0.5">
                        {char.fullName}
                      </h3>
                      {char.occupation && (
                        <p className="text-xs text-[#766B74] truncate mt-0.5">{char.occupation}</p>
                      )}
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-[#6E626C] leading-relaxed line-clamp-3">
                    {summary}
                  </p>

                  {affiliations.length > 0 && (
                    <div className="mt-3 text-xs text-[#8C5B7C] truncate">
                      {affiliations.join(' · ')}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#EFA7C5]/25 flex items-center justify-between gap-2">
                  <span className="text-xs text-[#766B74] font-mono-tabular">
                    {char.relationships.length}{' '}
                    {char.relationships.length === 1 ? 'connection' : 'connections'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCharacterId(char.id)}
                    className="px-4 py-2 rounded-xl bg-[#FCE4EC] hover:bg-[#F8C8DC] text-[#4F3048] text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    Open Profile
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
