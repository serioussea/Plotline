import React from 'react';
import {
  ArrowRight,
  GitBranch,
  LayoutGrid,
  MessageSquareHeart,
  Plus,
  RotateCcw,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { SectionId, StoryProject } from '../types/plotline';
import { ProjectCard } from './ProjectCard';

interface DashboardProps {
  projects: StoryProject[];
  activeProject: StoryProject | null;
  onCreateNew: () => void;
  onOpenProject: (projectId: string) => void;
  onEditProject: (project: StoryProject) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (project: StoryProject) => void;
  onNavigate: (section: SectionId) => void;
  onRestoreSample: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  activeProject,
  onCreateNew,
  onOpenProject,
  onEditProject,
  onDuplicateProject,
  onDeleteProject,
  onNavigate,
  onRestoreSample,
}) => {
  const hasSample = projects.some((p) => p.isSample);

  const activeCanonCount =
    activeProject?.canonEntries.filter((e) => e.status === 'canon').length ?? 0;
  const activeExpCount =
    activeProject?.canonEntries.filter((e) => e.status === 'experimental').length ?? 0;
  const activeBranchesCount =
    activeProject?.whatIfSessions.reduce(
      (sum, s) => sum + s.branches.filter((b) => b.status === 'experimental').length,
      0
    ) ?? 0;

  return (
    <div className="space-y-10">
      {/* Welcome Hero */}
      <section className="rounded-3xl bg-gradient-to-br from-[#FCE4EC]/90 via-[#FFF5F9] to-[#F3E8F7]/80 border border-[#EFA7C5]/45 p-7 sm:p-10 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-xs font-medium text-[#B93778] tracking-wide">
            Plotline Literary Studio
          </p>
          <h1 className="mt-2 font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#4F3048] tracking-tight headline-balance">
            Your next great story starts here.
          </h1>
          <p className="mt-3 font-literary italic text-xl sm:text-2xl text-[#6E626C] leading-relaxed">
            Every character has a secret. Every story has a thousand possibilities.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C53B7D] hover:bg-[#B93778] text-white text-sm font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create New Story</span>
            </button>

            {activeProject && (
              <button
                type="button"
                onClick={() => onNavigate('what-if')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/90 hover:bg-white border border-[#EFA7C5]/60 text-[#4F3048] text-sm font-medium transition-colors whitespace-nowrap shrink-0"
              >
                <GitBranch className="w-4 h-4 text-[#D94F93]" />
                <span>Open What-If Engine</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Active Story Quick Resume */}
      {activeProject && (
        <section aria-labelledby="active-story-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <div>
              <h2
                id="active-story-heading"
                className="font-editorial text-2xl font-bold text-[#4F3048]"
              >
                Continue "{activeProject.title}"
              </h2>
              <p className="text-sm text-[#6E626C] mt-0.5">
                {activeCanonCount} established canon · {activeExpCount} experimental notes ·{' '}
                {activeBranchesCount} saved experimental branches
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('canon')}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#B93778] hover:underline"
            >
              <span>Inspect Canon Keeper</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              {
                section: 'characters' as SectionId,
                title: 'Character Bible',
                detail: `${activeProject.characters.length} profiles`,
                icon: Users,
              },
              {
                section: 'canon' as SectionId,
                title: 'Canon Keeper',
                detail: `${activeCanonCount} established`,
                icon: ShieldCheck,
              },
              {
                section: 'plot-board' as SectionId,
                title: 'Plot Board',
                detail: `${activeProject.plotCards.length} scenes`,
                icon: LayoutGrid,
              },
              {
                section: 'what-if' as SectionId,
                title: 'What-If Engine',
                detail: `${activeProject.whatIfSessions.length} explorations`,
                icon: GitBranch,
              },
              {
                section: 'companion' as SectionId,
                title: 'Writing Companion',
                detail: `${activeProject.conversations.length} threads`,
                icon: MessageSquareHeart,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.section}
                  type="button"
                  onClick={() => onNavigate(item.section)}
                  className="stationery-card-interactive rounded-2xl p-4 text-left flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#FCE4EC] text-[#B93778] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#4F3048] truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-[#766B74] mt-0.5 font-mono-tabular">
                      {item.detail}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Story Projects Grid */}
      <section aria-labelledby="projects-grid-heading">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2
              id="projects-grid-heading"
              className="font-editorial text-2xl font-bold text-[#4F3048]"
            >
              Your Story Projects
            </h2>
            <p className="text-sm text-[#6E626C] mt-0.5">
              Every project isolates its own canon, characters, and speculative explorations.
            </p>
          </div>

          {!hasSample && (
            <button
              type="button"
              onClick={onRestoreSample}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EFA7C5]/60 text-xs font-medium text-[#4F3048] hover:bg-[#FCE4EC]/50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#D94F93]" />
              <span>Restore "The Glass Orchard" Sample</span>
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="stationery-card rounded-3xl p-10 text-center max-w-xl mx-auto">
            <h3 className="font-editorial text-xl font-bold text-[#4F3048]">
              Your desk is clear
            </h3>
            <p className="mt-2 text-sm text-[#6E626C]">
              Create a new story project to start building your characters, canon, and plot
              branches—or restore the sample story to see how Plotline works.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onCreateNew}
                className="px-4 py-2.5 rounded-xl bg-[#C53B7D] hover:bg-[#B93778] text-white text-sm font-medium"
              >
                + Create New Story
              </button>
              <button
                type="button"
                onClick={onRestoreSample}
                className="px-4 py-2.5 rounded-xl bg-white border border-[#BA86A6]/40 text-[#4F3048] text-sm font-medium hover:bg-[#FCE4EC]/50"
              >
                Load Sample Story
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                isActive={activeProject?.id === proj.id}
                onOpen={onOpenProject}
                onEdit={onEditProject}
                onDuplicate={onDuplicateProject}
                onDelete={onDeleteProject}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
