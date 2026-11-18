import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  BookmarkPlus,
  Check,
  Copy,
  Edit2,
  FlaskConical,
  Loader2,
  MessageSquarePlus,
  Send,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { createId } from '../store/usePlotlineStore';
import type {
  CanonEntry,
  ChatMessage,
  Conversation,
  StoryProject,
} from '../types/plotline';
import { requestCompanionReply } from '../utils/aiClient';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface WritingCompanionProps {
  project: StoryProject;
  onCreateConversation: (title?: string) => string;
  onRenameConversation: (conversationId: string, title: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onSetAttachedBranches: (conversationId: string, branchIds: string[]) => void;
  onAppendMessages: (conversationId: string, messages: ChatMessage[]) => void;
  onSaveAsExperimentalNote: (conversationId: string, messageId: string, entry: CanonEntry) => void;
}

export const WritingCompanion: React.FC<WritingCompanionProps> = ({
  project,
  onCreateConversation,
  onRenameConversation,
  onDeleteConversation,
  onSetAttachedBranches,
  onAppendMessages,
  onSaveAsExperimentalNote,
}) => {
  const [activeConvId, setActiveConvId] = useState<string>(
    project.conversations[0]?.id ?? ''
  );
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [pendingDeleteConv, setPendingDeleteConv] = useState<Conversation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAttachPanel, setShowAttachPanel] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project.conversations.some((c) => c.id === activeConvId)) {
      setActiveConvId(project.conversations[0]?.id ?? '');
    }
  }, [project.id, project.conversations, activeConvId]);

  const activeConv = useMemo(
    () => project.conversations.find((c) => c.id === activeConvId) ?? project.conversations[0] ?? null,
    [project.conversations, activeConvId]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages.length]);

  const approvedCanonCount = project.canonEntries.filter((e) => e.status === 'canon').length;

  const experimentalBranches = useMemo(
    () =>
      project.whatIfSessions
        .flatMap((s) => s.branches)
        .filter((b) => b.status === 'experimental' || b.status === 'promoted_partial'),
    [project.whatIfSessions]
  );

  const suggestedActions = useMemo(() => {
    const firstChar = project.characters[0]?.fullName || 'my protagonist';
    const secondChar = project.characters[1]?.fullName || 'another key character';
    return [
      {
        label: 'Develop this character',
        prompt: `Look closely at ${firstChar}'s established motivation, wound, and moral boundaries. Where is there untapped psychological tension we could sharpen?`,
      },
      {
        label: 'Find plot inconsistencies',
        prompt:
          'Review my current canon entries, character secrets, and plot cards for any potential pacing gaps, motivation leaps, or continuity tensions.',
      },
      {
        label: 'Explore a darker direction',
        prompt:
          'Staying true to my established canon, suggest a darker, higher-stakes turning point that raises the personal cost for my characters.',
      },
      {
        label: 'Suggest three alternatives',
        prompt:
          'Give me three meaningfully different directions for the next major beat of my story, and note which canon facts each option leans on.',
      },
      {
        label: 'Analyze this relationship',
        prompt: `Analyze the dynamic between ${firstChar} and ${secondChar}. What is unsaid between them, and what scene would force their hidden feelings to the surface?`,
      },
      {
        label: 'Outline the next chapter',
        prompt:
          'Help me outline the next chapter with a clear dramatic question, beat-by-beat emotional turn, and a closing hook.',
      },
    ];
  }, [project.characters]);

  const ensureActiveConversation = (): string => {
    if (activeConv) return activeConv.id;
    const newId = onCreateConversation('Story Brainstorming');
    setActiveConvId(newId);
    return newId;
  };

  const handleSend = async (customMessage?: string) => {
    const text = (customMessage ?? input).trim();
    if (!text || sending) return;

    const targetConvId = ensureActiveConversation();
    const conv = project.conversations.find((c) => c.id === targetConvId);
    const attachedIds = conv?.attachedBranchIds ?? [];
    const priorHistory = (conv?.messages ?? []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const userMsg: ChatMessage = {
      id: createId('msg'),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    onAppendMessages(targetConvId, [userMsg]);
    if (!customMessage) setInput('');
    setSending(true);
    setError(null);

    try {
      const res = await requestCompanionReply({
        project,
        attachedBranchIds: attachedIds,
        history: priorHistory,
        message: text,
      });

      const assistantMsg: ChatMessage = {
        id: createId('msg'),
        role: 'assistant',
        content: res.reply,
        createdAt: new Date().toISOString(),
        canonWarnings: res.canonWarnings,
        contextSummary: res.contextNotice,
      };

      onAppendMessages(targetConvId, [assistantMsg]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not reach the AI Writing Companion.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleCopy = async (msg: ChatMessage) => {
    await navigator.clipboard.writeText(msg.content);
    setCopiedId(msg.id);
    window.setTimeout(() => setCopiedId(null), 1600);
  };

  const handleSaveNote = (msg: ChatMessage) => {
    if (!activeConv) return;
    const now = new Date().toISOString();
    const snippetTitle = msg.content.split('\n')[0].replace(/[#*`]/g, '').slice(0, 60).trim();
    onSaveAsExperimentalNote(activeConv.id, msg.id, {
      id: createId('canon'),
      title: `Companion Note: ${snippetTitle || 'Story Idea'}`,
      description: msg.content,
      category: 'Other',
      status: 'experimental',
      linkedCharacterIds: [],
      source: 'approved-ai',
      sourceNote: `Saved from AI Writing Companion (${activeConv.title})`,
      createdAt: now,
      updatedAt: now,
    });
  };

  const toggleAttachedBranch = (branchId: string) => {
    if (!activeConv) return;
    const current = activeConv.attachedBranchIds;
    const next = current.includes(branchId)
      ? current.filter((id) => id !== branchId)
      : [...current, branchId];
    onSetAttachedBranches(activeConv.id, next);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-editorial text-3xl font-bold text-[#4F3048]">
          AI Writing Companion
        </h1>
        <p className="text-sm text-[#6E626C] mt-1">
          A candid literary collaborator grounded in{' '}
          <span className="font-medium">{project.title}</span>'s approved canon.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        {/* Conversation List Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3 stationery-card rounded-3xl p-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              const id = onCreateConversation(
                `Session ${project.conversations.length + 1}`
              );
              setActiveConvId(id);
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C53B7D] hover:bg-[#B93778] text-white text-sm font-medium transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
            {project.conversations.length === 0 ? (
              <p className="text-xs text-[#766B74] p-2">
                Start a conversation to brainstorm scenes, character arcs, or pacing.
              </p>
            ) : (
              project.conversations.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                const isEditing = editingConvId === conv.id;
                return (
                  <div
                    key={conv.id}
                    className={`rounded-xl p-2.5 transition-colors border ${
                      isSelected
                        ? 'bg-[#FCE4EC]/75 border-[#EFA7C5]'
                        : 'bg-transparent border-transparent hover:bg-[#FFF5F9]'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={renameDraft}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              onRenameConversation(conv.id, renameDraft);
                              setEditingConvId(null);
                            }
                            if (e.key === 'Escape') setEditingConvId(null);
                          }}
                          className="flex-1 px-2 py-1 rounded-lg bg-white border border-[#D94F93] text-xs text-[#4F3048]"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onRenameConversation(conv.id, renameDraft);
                            setEditingConvId(null);
                          }}
                          className="p-1 rounded-md bg-[#C53B7D] text-white"
                          aria-label="Save conversation name"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveConvId(conv.id)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <div className="text-sm font-medium text-[#4F3048] truncate">
                            {conv.title}
                          </div>
                          <div className="text-[11px] text-[#766B74] font-mono-tabular">
                            {conv.messages.length}{' '}
                            {conv.messages.length === 1 ? 'message' : 'messages'}
                          </div>
                        </button>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingConvId(conv.id);
                              setRenameDraft(conv.title);
                            }}
                            className="p-1.5 rounded-lg text-[#766B74] hover:text-[#4F3048] hover:bg-white"
                            aria-label={`Rename ${conv.title}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDeleteConv(conv)}
                            className="p-1.5 rounded-lg text-[#766B74] hover:text-[#B93778] hover:bg-white"
                            aria-label={`Delete ${conv.title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Main Chat Workspace */}
        <section className="lg:col-span-8 xl:col-span-9 stationery-card rounded-3xl flex flex-col overflow-hidden min-h-[640px]">
          {/* Context Transparency Header */}
          <div className="px-5 py-3.5 bg-[#FFF5F9] border-b border-[#EFA7C5]/35 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#4F3048]">
              <ShieldCheck className="w-4 h-4 text-[#B93778] shrink-0" />
              <span>
                Active context:{' '}
                <strong className="font-mono-tabular">{approvedCanonCount}</strong> canon ·{' '}
                <strong className="font-mono-tabular">{project.characters.length}</strong>{' '}
                characters
              </span>
            </div>

            {experimentalBranches.length > 0 && activeConv && (
              <button
                type="button"
                onClick={() => setShowAttachPanel((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EFA7C5]/60 text-xs font-medium text-[#4F3048] hover:bg-[#F3E8F7]/70"
              >
                <FlaskConical className="w-3.5 h-3.5 text-[#8C5B7C]" />
                <span>
                  Experimental Context ({activeConv.attachedBranchIds.length})
                </span>
              </button>
            )}
          </div>

          {showAttachPanel && activeConv && (
            <div className="px-5 py-3 bg-[#F3E8F7]/60 border-b border-[#BA86A6]/30 space-y-2">
              <p className="text-xs text-[#4F3048]">
                Select experimental branches to discuss in this chat (still treated as speculative,
                never canon):
              </p>
              <div className="flex flex-wrap gap-2">
                {experimentalBranches.map((br) => {
                  const attached = activeConv.attachedBranchIds.includes(br.id);
                  return (
                    <button
                      key={br.id}
                      type="button"
                      onClick={() => toggleAttachedBranch(br.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        attached
                          ? 'bg-[#4F3048] text-white'
                          : 'bg-white border border-[#BA86A6]/35 text-[#4F3048]'
                      }`}
                    >
                      {br.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FFFAFC]/60">
            {(!activeConv || activeConv.messages.length === 0) && (
              <div className="py-10 text-center max-w-lg mx-auto space-y-3">
                <h2 className="font-editorial text-2xl font-bold text-[#4F3048]">
                  Brainstorm without losing your canon
                </h2>
                <p className="text-sm text-[#6E626C] leading-relaxed">
                  Ask for honest craft feedback, character psychology deep-dives, or scene outlines.
                  Save promising responses as Experimental Notes whenever you like.
                </p>
              </div>
            )}

            {activeConv?.messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 space-y-2.5 ${
                      isUser
                        ? 'bg-[#FCE4EC] text-[#4F3048] border border-[#EFA7C5]/50'
                        : 'bg-white text-[#4F3048] border border-[#EFA7C5]/40 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[11px] text-[#766B74]">
                      <span className="font-semibold text-[#B93778]">
                        {isUser ? 'You' : 'Plotline Companion'}
                      </span>
                      <span className="font-mono-tabular">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="writing-prose whitespace-pre-wrap leading-relaxed text-[#4F3048]">
                      {msg.content}
                    </div>

                    {msg.canonWarnings && msg.canonWarnings.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-[#FFF5F9] border border-[#D94F93]/35 text-xs text-[#B93778]">
                        Canon note: This discussion touched on{' '}
                        <strong>{msg.canonWarnings.join(', ')}</strong>. Verify changes in Canon
                        Keeper before adopting.
                      </div>
                    )}

                    {!isUser && (
                      <div className="pt-2 border-t border-[#EFA7C5]/25 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-[#766B74]">
                          {msg.contextSummary || 'Grounded in approved canon'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFFAFC] border border-[#BA86A6]/30 text-xs text-[#4F3048] hover:bg-[#FCE4EC]/60"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-[#B93778]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={msg.savedAsExperimentalNote}
                            onClick={() => handleSaveNote(msg)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              msg.savedAsExperimentalNote
                                ? 'bg-[#F3E8F7] text-[#4F3048]'
                                : 'bg-[#FCE4EC] hover:bg-[#F8C8DC] text-[#4F3048]'
                            }`}
                          >
                            <BookmarkPlus className="w-3 h-3 text-[#B93778]" />
                            <span>
                              {msg.savedAsExperimentalNote
                                ? 'Saved to Experimental'
                                : 'Save as Experimental Note'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-white border border-[#EFA7C5]/40 inline-flex items-center gap-2 text-xs text-[#6E626C]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#D94F93]" />
                  <span>Reading your story canon and crafting a response...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Action Chips + Input Composer */}
          <div className="p-4 bg-white border-t border-[#EFA7C5]/35 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {suggestedActions.map((act) => (
                <button
                  key={act.label}
                  type="button"
                  onClick={() => setInput(act.prompt)}
                  className="px-3 py-1 rounded-full bg-[#FFF5F9] hover:bg-[#FCE4EC] border border-[#EFA7C5]/50 text-xs font-medium text-[#4F3048] transition-colors"
                >
                  {act.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#FCE4EC] text-xs text-[#B93778] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2.5"
            >
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about character motivations, pacing, dialogue, or plot holes... (Enter to send)"
                className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FFFAFC] border border-[#BA86A6]/35 text-sm text-[#4F3048] placeholder:text-[#BA86A6] focus:border-[#D94F93] focus:bg-white focus:outline-none resize-none"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-[#C53B7D] hover:bg-[#B93778] disabled:opacity-50 text-white text-sm font-medium transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDeleteConv)}
        title="Delete conversation?"
        message={`Delete "${pendingDeleteConv?.title}"? Any messages already saved as Experimental Notes will remain in Canon Keeper.`}
        confirmLabel="Delete Conversation"
        destructive
        onConfirm={() => {
          if (pendingDeleteConv) {
            onDeleteConversation(pendingDeleteConv.id);
          }
          setPendingDeleteConv(null);
        }}
        onCancel={() => setPendingDeleteConv(null)}
      />
    </div>
  );
};
