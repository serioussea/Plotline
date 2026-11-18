import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Plus, X } from 'lucide-react';
import { COVER_GRADIENTS, GENRE_OPTIONS } from '../data/sampleProject';
import type { StoryProject } from '../types/plotline';

interface ProjectEditorProps {
  open: boolean;
  initialProject?: StoryProject | null;
  onSave: (data: {
    title: string;
    synopsis: string;
    genres: string[];
    coverType: 'gradient' | 'image';
    coverGradientId: string;
    coverImageDataUrl?: string;
  }) => void;
  onClose: () => void;
}

export const ProjectEditor: React.FC<ProjectEditorProps> = ({
  open,
  initialProject,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState('');
  const [coverType, setCoverType] = useState<'gradient' | 'image'>('gradient');
  const [coverGradientId, setCoverGradientId] = useState(COVER_GRADIENTS[0].id);
  const [coverImageDataUrl, setCoverImageDataUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initialProject) {
      setTitle(initialProject.title);
      setSynopsis(initialProject.synopsis);
      setGenres(initialProject.genres);
      setCoverType(initialProject.coverType);
      setCoverGradientId(initialProject.coverGradientId);
      setCoverImageDataUrl(initialProject.coverImageDataUrl);
    } else {
      setTitle('');
      setSynopsis('');
      setGenres([]);
      setCoverType('gradient');
      setCoverGradientId(COVER_GRADIENTS[0].id);
      setCoverImageDataUrl(undefined);
    }
    setCustomGenre('');
    setError(null);
  }, [open, initialProject]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const toggleGenre = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const addCustomGenre = () => {
    const trimmed = customGenre.trim();
    if (!trimmed) return;
    if (!genres.includes(trimmed)) {
      setGenres((prev) => [...prev, trimmed]);
    }
    setCustomGenre('');
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 900;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setCoverImageDataUrl(canvas.toDataURL('image/jpeg', 0.82));
          setCoverType('image');
          setError(null);
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please give your story a title.');
      return;
    }
    onSave({
      title: title.trim(),
      synopsis: synopsis.trim(),
      genres,
      coverType,
      coverGradientId,
      coverImageDataUrl,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4F3048]/35 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-editor-title"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-[#FFFAFC] border border-[#EFA7C5]/50 shadow-2xl overflow-hidden my-8">
        <div className="px-6 py-5 bg-gradient-to-r from-[#FCE4EC]/75 to-[#F3E8F7]/65 border-b border-[#EFA7C5]/35 flex items-center justify-between">
          <div>
            <h2
              id="project-editor-title"
              className="font-editorial text-2xl font-bold text-[#4F3048]"
            >
              {initialProject ? 'Edit Story Project' : 'Create New Story'}
            </h2>
            <p className="text-xs text-[#6E626C] mt-0.5">
              Each story keeps its own isolated characters, canon, branches, and companion chats.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#6E626C] hover:text-[#4F3048] hover:bg-white/80 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-[#FCE4EC] border border-[#D94F93]/40 text-sm text-[#B93778]">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="story-title-input" className="block text-sm font-medium text-[#4F3048]">
              Story Title
            </label>
            <input
              id="story-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Saltwater Conservatory"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-white border border-[#BA86A6]/35 text-[#4F3048] placeholder:text-[#BA86A6] focus:border-[#D94F93] focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="story-synopsis-input"
              className="block text-sm font-medium text-[#4F3048]"
            >
              Synopsis
            </label>
            <textarea
              id="story-synopsis-input"
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="What is your story's central tension, premise, or emotional heart?"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-white border border-[#BA86A6]/35 text-[#4F3048] placeholder:text-[#BA86A6] focus:border-[#D94F93] focus:outline-none resize-y"
            />
          </div>

          {/* Genres */}
          <div>
            <div className="text-sm font-medium text-[#4F3048] mb-2">
              Genres (select one or more)
            </div>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((g) => {
                const selected = genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                      selected
                        ? 'bg-[#C53B7D] text-white'
                        : 'bg-white border border-[#BA86A6]/35 text-[#4F3048] hover:bg-[#FCE4EC]/70'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
              {genres
                .filter((g) => !GENRE_OPTIONS.includes(g))
                .map((custom) => (
                  <button
                    key={custom}
                    type="button"
                    onClick={() => toggleGenre(custom)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#C53B7D] text-white whitespace-nowrap"
                  >
                    {custom} ×
                  </button>
                ))}
            </div>
            <div className="mt-2.5 flex gap-2">
              <input
                type="text"
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomGenre();
                  }
                }}
                placeholder="Add custom genre..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#BA86A6]/35 text-sm text-[#4F3048] placeholder:text-[#BA86A6]"
              />
              <button
                type="button"
                onClick={addCustomGenre}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FCE4EC] text-[#4F3048] hover:bg-[#F8C8DC] text-xs font-medium whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Cover */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#4F3048]">Story Cover</span>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EFA7C5]/60 hover:bg-[#FCE4EC]/60 text-xs font-medium text-[#4F3048] cursor-pointer transition-colors">
                <ImageIcon className="w-3.5 h-3.5 text-[#D94F93]" />
                <span>Upload Custom Cover</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="sr-only"
                />
              </label>
            </div>

            {coverType === 'image' && coverImageDataUrl && (
              <div className="mb-3 relative rounded-2xl overflow-hidden h-28 border border-[#EFA7C5]/50">
                <img
                  src={coverImageDataUrl}
                  alt="Custom story cover preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverType('gradient');
                    setCoverImageDataUrl(undefined);
                  }}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-[#4F3048]/80 text-white text-xs font-medium hover:bg-[#4F3048]"
                >
                  Use Gradient Instead
                </button>
              </div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {COVER_GRADIENTS.map((grad) => {
                const active = coverType === 'gradient' && coverGradientId === grad.id;
                return (
                  <button
                    key={grad.id}
                    type="button"
                    onClick={() => {
                      setCoverType('gradient');
                      setCoverGradientId(grad.id);
                    }}
                    className={`group rounded-xl p-1 border transition-all text-left ${
                      active
                        ? 'border-[#D94F93] ring-2 ring-[#D94F93]/30'
                        : 'border-[#BA86A6]/30 hover:border-[#D94F93]/50'
                    }`}
                  >
                    <div
                      className="h-10 rounded-lg w-full"
                      style={{ background: grad.cssGradient }}
                    />
                    <span className="block mt-1 text-[11px] text-[#6E626C] truncate px-0.5">
                      {grad.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#EFA7C5]/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#4F3048] bg-white border border-[#BA86A6]/35 hover:bg-[#FCE4EC]/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#C53B7D] hover:bg-[#B93778] transition-colors shadow-sm"
            >
              {initialProject ? 'Save Changes' : 'Create Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
