import React, { useState } from 'react';
import { ChatMessage } from '../../types';
import { mockChatDialogue } from '../../services/mockData';
import { useRecruiterFilter, useResetRecruiterFilter } from '../../services/api';
import { useNavigation } from '../../context/NavigationContext';

interface CopilotChatProps {
  activeTokens: string[];
  onAddToken: (token: string) => void;
  onRemoveToken: (token: string) => void;
  onResetTokens: () => void;
}

export const CopilotChat: React.FC<CopilotChatProps> = ({
  activeTokens,
  onAddToken,
  onRemoveToken,
  onResetTokens,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatDialogue);
  const [inputPrompt, setInputPrompt] = useState('');
  const { selectedRequisitionId } = useNavigation();
  const filterMutation = useRecruiterFilter();
  const resetMutation = useResetRecruiterFilter();

  const quickPrompts = [
    { label: '+ Prior Founders', token: 'Prior Founders' },
    { label: '+ Notice < 2 weeks', token: 'Notice < 2 weeks' },
    { label: '+ Top Tier (Scale/OpenAI)', token: 'Top Tier Engineering' },
  ];

  const handleReset = async () => {
    try {
      await resetMutation.mutateAsync({ positionId: selectedRequisitionId });
    } catch {
      // fallback
    }
    setMessages(mockChatDialogue);
    onResetTokens();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;

    const userText = inputPrompt;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'recruiter',
      timestamp: 'Just now',
      text: userText,
    };

    // Extract quick criteria tokens from user message synchronously
    const extracted: string[] = [];
    if (/5\+?\s*(yrs|years)/i.test(userText)) extracted.push('Exp: 5+ yrs');
    if (/rag|llm|agent/i.test(userText)) extracted.push('Domain: RAG / LLM');
    if (/sf|hybrid|san francisco/i.test(userText)) extracted.push('Location: SF Hybrid');
    if (/founder/i.test(userText)) extracted.push('Prior Founders');
    if (/notice|immediate/i.test(userText)) extracted.push('Notice < 2 weeks');

    extracted.forEach((t) => {
      if (!activeTokens.includes(t)) onAddToken(t);
    });

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');

    // Attempt real backend Recruiter Agent filtering
    try {
      const res = await filterMutation.mutateAsync({
        positionId: selectedRequisitionId,
        request: userText,
      });

      if (res?.plan?.conditions) {
        res.plan.conditions.forEach((c) => {
          const tokenStr = c.requirement || `${c.field}: ${c.values.join('/')}`;
          if (!activeTokens.includes(tokenStr)) {
            onAddToken(tokenStr);
          }
        });
      }

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'copilot',
        timestamp: 'Just now',
        text: res.explanation || `Filtered candidate pool against query criteria: "${userText}".`,
        breakdown: {
          ragCandidates: `${res.count} Candidates Remaining`,
          ragRatio: Math.min(100, Math.round((res.count / Math.max(1, res.previous_count || res.count)) * 100)),
          ossCandidates: `${res.removed} Removed by Filter`,
          ossRatio: Math.min(100, Math.round((res.removed / Math.max(1, res.previous_count || 1)) * 100)),
          highlightProfile: res.plan?.conditions?.[0]?.requirement
            ? `Vector: ${res.plan.conditions[0].requirement}`
            : 'Candidate pool updated according to natural language query.',
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
      return;
    } catch {
      // Fallback AI simulation if backend endpoint is unavailable
    }

    const fallbackAiMsg: ChatMessage = {
      id: `msg-ai-${Date.now()}`,
      sender: 'copilot',
      timestamp: 'Just now',
      text: `Filtered candidate pool against query criteria: "${userText}". Updated vector rankings accordingly.`,
      breakdown: {
        ragCandidates: '4/6 Candidates',
        ragRatio: 66,
        ossCandidates: '2/6 Candidates',
        ossRatio: 33,
        highlightProfile: 'Dr. Elena Rostova remains the highest affinity match at 98% cosine alignment.',
      },
    };

    setMessages((prev) => [...prev, fallbackAiMsg]);
  };

  return (
    <div className="bg-surface-container-low rounded-xl p-4 flex flex-col shadow-sm border border-white/5 relative overflow-hidden h-full">
      {/* Decorative ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      {/* Co-pilot Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shadow-sm border border-white/5">
            <span className="material-symbols-outlined text-[20px]">neurology</span>
          </div>
          <div>
            <div className="font-headline text-sm font-semibold text-on-surface flex items-center gap-1.5 leading-tight">
              Hive AI Co-pilot
              <span className="bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.2 rounded uppercase font-bold">
                Live v4
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-none mt-0.5">
              Semantic search & fit parsing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-on-surface-variant">
          <button
            onClick={handleReset}
            className="p-1 rounded hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="Reset Context"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
          <button
            className="p-1 rounded hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="Tuning Parameters"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </button>
        </div>
      </div>

      {/* Chat Stream Dialogue Area */}
      <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1 flex-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${
              msg.sender === 'recruiter' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 text-on-surface-variant font-mono text-[10px] uppercase">
              <span>{msg.sender === 'recruiter' ? 'Sarah Jenkins' : 'Hive Neural Matcher'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`text-sm p-3 rounded-xl shadow-sm leading-relaxed max-w-[95%] ${
                msg.sender === 'recruiter'
                  ? 'bg-surface-container-highest text-on-surface rounded-tr-none border border-white/5'
                  : 'bg-surface-container text-on-surface rounded-tl-none border border-primary/20 space-y-2.5'
              }`}
            >
              <p>{msg.text}</p>

              {msg.breakdown && (
                <div className="bg-surface-container-lowest p-2.5 rounded-lg space-y-2 border border-white/5">
                  <div className="flex justify-between items-center font-mono text-xs">
                    <span className="text-on-surface-variant">Production RAG Architecture</span>
                    <span className="text-tertiary font-semibold">{msg.breakdown.ragCandidates}</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-tertiary h-full rounded-full"
                      style={{ width: `${msg.breakdown.ragRatio}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center font-mono text-xs pt-1">
                    <span className="text-on-surface-variant">OSS / Patents Contributor</span>
                    <span className="text-secondary font-semibold">{msg.breakdown.ossCandidates}</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-secondary h-full rounded-full"
                      style={{ width: `${msg.breakdown.ossRatio}%` }}
                    />
                  </div>

                  <p className="text-xs text-primary font-medium pt-1">
                    {msg.breakdown.highlightProfile}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Generated Natural Language Filter Tokens Strip */}
      <div className="mt-3 pt-3 border-t border-white/5 bg-surface-container-lowest/60 -mx-4 px-4 py-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] uppercase text-on-surface-variant flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-[14px] text-primary">filter_alt</span>
            Active NL Criteria Vectors ({activeTokens.length})
          </span>
          {activeTokens.length > 0 && (
            <button
              onClick={handleReset}
              className="font-mono text-xs text-primary hover:underline flex items-center gap-0.5"
            >
              <span>Reset Filters</span>
              <span className="material-symbols-outlined text-[13px]">close</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {activeTokens.map((token) => (
            <span
              key={token}
              className="inline-flex items-center gap-1 bg-surface-container px-2 py-1 rounded text-primary font-mono text-xs border border-primary/20"
            >
              <span>{token}</span>
              <span
                onClick={() => onRemoveToken(token)}
                className="material-symbols-outlined text-[13px] text-on-surface-variant hover:text-white cursor-pointer"
              >
                cancel
              </span>
            </span>
          ))}
          {activeTokens.length === 0 && (
            <span className="text-xs text-on-surface-variant italic">
              No active criteria tokens. Type prompt or click quick tags.
            </span>
          )}
        </div>
      </div>

      {/* Conversational Input Form */}
      <form onSubmit={handleSendMessage} className="mt-3">
        <div className="relative bg-surface-container-lowest rounded-xl p-2.5 flex flex-col gap-2 border border-white/10 shadow-inner">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            rows={2}
            placeholder='Ask Hive AI to filter, e.g. "Find candidates with startup founding experience or FinTech background..."'
            className="w-full bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none resize-none px-1"
          />

          <div className="flex items-center justify-between pt-1 px-1">
            <div className="flex items-center gap-1 text-on-surface-variant">
              <button
                type="button"
                className="p-1 hover:text-on-surface hover:bg-surface-container-high rounded"
                title="Attach requisition benchmark"
              >
                <span className="material-symbols-outlined text-[18px]">attachment</span>
              </button>
              <button
                type="button"
                className="p-1 hover:text-on-surface hover:bg-surface-container-high rounded"
                title="Strict vector threshold switch"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </button>
              <span className="font-mono text-[10px] text-on-surface-variant/70 ml-1">
                Context: Req #AH-2049
              </span>
            </div>

            <button
              type="submit"
              className="bg-primary text-black font-semibold font-mono text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow hover:bg-amber-400 transition-all active:scale-95"
            >
              <span>Run Filter</span>
              <span className="material-symbols-outlined text-[15px]">send</span>
            </button>
          </div>
        </div>

        {/* Quick Query Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase shrink-0">
            Quick prompts:
          </span>
          {quickPrompts.map((p) => (
            <button
              key={p.token}
              type="button"
              onClick={() => onAddToken(p.token)}
              className="shrink-0 bg-surface-container-high hover:bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant hover:text-on-surface font-mono text-xs border border-white/5 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
