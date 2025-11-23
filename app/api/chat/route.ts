import { groq } from '@ai-sdk/groq';
import { streamText, tool, convertToModelMessages, stepCountIs } from 'ai'; // Gunakan streamText, bukan Experimental_Agent
import type { ModelMessage } from 'ai';
import { getUserProfile } from '@/lib/data/index';
import { getSearchPreferencesByUserId } from '@/lib/data/preferences';
import { searchParametersSchema } from '@/lib/schema';
import { handleUpdateTripIntent } from '@/lib/tools/updateTripIntent';

export const maxDuration = 30;

export async function POST(req: Request) {
  // 1. Parse Payload
  const { messages: uiMessages, model } = await req.json();

  // Helper: extract readable text from a UIMessage for logging
  function extractTextFromUIMessage(msg: unknown): string | undefined {
    if (!msg || typeof msg !== 'object') return undefined;
    const m = msg as { content?: unknown; parts?: unknown };
    if (typeof m.content === 'string') return m.content;
    if (Array.isArray(m.parts)) {
      return m.parts
        .map((p) => {
          if (typeof p === 'string') return p;
          if (p && typeof (p as { text?: unknown }).text === 'string') return (p as { text?: string }).text;
          return '';
        })
        .filter(Boolean)
        .join(' ');
    }
    return undefined;
  }
  const lastUIMessage = Array.isArray(uiMessages) && uiMessages.length > 0 ? uiMessages[uiMessages.length - 1] : null;

  console.log('\n🟢 --- NEW CHAT REQUEST ---');
  console.log(`🤖 Model Requested: ${model || 'default'}`);
  if (lastUIMessage?.role === 'user') {
    const txt = extractTextFromUIMessage(lastUIMessage) ?? 'undefined';
    console.log(`👤 User Query: "${txt}"`);
  }
  console.log('-----------------------------\n');
  // ---------------------------------------------------------

  // 2. Ambil Context (Tetap sama)
  const user = await getUserProfile();
  const searchPreferences = user ? await getSearchPreferencesByUserId(user.id) : null;
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 3. Konversi UIMessage[] ke ModelMessage[] sebelum dipass ke SDK
  let modelMessages: ModelMessage[] = [];
  try {
    modelMessages = convertToModelMessages(uiMessages || []);
  } catch (err) {
    console.error('Failed to convert UI messages to model messages:', err);
    throw err;
  }

  // 4. Eksekusi Chat dengan streamText (SOLUSI MASALAH ANDA)
  let result: unknown;
  try {
    result = streamText({
      model: groq(model || 'llama-3.1-70b-versatile'), // Fallback model wajib ada
      messages: modelMessages, // gunakan modelMessages setelah konversi

      // System Prompt (Saya rapikan sedikit agar hemat token)
      system: `IDENTITY:
    You are a professional Travel Planner for user named ${user?.name || 'Guest'}.
    Today: ${today}.
    User travel plans: ${JSON.stringify(searchPreferences || {}, null, 2)}
    
    TASK:
    If user travel plan not complete, do alicitation about user travel plans. Collect this mandatory information: Origin, Destination, Start/End Date, number of travelers. and collect this optional information: hotel requirements, budget, and Activity Type.
    
    RULES:
    1. call tool 'update_trip_intent' when user provides trip info.
    2. Do not ask for everything at once. Be conversational.
    3. If user travel plan is complete, show a brief summary of the plan and suggest "Do you want me to make iterary for you?".`,
      stopWhen: stepCountIs(10),
      // DEFINISI TOOLS (Ini yang menyebabkan error sebelumnya, sekarang akan aman)
      tools: {
        update_trip_intent: tool({
          description: 'Save/Update travel preferences based on user chat.',
          inputSchema: searchParametersSchema, // Zod Schema Anda masuk di sini
          execute: async (input, options) => {
            console.log('✅ Tool Executed with Data (raw):', input, 'toolCallOptions:', options?.toolCallId);
            const result = await handleUpdateTripIntent(input, user, options?.toolCallId);
            console.log('✅ Tool handler returned:', result);
            return result;
          },
        }),
      },
    });
  } catch (err) {
    console.error('streamText failed:', err);
    throw err;
  }

  // 4. Return Stream Response
  return (result as { toUIMessageStreamResponse: (opts: { sendSources: boolean; sendReasoning: boolean }) => Response }).toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
