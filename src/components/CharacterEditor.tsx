import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { createId } from '../store/usePlotlineStore';
import type { CharacterProfile, CharacterRelationship } from '../types/plotline';

interface CharacterEditorProps {
  character: CharacterProfile;
  allCharacters: CharacterProfile[];
  onChange: (updated: CharacterProfile) => void;
  onDelete: (character: CharacterProfile) => void;
  onBack: () => void;
}

type SectionKey = 'basic' | 'personality' | 'psychology' | 'relationships' | 'additional';

export const CharacterEditor: React.FC<CharacterEditorProps> = ({
  character,
  allCharacters,
  onChange,
  onDelete,
  onBack,
}) => {
  const [draft, setDraft] = useState<CharacterProfile>(character);
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    basic: true,
    personality: true,
    psychology: true,
    relationships: true,
    additional: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setDraft(character);
  }, [character.id]);

  const commitChange = (next: CharacterProfile) => {
    setDraft(next);
    onChange(next);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1400);
  };

  const updateField = <K extends keyof CharacterProfile>(field: K, value: CharacterProfile[K]) => {
    commitChange({
      ...draft,
      [field]: value,
    });
  };

  const toggleSection = (key: SectionKey) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 480;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          updateField('portraitDataUrl', canvas.toDataURL('image/jpeg', 0.82));
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addRelationship = () => {
    const otherChars = allCharacters.filter((c) => c.id !== draft.id);
    const firstTarget = otherChars[0];
    const newRel: CharacterRelationship = {
      id: createId('rel'),
      targetCharacterId: firstTarget?.id,
      targetName: firstTarget?.fullName || '',
      relationshipType: '',
      currentStatus: '',
      majorConflicts: '',
      hiddenFeelings: '',
    };
    updateField('relationships', [...draft.relationships, newRel]);
  };

  const updateRelationship = (
    relId: string,
    patch: Partial<CharacterRelationship>
  ) => {
    updateField(
      'relationships',
      draft.relationships.map((r) => (r.id === relId ? { ...r, ...patch } : r))
    );
  };

  const removeRelationship = (relId: string) => {
    updateField(
      'relationships',
      draft.relationships.filter((r) => r.id !== relId)
    );
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!draft.customTags.includes(t)) {
      updateField('customTags', [...draft.customTags, t]);
    }
    setTagInput('');
  };

  const initials = (draft.fullName || 'Ch')
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const renderSectionHeader = (key: SectionKey, title: string, subtitle: string) => {
    const isOpen = expanded[key];
    return (
      <button
        type="button"
        onClick={() => toggleSection(key)}
        aria-expanded={isOpen}
        className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#FFF5F9]/70 transition-colors"
      >
        <div>
          <h3 className="font-editorial text-xl font-bold text-[#4F3048]">{title}</h3>
          <p className="text-xs text-[#766B74] mt-0.5">{subtitle}</p>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-[#8C5B7C] shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-[#8C5B7C] shrink-0" />
        )}
      </button>
    );
  };

  const inputClass =
    'mt-1.5 w-full px-3.5 py-2 rounded-xl bg-[#FFFAFC] border border-[#BA86A6]/35 text-sm text-[#4F3048] placeholder:text-[#BA86A6] focus:border-[#D94F93] focus:bg-white focus:outline-none';

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#EFA7C5]/60 text-sm font-medium text-[#4F3048] hover:bg-[#FCE4EC]/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#D94F93]" />
          <span>Back to Character Bible</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E626C] px-3 py-1.5 rounded-xl bg-white border border-[#EFA7C5]/40">
            <Check className={`w-3.5 h-3.5 ${justSaved ? 'text-[#D94F93]' : 'text-[#8C5B7C]'}`} />
            <span>{justSaved ? 'Changes saved' : 'Autosaves on edit'}</span>
          </div>

          <button
            type="button"
            onClick={() => onDelete(draft)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EFA7C5]/60 text-sm font-medium text-[#B93778] hover:bg-[#FCE4EC] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Character</span>
          </button>
        </div>
      </div>

      {/* Character Header Banner */}
      <div className="stationery-card rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center gap-6 bg-gradient-to-r from-[#FFFAFC] via-[#FFF4F8] to-[#F3E8F7]/50">
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-[#EFA7C5]/60 bg-gradient-to-br from-[#FCE4EC] to-[#F3E8F7] flex items-center justify-center shrink-0">
          {draft.portraitDataUrl ? (
            <img
              src={draft.portraitDataUrl}
              alt={draft.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-editorial text-3xl font-bold text-[#B93778]">{initials}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-[#B93778]">
            {draft.role || 'Character Profile'}
            {draft.pronouns ? ` · ${draft.pronouns}` : ''}
            {draft.age ? ` · Age ${draft.age}` : ''}
          </div>
          <h2 className="font-editorial text-3xl font-bold text-[#4F3048] truncate mt-1">
            {draft.fullName || 'Unnamed Character'}
          </h2>
          {draft.nickname && (
            <p className="text-sm text-[#6E626C] mt-0.5">Known as "{draft.nickname}"</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EFA7C5]/60 hover:bg-[#FCE4EC]/60 text-xs font-medium text-[#4F3048] cursor-pointer transition-colors">
              <ImageIcon className="w-3.5 h-3.5 text-[#D94F93]" />
              <span>{draft.portraitDataUrl ? 'Change Portrait' : 'Upload Portrait'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePortraitUpload}
                className="sr-only"
              />
            </label>
            {draft.portraitDataUrl && (
              <button
                type="button"
                onClick={() => updateField('portraitDataUrl', undefined)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#BA86A6]/35 text-xs text-[#6E626C] hover:text-[#B93778]"
              >
                Remove Portrait
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section 1: Basic Information */}
      <section className="stationery-card rounded-2xl overflow-hidden">
        {renderSectionHeader('basic', 'Basic Information', 'Identity, role in the narrative, and physical presence')}
        {expanded.basic && (
          <div className="px-6 pb-6 pt-2 border-t border-[#EFA7C5]/25 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Full Name</label>
              <input
                type="text"
                value={draft.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="e.g., Clara Vance"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Nickname / Alias</label>
              <input
                type="text"
                value={draft.nickname}
                onChange={(e) => updateField('nickname', e.target.value)}
                placeholder="e.g., Clarry"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Age</label>
              <input
                type="text"
                value={draft.age}
                onChange={(e) => updateField('age', e.target.value)}
                placeholder="e.g., 24"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Pronouns</label>
              <input
                type="text"
                value={draft.pronouns}
                onChange={(e) => updateField('pronouns', e.target.value)}
                placeholder="e.g., she/her"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Role in Story</label>
              <input
                type="text"
                value={draft.role}
                onChange={(e) => updateField('role', e.target.value)}
                placeholder="e.g., Protagonist, Foil, Antagonist"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Species or Identity</label>
              <input
                type="text"
                value={draft.speciesOrIdentity}
                onChange={(e) => updateField('speciesOrIdentity', e.target.value)}
                placeholder="e.g., Human, Fae, Android"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#4F3048]">Occupation</label>
              <input
                type="text"
                value={draft.occupation}
                onChange={(e) => updateField('occupation', e.target.value)}
                placeholder="e.g., Junior Archivist at the Vitreous Conservatory"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#4F3048]">Physical Description</label>
              <textarea
                rows={3}
                value={draft.physicalDescription}
                onChange={(e) => updateField('physicalDescription', e.target.value)}
                placeholder="Distinctive silhouette, attire, voice, posture, sensory details..."
                className={`${inputClass} writing-prose`}
              />
            </div>
          </div>
        )}
      </section>

      {/* Section 2: Personality */}
      <section className="stationery-card rounded-2xl overflow-hidden">
        {renderSectionHeader('personality', 'Personality', 'Temperament, contradictions, habits, and vulnerabilities')}
        {expanded.personality && (
          <div className="px-6 pb-6 pt-2 border-t border-[#EFA7C5]/25 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#4F3048]">Core Personality Traits</label>
              <input
                type="text"
                value={draft.coreTraits}
                onChange={(e) => updateField('coreTraits', e.target.value)}
                placeholder="e.g., Observant, meticulous, quietly stubborn, empathetic"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Strengths</label>
              <textarea
                rows={2}
                value={draft.strengths}
                onChange={(e) => updateField('strengths', e.target.value)}
                className={`${inputClass} writing-prose`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Flaws</label>
              <textarea
                rows={2}
                value={draft.flaws}
                onChange={(e) => updateField('flaws', e.target.value)}
                className={`${inputClass} writing-prose`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Habits & Mannerisms</label>
              <textarea
                rows={2}
                value={draft.habits}
                onChange={(e) => updateField('habits', e.target.value)}
                className={`${inputClass} writing-prose`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Fears</label>
              <textarea
                rows={2}
                value={draft.fears}
                onChange={(e) => updateField('fears', e.target.value)}
                className={`${inputClass} writing-prose`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#4F3048]">Internal Contradictions</label>
              <textarea
                rows={2}
                value={draft.internalContradictions}
                onChange={(e) => updateField('internalContradictions', e.target.value)}
                placeholder="Where do their values clash with their actions?"
                className={`${inputClass} writing-prose`}
              />
            </div>
          </div>
        )}
      </section>

      {/* Section 3: Narrative Psychology */}
      <section className="stationery-card rounded-2xl overflow-hidden">
        {renderSectionHeader('psychology', 'Narrative Psychology', 'Desires, wounds, secrets, and moral lines they will not cross')}
        {expanded.psychology && (
          <div className="px-6 pb-6 pt-2 border-t border-[#EFA7C5]/25 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">External Goal</label>
              <textarea
                rows={2}
                value={draft.externalGoal}
                onChange={(e) => updateField('externalGoal', e.target.value)}
                placeholder="What concrete outcome are they pursuing?"
                className={`${inputClass} writing-prose`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Internal Desire</label>
              <textarea
                rows={2}
                value={draft.internalDesire}
                onChange={(e) => updateField('internalDesire', e.target.value)}
                placeholder="What emotional need underlies their choices?"
                className={`${inputClass} writing-prose`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Central Motivation</label>
              <textarea
                rows={2}
                value={draft.centralMotivation}
                onChange={(e) => updateField('centralMotivation', e.target.value)}
                className={`${inputClass} writing-prose`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Emotional Wound</label>
              <textarea
                rows={2}
                value={draft.emotionalWound}
                onChange={(e) => updateField('emotionalWound', e.target.value)}
                className={`${inputClass} writing-prose`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Secrets</label>
              <textarea
                rows={2}
                value={draft.secrets}
                onChange={(e) => updateField('secrets', e.target.value)}
                className={`${inputClass} writing-prose`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Moral Boundaries</label>
              <textarea
                rows={2}
                value={draft.moralBoundaries}
                onChange={(e) => updateField('moralBoundaries', e.target.value)}
                className={`${inputClass} writing-prose`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#4F3048]">Character Arc</label>
              <textarea
                rows={2}
                value={draft.characterArc}
                onChange={(e) => updateField('characterArc', e.target.value)}
                placeholder="How do they transform (or resist transformation) across the story?"
                className={`${inputClass} writing-prose`}
              />
            </div>
          </div>
        )}
      </section>

      {/* Section 4: Relationships */}
      <section className="stationery-card rounded-2xl overflow-hidden">
        {renderSectionHeader('relationships', 'Relationships', 'Connections, tensions, and unspoken dynamics with other cast members')}
        {expanded.relationships && (
          <div className="px-6 pb-6 pt-2 border-t border-[#EFA7C5]/25 space-y-4">
            {draft.relationships.length === 0 ? (
              <p className="text-sm text-[#766B74]">
                No relationships recorded yet. Add a dynamic with another character below.
              </p>
            ) : (
              <div className="space-y-4">
                {draft.relationships.map((rel) => {
                  const otherChars = allCharacters.filter((c) => c.id !== draft.id);
                  return (
                    <div
                      key={rel.id}
                      className="rounded-2xl p-4 bg-[#FFF5F9]/75 border border-[#EFA7C5]/40 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                          <div>
                            <label className="block text-xs font-medium text-[#4F3048]">
                              Character
                            </label>
                            {otherChars.length > 0 ? (
                              <select
                                value={rel.targetCharacterId || '__custom__'}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === '__custom__') {
                                    updateRelationship(rel.id, {
                                      targetCharacterId: undefined,
                                    });
                                  } else {
                                    const found = otherChars.find((c) => c.id === val);
                                    updateRelationship(rel.id, {
                                      targetCharacterId: val,
                                      targetName: found?.fullName || '',
                                    });
                                  }
                                }}
                                className={inputClass}
                              >
                                {otherChars.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.fullName}
                                  </option>
                                ))}
                                <option value="__custom__">Other / External Character</option>
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={rel.targetName}
                                onChange={(e) =>
                                  updateRelationship(rel.id, { targetName: e.target.value })
                                }
                                placeholder="Character name"
                                className={inputClass}
                              />
                            )}
                            {otherChars.length > 0 && !rel.targetCharacterId && (
                              <input
                                type="text"
                                value={rel.targetName}
                                onChange={(e) =>
                                  updateRelationship(rel.id, { targetName: e.target.value })
                                }
                                placeholder="Enter character name"
                                className={inputClass}
                              />
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-[#4F3048]">
                              Relationship Type
                            </label>
                            <input
                              type="text"
                              value={rel.relationshipType}
                              onChange={(e) =>
                                updateRelationship(rel.id, { relationshipType: e.target.value })
                              }
                              placeholder="e.g., Siblings, Rivals, Slow-Burn Romance"
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeRelationship(rel.id)}
                          className="p-2 rounded-lg text-[#766B74] hover:text-[#B93778] hover:bg-white self-start"
                          aria-label="Remove relationship"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[#4F3048]">
                            Current Status
                          </label>
                          <input
                            type="text"
                            value={rel.currentStatus}
                            onChange={(e) =>
                              updateRelationship(rel.id, { currentStatus: e.target.value })
                            }
                            placeholder="e.g., Estranged, Guarded trust"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#4F3048]">
                            Major Conflicts
                          </label>
                          <input
                            type="text"
                            value={rel.majorConflicts}
                            onChange={(e) =>
                              updateRelationship(rel.id, { majorConflicts: e.target.value })
                            }
                            placeholder="Where do they collide?"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#4F3048]">
                            Hidden Feelings or Motivations
                          </label>
                          <input
                            type="text"
                            value={rel.hiddenFeelings}
                            onChange={(e) =>
                              updateRelationship(rel.id, { hiddenFeelings: e.target.value })
                            }
                            placeholder="What goes unsaid?"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={addRelationship}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FCE4EC] hover:bg-[#F8C8DC] text-[#4F3048] text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4 text-[#B93778]" />
              <span>Add Relationship</span>
            </button>
          </div>
        )}
      </section>

      {/* Section 5: Additional Information */}
      <section className="stationery-card rounded-2xl overflow-hidden">
        {renderSectionHeader('additional', 'Additional Information', 'Backstory, key timeline events, author notes, and custom tags')}
        {expanded.additional && (
          <div className="px-6 pb-6 pt-2 border-t border-[#EFA7C5]/25 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Backstory</label>
              <textarea
                rows={3}
                value={draft.backstory}
                onChange={(e) => updateField('backstory', e.target.value)}
                className={`${inputClass} writing-prose`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Important Events</label>
              <textarea
                rows={2}
                value={draft.importantEvents}
                onChange={(e) => updateField('importantEvents', e.target.value)}
                className={`${inputClass} writing-prose`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Author's Notes</label>
              <textarea
                rows={2}
                value={draft.authorsNotes}
                onChange={(e) => updateField('authorsNotes', e.target.value)}
                className={`${inputClass} writing-prose`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#4F3048]">Custom Tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {draft.customTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE4EC] text-xs font-medium text-[#4F3048]"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          'customTags',
                          draft.customTags.filter((t) => t !== tag)
                        )
                      }
                      aria-label={`Remove tag ${tag}`}
                      className="text-[#8C5B7C] hover:text-[#B93778]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2 max-w-md">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag (e.g., Point-of-View)..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="mt-1.5 px-3.5 py-2 rounded-xl bg-[#FCE4EC] hover:bg-[#F8C8DC] text-xs font-semibold text-[#4F3048] whitespace-nowrap"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
