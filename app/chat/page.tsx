'use client';

import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse, MessageActions, MessageAction } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { useState, useEffect, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { CopyIcon, RefreshCcwIcon, Settings2 } from 'lucide-react'; // Added Settings icon
import DraftTripCard from '@/components/trips/DraftTripCard';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai-elements/sources';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import DebugPreferences from '@/components/ai-elements/DebugPreferences';
// DraftTripCard handles rendering of draft trip and booking cards
// Typed shapes for draft trip + bookings fetched from server
type BookingItem = {
  id: string;
  type: 'FLIGHT' | 'HOTEL' | 'ACTIVITY' | string;
  totalAmount?: number;
  bookingDetails?: string | Record<string, unknown>;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  status?: string;
};

type DraftTrip = {
  id: string;
  userId?: string;
  name?: string;
  description?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  bookings?: BookingItem[];
};

const models = [
  {
    name: 'GPT OSS 20B',
    value: 'openai/gpt-oss-20b',
  },
  {
    name: 'LLaMA 3.1 8B Instant',
    value: 'llama-3.1-8b-instant',
  },
  {
    name: 'LLaMA 3.3 70B Versatile',
    value: 'llama-3.3-70b-versatile',
  },
];

const ChatBot = () => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  // showSchema default true agar panel kiri terlihat isinya (atau bisa diatur sesuai kebutuhan komponen DebugPreferences)
  const [showSchema, setShowSchema] = useState(true);
  const { messages, sendMessage, status, regenerate } = useChat();

  const schemaFields = useMemo(
    () => [
      { key: 'origin', label: 'Origin', type: 'string' },
      { key: 'destination', label: 'Destination', type: 'string' },
      { key: 'startDate', label: 'Start Date', type: 'YYYY-MM-DD (string)' },
      { key: 'endDate', label: 'End Date', type: 'YYYY-MM-DD (string)' },
      { key: 'numTravelers', label: 'Number of Travelers', type: 'number' },
      { key: 'budget', label: 'Budget (per night)', type: 'number' },
      { key: 'hotelRequirements', label: 'Hotel Requirements', type: 'string' },
      { key: 'activityType', label: 'Activity Type', type: 'enum|string' },
    ],
    []
  );

  const detectedParams = useMemo<Record<string, unknown> | null>(() => {
    const keys = schemaFields.map((f) => f.key);
    let found: Record<string, unknown> | null = null;

    if (!messages || messages.length === 0) return null;

    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      for (const partRaw of m.parts) {
        const part = partRaw as Record<string, unknown>;

        if (part && typeof part === 'object' && 'output' in part) {
          const out = part.output as unknown;
          if (out && typeof out === 'object') {
            const obj = out as Record<string, unknown>;
            if (keys.some((k) => k in obj)) {
              found = obj;
              break;
            }
          }
        }

        if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') {
          const txt = (part.text as string).trim();
          if (txt.startsWith('{') || txt.startsWith('[')) {
            try {
              const parsed = JSON.parse(txt);
              if (parsed && typeof parsed === 'object' && keys.some((k) => k in parsed)) {
                found = parsed as Record<string, unknown>;
                break;
              }
            } catch (err) {
              console.debug('schema debug: text part not JSON', err);
            }
          }
        }
      }
      if (found) break;
    }

    return found;
  }, [messages, schemaFields]);

  const [sessionParams, setSessionParams] = useState<Record<string, unknown> | null>(null);
  const [draftTrip, setDraftTrip] = useState<DraftTrip | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/preferences');
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setSessionParams(Object.keys(data || {}).length ? (data as Record<string, unknown>) : null);
      } catch (e) {
        console.debug('Failed to load persisted preferences from server', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch draft trip when messages change or on mount
  useEffect(() => {
    let mounted = true;
    async function fetchDraft() {
      setDraftLoading(true);
      try {
        const res = await fetch('/api/trips/draft');
        if (!res.ok) {
          setDraftTrip(null);
          return;
        }
        const data = await res.json();
        if (mounted) setDraftTrip(data.trip ?? null);
      } catch (err) {
        console.debug('Failed to fetch draft trip', err);
      } finally {
        if (mounted) setDraftLoading(false);
      }
    }
    fetchDraft();
    return () => {
      mounted = false;
    };
  }, [messages.length]);

  const displayParams = useMemo(() => ({ ...(sessionParams || {}), ...(detectedParams || {}) }), [sessionParams, detectedParams]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) {
      return;
    }
    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files,
      },
      {
        body: {
          model: model,
        },
      }
    );
    setInput('');
  };

  // draftTrip is passed into DraftTripCard for rendering and actions

  return (
    // Main Container: Full Height, Max Width
    <div className="h-[90vh] w-full max-w-[1600px] mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-6 h-full">
        {/* --- LEFT PANEL: CHAT --- */}
        <main className="flex-1 flex flex-col h-full min-w-0 bg-background border rounded-xl shadow-sm overflow-hidden relative">
          <div className="flex-1 overflow-hidden relative">
            <Conversation className="h-full w-full">
              <ConversationContent className="p-4 md:p-6">
                {messages.map((message) => (
                  <div key={message.id} className="mb-6 last:mb-0">
                    {/* Sources Rendering */}
                    {message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                      <Sources>
                        <SourcesTrigger count={message.parts.filter((part) => part.type === 'source-url').length} />
                        {message.parts
                          .filter((part) => part.type === 'source-url')
                          .map((part, i) => (
                            <SourcesContent key={`${message.id}-${i}`}>
                              <Source key={`${message.id}-${i}`} href={part.url} title={part.url} />
                            </SourcesContent>
                          ))}
                      </Sources>
                    )}

                    {/* Message Parts Rendering */}
                    {message.parts.map((part, i) => {
                      try {
                        // Structured Tool Outputs (e.g., Flight Options)
                        const maybePart: unknown = part;
                        if (maybePart && typeof maybePart === 'object') {
                          const mp = maybePart as Record<string, unknown>;
                          if (mp.output && typeof mp.output === 'object') {
                            const out = mp.output as Record<string, unknown>;
                            if (Array.isArray(out.options)) {
                              const options = out.options as Array<Record<string, unknown>>;
                              return (
                                <div key={`${message.id}-options-${i}`} className="my-4 pl-4 border-l-2 border-primary/20">
                                  <div className="mb-3 font-semibold text-sm uppercase tracking-wide text-muted-foreground">Flight options</div>
                                  <div className="grid grid-cols-1 gap-3">
                                    {options.map((opt) => {
                                      const id = String(opt.id ?? `${message.id}-${i}`);
                                      const summary = String(opt.summary ?? 'Option');
                                      const provider = String(opt.provider ?? '');
                                      const cabin = String(opt.cabin ?? '');
                                      const priceVal = (opt.price ?? '') as unknown;
                                      const priceDisplay = typeof priceVal === 'number' ? (priceVal as number).toLocaleString() : String(priceVal);
                                      return (
                                        <div key={id} className="p-4 border bg-card rounded-lg flex justify-between items-center hover:shadow-md transition-shadow">
                                          <div>
                                            <div className="text-sm font-semibold">{summary}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                              {provider} • {cabin}
                                            </div>
                                            <div className="text-sm font-medium mt-1 text-primary">Price: {priceDisplay}</div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            }
                          }
                        }

                        switch (part.type) {
                          case 'text':
                            return (
                              <Message key={`${message.id}-${i}`} from={message.role}>
                                <MessageContent>
                                  <MessageResponse>{part.text}</MessageResponse>
                                </MessageContent>
                                {message.role === 'assistant' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id && (
                                  <MessageActions>
                                    <MessageAction onClick={() => regenerate()} label="Retry">
                                      <RefreshCcwIcon className="size-3" />
                                    </MessageAction>
                                    <MessageAction onClick={() => navigator.clipboard.writeText(part.text)} label="Copy">
                                      <CopyIcon className="size-3" />
                                    </MessageAction>
                                  </MessageActions>
                                )}
                              </Message>
                            );
                          case 'reasoning':
                            return (
                              <Reasoning key={`${message.id}-${i}`} className="w-full mb-2" isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}>
                                <ReasoningTrigger />
                                <ReasoningContent>{part.text}</ReasoningContent>
                              </Reasoning>
                            );
                          default:
                            return null;
                        }
                      } catch (err) {
                        console.error('Render part failed', err);
                        return null;
                      }
                    })}
                  </div>
                ))}
                {status === 'submitted' && <Loader />}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background/80 backdrop-blur-sm border-t z-10">
            <PromptInput onSubmit={handleSubmit} className="w-full" globalDrop multiple>
              <PromptInputHeader>
                <PromptInputAttachments>{(attachment) => <PromptInputAttachment data={attachment} />}</PromptInputAttachments>
              </PromptInputHeader>
              <PromptInputBody>
                <PromptInputTextarea onChange={(e) => setInput(e.target.value)} value={input} placeholder="Type your message here..." className="min-h-[50px]" />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools>
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                  <PromptInputSelect
                    onValueChange={(value) => {
                      setModel(value);
                    }}
                    value={model}
                  >
                    <PromptInputSelectTrigger>
                      <PromptInputSelectValue />
                    </PromptInputSelectTrigger>
                    <PromptInputSelectContent>
                      {models.map((model) => (
                        <PromptInputSelectItem key={model.value} value={model.value}>
                          {model.name}
                        </PromptInputSelectItem>
                      ))}
                    </PromptInputSelectContent>
                  </PromptInputSelect>
                </PromptInputTools>
                <PromptInputSubmit disabled={!input && !status} status={status} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </main>

        {/* --- RIGHT PANEL: Travel Panel --- */}
        <aside className="flex-1 w-full md:w-80 lg:w-96 flex flex-col gap-4 h-full shrink-0">
          <div className="bg-muted/30 border rounded-xl p-4 h-full overflow-y-auto shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b">
              <Settings2 className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold text-lg">Travel Panel</h2>
            </div>

            {/* Debug preferences always shown at top */}
            <div className="space-y-4">
              <DebugPreferences
                show={showSchema}
                onToggle={() => setShowSchema((s) => !s)}
                onClear={async () => {
                  try {
                    await fetch('/api/preferences', { method: 'DELETE' });
                  } catch (e) {
                    console.debug('Failed to clear persisted preferences on server', e);
                  }
                  setSessionParams(null);
                }}
                schemaFields={schemaFields}
                displayParams={displayParams}
              />

              {/* Draft trip shown below DebugPreferences if present */}
              {draftLoading ? (
                <div>Loading draft...</div>
              ) : draftTrip ? (
                <DraftTripCard
                  draftTrip={draftTrip}
                  onDeleted={() => {
                    setDraftTrip(null);
                  }}
                  onCheckoutSuccess={async (data) => {
                    setDraftTrip(null);
                    await sendMessage({ text: `Checked out trip ${draftTrip.id}: ${JSON.stringify(data)}` });
                  }}
                />
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChatBot;
