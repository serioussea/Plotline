import React from 'react';
import {
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  Feather,
  FolderHeart,
  GitBranch,
  LayoutDashboard,
  LayoutGrid,
  MessageSquareHeart,
  Settings as SettingsIcon,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import type { SectionId, StoryProject } from '../types/plotline';

interface SidebarProps {
  activeSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  activeProject: StoryProject | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresProject?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'stories', label: 'My Stories', icon: FolderHeart },
  { id: 'characters', label: 'Character Bible', icon: Users, requiresProject: true },
  { id: 'canon', label: 'Story Canon', icon: ShieldCheck, requiresProject: true },
  { id: 'plot-board', label: 'Plot Board', icon: LayoutGrid, requiresProject: true },
  { id: 'what-if', label: 'What-If Engine', icon: GitBranch, requiresProject: true },
  {
    id: 'companion',
    label: 'AI Writing Companion',
    icon: MessageSquareHeart,
    requiresProject: true,
  },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  activeProject,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const renderNavContent = (isMobile = false) => {
    const isCompact = !isMobile && collapsed;

    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-[#FFFAFC] via-[#FFF4F8] to-[#FCE4EC]/75 border-r border-[#EFA7C5]/40">
        {/* Brand Header */}
        <div
          className={`flex items-center justify-between px-4 pt-5 pb-4 border-b border-[#EFA7C5]/25 ${
            isCompact ? 'justify-center px-2' : ''
          }`}
        >
          <button
            type="button"
            onClick={() => {
              onSelectSection('dashboard');
              if (isMobile) onCloseMobile();
            }}
            className="flex items-center gap-3 text-left group min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ED75A7] to-[#D94F93] flex items-center justify-center text-white shadow-sm shrink-0">
              <Feather className="w-4 h-4" />
            </div>
            {!isCompact && (
              <div className="min-w-0">
                <div className="font-editorial text-xl font-bold tracking-tight text-[#4F3048] leading-none">
                  Plotline
                </div>
                <p className="mt-1 text-xs italic text-[#766B74] truncate">
                  Where stories take shape.
                </p>
              </div>
            )}
          </button>

          {isMobile ? (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-2 rounded-lg text-[#6E626C] hover:text-[#4F3048] hover:bg-[#FCE4EC]"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:inline-flex p-1.5 rounded-lg text-[#766B74] hover:text-[#4F3048] hover:bg-[#FCE4EC]/80 transition-colors shrink-0"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronsRight className="w-4 h-4" />
              ) : (
                <ChevronsLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Active Story Indicator */}
        {!isCompact && (
          <div className="px-4 py-3.5 border-b border-[#EFA7C5]/25">
            <div className="text-[11px] font-medium text-[#766B74]">Current story</div>
            {activeProject ? (
              <div className="mt-1 flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-[#D94F93] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#4F3048] truncate">
                    {activeProject.title}
                  </div>
                  <div className="text-xs text-[#6E626C] truncate">
                    {activeProject.isSample ? 'Sample Story · ' : ''}
                    {activeProject.canonEntries.filter((e) => e.status === 'canon').length} canon ·{' '}
                    {activeProject.characters.length} characters
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-1 text-xs text-[#766B74]">
                No story selected. Create or open one from Dashboard.
              </div>
            )}
          </div>
        )}

        {/* Primary Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const disabled = Boolean(item.requiresProject && !activeProject);

            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onSelectSection(item.id);
                  if (isMobile) onCloseMobile();
                }}
                title={
                  isCompact
                    ? item.label
                    : disabled
                      ? 'Select or create a story first'
                      : undefined
                }
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  isCompact ? 'justify-center px-2' : ''
                } ${
                  isActive
                    ? 'bg-white text-[#B93778] shadow-xs border border-[#EFA7C5]/60'
                    : disabled
                      ? 'text-[#BA86A6]/60 cursor-not-allowed'
                      : 'text-[#4F3048]/85 hover:bg-white/75 hover:text-[#4F3048]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-[#D94F93]'
                      : disabled
                        ? 'text-[#BA86A6]/50'
                        : 'text-[#8C5B7C]'
                  }`}
                />
                {!isCompact && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom quiet note */}
        {!isCompact && (
          <div className="px-4 py-3 border-t border-[#EFA7C5]/25 text-xs text-[#766B74]">
            Canon stays protected until you approve changes.
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-[width] duration-200 ${
          collapsed ? 'w-[72px]' : 'w-[264px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{renderNavContent(false)}</div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#4F3048]/30 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[280px] max-w-[85vw] h-full shadow-2xl">
            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
