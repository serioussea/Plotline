import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { StoryProject } from '../types/plotline';
import { ProjectCard } from './ProjectCard';

interface MyStoriesProps {
  projects: StoryProject[];
  activeProjectId: string | null;
  onCreateNew: () => void;
  onOpenProject: (projectId: string) => void;
  onEditProject: (project: StoryProject) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (project: StoryProject) => void;
}

export const MyStories: React.FC<MyStoriesProps> = ({
  projects,
  activeProjectId,
  onCreateNew,
  onOpenProject,
  onEditProject,
  onDuplicateProject,
  onDeleteProject,
}) => {
  const [query, setQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'updated' | 'title'>('updated');

  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.genres.forEach((g) => set.add(g)));
    return ['All', ...Array.from(set).sort()];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesQuery =
          !query.trim() ||
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.synopsis.toLowerCase().includes(query.toLowerCase());
        const matchesGenre = genreFilter === 'All' || p.genres.includes(genreFilter);
        return matchesQuery && matchesGenre;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [projects, query, genreFilter, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-[#4F3048]">My Stories</h1>
          <p className="text-sm text-[#6E626C] mt-1">
            Organize your novels, screenplays, and interactive narratives in separate story vaults.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C53B7D] hover:bg-[#B93778] text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Story</span>
        </button>
      </div>

      {/* Filters */}
      <div className="stationery-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C5B7C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories by title or synopsis..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FFFAFC] border border-[#BA86A6]/30 text-sm text-[#4F3048] placeholder:text-[#BA86A6] focus:border-[#D94F93] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            aria-label="Filter by genre"
            className="px-3 py-2 rounded-xl bg-[#FFFAFC] border border-[#BA86A6]/30 text-sm text-[#4F3048]"
          >
            {availableGenres.map((g) => (
              <option key={g} value={g}>
                {g === 'All' ? 'All Genres' : g}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'updated' | 'title')}
            aria-label="Sort stories"
            className="px-3 py-2 rounded-xl bg-[#FFFAFC] border border-[#BA86A6]/30 text-sm text-[#4F3048]"
          >
            <option value="updated">Last Edited</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="stationery-card rounded-2xl p-10 text-center">
          <p className="text-sm text-[#6E626C]">
            No stories match your search or genre filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              isActive={proj.id === activeProjectId}
              onOpen={onOpenProject}
              onEdit={onEditProject}
              onDuplicate={onDuplicateProject}
              onDelete={onDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
};
