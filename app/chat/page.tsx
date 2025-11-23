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
import { CopyIcon, RefreshCcwIcon } from 'lucide-react';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai-elements/sources';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
// debug panel uses a fixed schemaFields list; no direct import of zod schema needed here
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
  const [showSchema, setShowSchema] = useState(false);
  const { messages, sendMessage, status, regenerate } = useChat();
  // list of fields we expect in the schema (kept explicit to render nicely)
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

  // compute detected params by scanning messages for the latest JSON/object containing any schema keys
  const detectedParams = useMemo<Record<string, unknown> | null>(() => {
    const keys = schemaFields.map((f) => f.key);
    let found: Record<string, unknown> | null = null;

    if (!messages || messages.length === 0) return null;

    // scan messages from most recent to oldest
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      for (const partRaw of m.parts) {
        const part = partRaw as Record<string, unknown>;

        // If provider/tool parts have structured output property, check that first
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

        // If text part contains JSON, try to parse
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

  // persisted search preferences (loaded from server-backed storage)
  const [sessionParams, setSessionParams] = useState<Record<string, unknown> | null>(null);

  // load persisted params from server on mount
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

  // displayParams merges persisted DB values with the most-recently detected params
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
  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-[90vh]">
      <div className="flex flex-col h-full">
        {/* Debug panel: toggle to show searchParametersSchema for easier debugging */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded bg-gray-200 text-sm" onClick={() => setShowSchema((s) => !s)} title="Toggle schema debug view">
              {showSchema ? 'Hide' : 'Show'} searchParametersSchema
            </button>
            <button
              className="px-2 py-1 rounded bg-red-100 text-sm text-red-700"
              onClick={async () => {
                try {
                  await fetch('/api/preferences', { method: 'DELETE' });
                } catch (e) {
                  console.debug('Failed to clear persisted preferences on server', e);
                }
                setSessionParams(null);
              }}
              title="Clear persisted search parameters (server)"
            >
              Clear
            </button>
          </div>
          {showSchema && (
            <div className="mt-2 p-3 bg-slate-200 bg-opacity-5 rounded max-h-64 overflow-auto text-sm">
              <div className="mb-2 font-medium">Search Parameters (detected)</div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr>
                    <th className="pb-1">Field</th>
                    <th className="pb-1">Type</th>
                    <th className="pb-1">Value</th>
                    <th className="pb-1">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schemaFields.map((f) => {
                    const val = (displayParams as Record<string, unknown>)[f.key] as unknown;
                    const isFilled = typeof val !== 'undefined' && val !== null && String(val).trim() !== '';
                    return (
                      <tr key={f.key} className="align-top">
                        <td className="py-1 pr-2 font-medium">{f.label}</td>
                        <td className="py-1 pr-2 text-muted-foreground">{f.type}</td>
                        <td className="py-1 pr-2 wrap-break-word">{isFilled ? String(val) : <span className="text-gray-400">—</span>}</td>
                        <td className="py-1">{isFilled ? <span className="text-green-600">Filled</span> : <span className="text-gray-500">Empty</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-3 text-xs">
                <div className="font-medium">Raw detected object (merged session + latest)</div>
                <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(displayParams ?? {}, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
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
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <Message key={`${message.id}-${i}`} from={message.role}>
                          <MessageContent>
                            <MessageResponse>{part.text}</MessageResponse>
                          </MessageContent>
                          {message.role === 'assistant' && i === messages.length - 1 && (
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
                        <Reasoning key={`${message.id}-${i}`} className="w-full" isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}>
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
          <PromptInputHeader>
            <PromptInputAttachments>{(attachment) => <PromptInputAttachment data={attachment} />}</PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea onChange={(e) => setInput(e.target.value)} value={input} />
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
    </div>
  );
};
export default ChatBot;
