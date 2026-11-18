import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  Download,
  FileJson,
  FileText,
  Menu,
  Settings as SettingsIcon,
} from 'lucide-react';
import type { SectionId, StoryProject, UserPreferences } from '../types/plotline';
import type { SaveStatus } from '../store/usePlotlineStore';
import { Sidebar } from './Sidebar';

const SECTION_TITLES: Record<SectionId, string> = {
  dashboard: 'Dashboard',
  stories: 'My Stories',
  characters: 'Character Bible',
  canon: 'Story Canon',
  'plot-board': 'Plot Board',
  'what-if': 'What-If Engine',
  companion: 'AI Writing Companion',
  settings: 'Settings',
};

interface AppShellProps {
  activeSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  projects: StoryProject[];
  activeProject: StoryProject | null;
  onSelectProject: (projectId: string) => void;
  saveStatus: SaveStatus;
  storageError: string | null;
  lastSavedAt: string;
  preferences: UserPreferences;
  onToggleSidebar: () => void;
  onExportJson: () => void;
  onExportMarkdown: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeSection,
  onSelectSection,
  projects,
  activeProject,
  onSelectProject,
  saveStatus,
  storageError,
  lastSavedAt,
  preferences,
  onToggleSidebar,
  onExportJson,
  onExportMarkdown,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const switcherRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fontSizeClass =
    preferences.writingFontSize === 'small'
      ? 'writing-size-small'
      : preferences.writingFontSize === 'large'
        ? 'writing-size-large'
        : 'writing-size-medium';

  const savedTimeFormatted = new Date(lastSavedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`min-h-screen flex bg-[#FFFAFC] text-[#4F3048] ${fontSizeClass}`}>
      <Sidebar
        activeSection={activeSection}
        onSelectSection={onSelectSection}
        activeProject={activeProject}
        collapsed={preferences.sidebarCollapsed}
        onToggleCollapse={onToggleSidebar}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#FFFAFC]/90 backdrop-blur-md border-b border-[#EFA7C5]/35">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Left: Mobile menu + Project switcher + Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl text-[#4F3048] hover:bg-[#FCE4EC] transition-colors shrink-0"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Project Switcher */}
              <div className="relative" ref={switcherRef}>
                <button
                  type="button"
                  onClick={() => setSwitcherOpen((o) => !o)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#EFA7C5]/50 hover:border-[#D94F93]/60 text-sm font-medium text-[#4F3048] transition-colors max-w-[200px] sm:max-w-[260px]"
                  aria-expanded={switcherOpen}
                  aria-haspopup="listbox"
                >
                  <span className="truncate">
                    {activeProject ? activeProject.title : 'Select a Story'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[#8C5B7C] shrink-0" />
                </button>

                {switcherOpen && (
                  <div
                    role="listbox"
                    className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-[#EFA7C5]/60 shadow-xl py-2 z-40"
                  >
                    <div className="px-3.5 py-1.5 text-xs font-medium text-[#766B74]">
                      Switch story project
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {projects.length === 0 ? (
                        <div className="px-3.5 py-3 text-sm text-[#766B74]">
                          No stories yet. Create one from Dashboard.
                        </div>
                      ) : (
                        projects.map((proj) => {
                          const isCurrent = activeProject?.id === proj.id;
                          return (
                            <button
                              key={proj.id}
                              type="button"
                              onClick={() => {
                                onSelectProject(proj.id);
                                setSwitcherOpen(false);
                              }}
                              className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 text-sm transition-colors ${
                                isCurrent
                                  ? 'bg-[#FCE4EC]/80 text-[#B93778] font-semibold'
                                  : 'text-[#4F3048] hover:bg-[#FFF5F9]'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="truncate">{proj.title}</div>
                                <div className="text-xs text-[#766B74] truncate">
                                  {proj.isSample ? 'Sample Story · ' : ''}
                                  {proj.characters.length} characters ·{' '}
                                  {proj.canonEntries.filter((e) => e.status === 'canon').length}{' '}
                                  canon
                                </div>
                              </div>
                              {isCurrent && <Check className="w-4 h-4 text-[#D94F93] shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <span className="hidden sm:inline text-[#BA86A6]" aria-hidden="true">
                /
              </span>
              <span className="hidden sm:inline text-sm font-medium text-[#6E626C] whitespace-nowrap truncate">
                {SECTION_TITLES[activeSection]}
              </span>
            </div>

            {/* Right: Autosave status, Export, Settings */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Autosave status */}
              <div
                className={`hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg whitespace-nowrap ${
                  saveStatus === 'error'
                    ? 'bg-[#FCE4EC] text-[#B93778]'
                    : saveStatus === 'saving'
                      ? 'text-[#8C5B7C]'
                      : 'text-[#6E626C]'
                }`}
                title={storageError || `Last saved at ${savedTimeFormatted}`}
              >
                {saveStatus === 'error' ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-[#B93778]" />
                    <span>Save failed</span>
                  </>
                ) : saveStatus === 'saving' ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#B93778]" />
                    <span>Saved {savedTimeFormatted}</span>
                  </>
                )}
              </div>

              {/* Export Dropdown */}
              {activeProject && (
                <div className="relative" ref={exportRef}>
                  <button
                    type="button"
                    onClick={() => setExportOpen((o) => !o)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EFA7C5]/50 hover:border-[#D94F93]/60 text-xs sm:text-sm font-medium text-[#4F3048] transition-colors whitespace-nowrap shrink-0"
                    aria-expanded={exportOpen}
                  >
                    <Download className="w-4 h-4 text-[#D94F93]" />
                    <span className="hidden sm:inline">Export</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8C5B7C]" />
                  </button>

                  {exportOpen && (
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-[#EFA7C5]/60 shadow-xl py-1.5 z-40">
                      <button
                        type="button"
                        onClick={() => {
                          onExportJson();
                          setExportOpen(false);
                        }}
                        className="w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 hover:bg-[#FFF5F9] transition-colors"
                      >
                        <FileJson className="w-4 h-4 text-[#D94F93] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-[#4F3048]">Export JSON</div>
                          <div className="text-xs text-[#766B74]">
                            Full re-importable story backup
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onExportMarkdown();
                          setExportOpen(false);
                        }}
                        className="w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 hover:bg-[#FFF5F9] transition-colors"
                      >
                        <FileText className="w-4 h-4 text-[#8C5B7C] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-[#4F3048]">
                            Story Bible (.md)
                          </div>
                          <div className="text-xs text-[#766B74]">
                            Formatted overview, cast & canon
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => onSelectSection('settings')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeSection === 'settings'
                    ? 'bg-[#FCE4EC] border-[#D94F93]/50 text-[#B93778]'
                    : 'bg-white border-[#EFA7C5]/50 hover:border-[#D94F93]/60 text-[#4F3048]'
                }`}
                aria-label="Open Settings"
              >
                <SettingsIcon className="w-4 h-4" />
                <span className="hidden md:inline">Settings</span>
              </button>
            </div>
          </div>
        </header>

        {storageError && (
          <div className="bg-[#FCE4EC] border-b border-[#D94F93]/30 px-4 py-2.5 text-sm text-[#4F3048]">
            <div className="max-w-[1400px] mx-auto flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#B93778] shrink-0" />
              <span>{storageError}</span>
            </div>
          </div>
        )}

        {/* Main Workspace Viewport */}
        <main className="flex-1">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
