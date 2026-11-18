import React from 'react';
import { Copy, Edit3, FolderOpen, Trash2 } from 'lucide-react';
import { COVER_GRADIENTS } from '../data/sampleProject';
import type { StoryProject } from '../types/plotline';

interface ProjectCardProps {
  project: StoryProject;
  isActive: boolean;
  onOpen: (projectId: string) => void;
  onEdit: (project: StoryProject) => void;
  onDuplicate: (projectId: string) => void;
  onDelete: (project: StoryProject) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isActive,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const gradient =
    COVER_GRADIENTS.find((g) => g.id === project.coverGradientId) ?? COVER_GRADIENTS[0];

  const savedBranchCount = project.whatIfSessions.reduce(
    (sum, sess) =>
      sum + sess.branches.filter((b) => b.status !== 'rejected').length,
    0
  );

  const formattedDate = new Date(project.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      className={`stationery-card-interactive rounded-2xl overflow-hidden flex flex-col ${
        isActive ? 'ring-2 ring-[#D94F93]/60' : ''
      }`}
    >
      {/* Cover Visual */}
      <button
        type="button"
        onClick={() => onOpen(project.id)}
        className="relative h-36 w-full text-left overflow-hidden group focus-visible:outline-offset-[-2px]"
      >
        {project.coverType === 'image' && project.coverImageDataUrl ? (
          <img
            src={project.coverImageDataUrl}
            alt={`Cover for ${project.title}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="w-full h-full relative flex items-end p-5"
            style={{ background: gradient.cssGradient }}
          >
            <svg
              viewBox="0 0 120 120"
              className="absolute right-3 top-3 w-20 h-20 opacity-20 pointer-events-none"
              aria-hidden="true"
            >
              <circle cx="60" cy="60" r="46" fill="none" stroke="#4F3048" strokeWidth="1.2" />
              <path
                d="M60 18 C70 38, 82 50, 102 60 C82 70, 70 82, 60 102 C50 82, 38 70, 18 60 C38 50, 50 38, 60 18 Z"
                fill="none"
                stroke="#4F3048"
                strokeWidth="1.2"
              />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#4F3048]/65 via-[#4F3048]/15 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
          <div className="min-w-0">
            {project.isSample && (
              <span className="block text-[11px] font-medium text-[#FCE4EC] tracking-wide">
                Sample Story
              </span>
            )}
            <h3 className="font-editorial text-xl font-bold text-white truncate drop-shadow-xs">
              {project.title}
            </h3>
          </div>
          {isActive && (
            <span className="text-[11px] font-semibold text-white bg-[#B93778] px-2.5 py-0.5 rounded-md whitespace-nowrap shrink-0">
              Active
            </span>
          )}
        </div>
      </button>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          {project.genres.length > 0 && (
            <div className="text-xs font-medium text-[#B93778] mb-2">
              {project.genres.join(' · ')}
            </div>
          )}

          <p className="text-sm text-[#6E626C] leading-relaxed line-clamp-3">
            {project.synopsis || 'No synopsis added yet. Open or edit to capture the core premise.'}
          </p>
        </div>

        <div>
          <div className="pt-3 border-t border-[#EFA7C5]/25 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#766B74] font-mono-tabular">
            <span>Edited {formattedDate}</span>
            <span aria-hidden="true">·</span>
            <span>
              {project.characters.length}{' '}
              {project.characters.length === 1 ? 'character' : 'characters'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {savedBranchCount} {savedBranchCount === 1 ? 'branch' : 'branches'}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onOpen(project.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C53B7D] hover:bg-[#B93778] text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>{isActive ? 'Workspace' : 'Open Story'}</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="p-2 rounded-lg text-[#6E626C] hover:text-[#4F3048] hover:bg-[#FCE4EC]/70 transition-colors"
                title="Edit story details"
                aria-label={`Edit ${project.title}`}
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDuplicate(project.id)}
                className="p-2 rounded-lg text-[#6E626C] hover:text-[#4F3048] hover:bg-[#FCE4EC]/70 transition-colors"
                title="Duplicate story"
                aria-label={`Duplicate ${project.title}`}
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(project)}
                className="p-2 rounded-lg text-[#6E626C] hover:text-[#B93778] hover:bg-[#FCE4EC]/70 transition-colors"
                title="Delete story"
                aria-label={`Delete ${project.title}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
