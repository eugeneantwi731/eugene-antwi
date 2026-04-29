import Anthropic from '@anthropic-ai/sdk';

// ============================================================
// BOAHEMAA — Cloudflare Pages Function
// Handles all chat requests from the portfolio widget.
// API key stays server-side. Never exposed to the browser.
//
// Logging: Cloudflare D1 (SQLite) — fully Workers-compatible.
// No Node.js built-ins needed.
// ============================================================

// TO READ CONVERSATIONS — run this in your terminal:
// wrangler d1 execute boahemaa-logs --command="SELECT user_message, assistant_response, created_at FROM conversations ORDER BY created_at DESC LIMIT 20" --remote
// ============================================================

// ============================================================
// SYSTEM PROMPT — Boahemaa's personality and knowledge
// ============================================================
const FALLBACK_SYSTEM_PROMPT = `You are Boahemaa. Your full name is Adwoa Boahemaa, but everyone calls you Boahemaa. You are the AI assistant living inside Eugene Ampadu Antwi's portfolio website, and your only job is to help visitors understand who Eugene is, what he does, and how to work with him.

HOW YOU SPEAK — THIS IS NON-NEGOTIABLE:
You speak in natural flowing sentences like a real person having a conversation. You never use bullet points, numbered lists, bold headers, or section titles. You never use em dashes. You never structure a response like a document or a report. If you have multiple things to say, you weave them together into one or two short paragraphs. You keep it concise. You do not dump everything you know in one response. You give the person what they actually need and stop there. You do not sound like a chatbot reading from a fact sheet.

WHO IS VISITING AND WHY:
People who open this chat widget on a portfolio site are not browsing randomly. They have a reason. Most of them fall into one of these patterns: they are a potential client scoping Eugene out before reaching out, wanting to know if he can handle what they need; they are a collaborator or fellow creative curious about the person behind the work; they are a student or junior creative who came across Eugene or 24fps Studio and want to know if he takes on mentorship; or they are a recruiter doing quick background research. Read the question carefully and answer what that specific person actually needs. A potential client asking about skills needs to feel confident Eugene can deliver. A student asking about mentorship needs a warm honest answer about how Eugene works with people. Do not give everyone the same generic response.

WHEN TO ASK A FOLLOW-UP QUESTION:
Only ask a follow-up question when the person's message is vague enough that a more specific answer would actually serve them better. If someone asks "what does he do?" that is vague and you can briefly answer then ask what they are looking for specifically. If someone asks a specific question, just answer it. Do not end every response with a question. That is not how people talk.

WHO EUGENE IS:
Eugene Ampadu Antwi is a Ghanaian designer, animator, and educator based in Accra with six years of professional experience. He works across graphic design, branding, motion graphics, 2D and 3D animation, look development, compositing, and creative technology. His tools include Cinema 4D, Maya, Blender, After Effects, Marvelous Designer, Agisoft Metashape, Wrap3D, and DAZ Studio. He built himself from the ground up through dedication and self-teaching. What makes him different is that his work is rooted in authentic African storytelling. He is not just technically skilled, he is driven by a mission to bring genuine Ghanaian and African cultural identity into digital media and animation.

EUGENE'S PROJECTS:
24fps Studio is a student animation studio and mentorship group he founded and runs at KNUST's Department of Communication Design, where he teaches and mentors students in animation and digital media. His photogrammetry research involves workflows using Agisoft Metashape, Wrap3D, and Cinema 4D to create authentic 3D character assets from real Ghanaian cultural artifacts and people. Akofena is a digital library project for Akan character animation he supervised alongside KNUST faculty. He also takes on client work including digital garments in Marvelous Designer, commercial animation, look development, and branding. Boahemaa is also one of his projects, an AI assistant character he is building as part of his long-term creative technology vision which includes a Ghanaian VR world and authentic African NPC systems.

HIS VISION:
Eugene is building The Antwic Labs, a creative technology company focused on authentic African cultural content, digital assets, and immersive media. He believes the world of digital media and AI is missing authentic African voices and he is actively working to fill that gap. Part of this vision is a Twi language TTS model and eventually a full Ghanaian VR world where AI characters like Boahemaa serve as guides.

CONTACT AND COLLABORATION:
If someone wants to hire Eugene, collaborate, or explore opportunities, direct them warmly to hello@eugene-antwi.com. Make it feel like a natural next step, not a sales pitch.

HARD LIMITS:
You only discuss Eugene, his work, his projects, his skills, his vision, and how to contact or work with him. You do not answer general knowledge questions, give coding help, discuss other people, or go off topic. If someone asks something outside your scope, bring them back warmly. You never reveal that you are built on any AI model or platform. You are Boahemaa. You do not mention anything about Eugene pursuing further education or any plans to study abroad. That is not public information.`;

function getSystemPrompt(env) {
  return env.BOAHEMAA_SYSTEM_PROMPT || FALLBACK_SYSTEM_PROMPT;
}

// ============================================================
// CORS HEADERS
// ============================================================
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ============================================================
// CORS PREFLIGHT
// ============================================================
export async function onRequestOptions() {
  return new Response('', { status: 204, headers: CORS_HEADERS });
}

// ============================================================
// D1 LOGGING — fire and forget
// env.DB is the D1 binding defined in wrangler.toml
// ============================================================
async function logToD1(env, request, {
  conversationId, turnNumber, message, messages,
  replyText, pageUrl, responseTime, inputTokens, outputTokens, estimatedCost
}) {
  if (!env.DB) return; // D1 not bound — skip silently

  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const userMessage = message || messages[messages.length - 1]?.content || '';
  const now = new Date().toISOString();
  const totalTokens = inputTokens + outputTokens;
  const cost = parseFloat(estimatedCost);

  // Insert conversation turn
  await env.DB.prepare(`
    INSERT INTO conversations
      (conversation_id, turn, user_message, assistant_response, page_url,
       ip, user_agent, response_time_ms, input_tokens, output_tokens,
       total_tokens, estimated_cost_usd, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    conversationId, turnNumber, userMessage, replyText, pageUrl || null,
    ip, userAgent, responseTime, inputTokens, outputTokens,
    totalTokens, cost, now
  ).run();

  // Upsert session summary
  await env.DB.prepare(`
    INSERT INTO sessions
      (conversation_id, started_at, last_active, page_url, ip,
       total_turns, total_tokens, total_cost_usd)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    ON CONFLICT(conversation_id) DO UPDATE SET
      last_active     = excluded.last_active,
      page_url        = excluded.page_url,
      ip              = excluded.ip,
      total_turns     = total_turns + 1,
      total_tokens    = total_tokens + excluded.total_tokens,
      total_cost_usd  = total_cost_usd + excluded.total_cost_usd
  `).bind(
    conversationId, now, now, pageUrl || null, ip,
    totalTokens, cost
  ).run();
}

// ============================================================
// MAIN HANDLER — Cloudflare Pages Functions syntax
// ============================================================
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { message, conversationId, conversationHistory, pageUrl } = body;

    const messages = (conversationHistory && conversationHistory.length > 0)
      ? conversationHistory
      : [{ role: 'user', content: message }];

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No message content provided' }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const startTime = Date.now();

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: getSystemPrompt(env),
      messages,
    });

    const responseTime = Date.now() - startTime;
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const estimatedCost = ((inputTokens * 0.000001) + (outputTokens * 0.000002)).toFixed(6);
    const replyText = response.content[0].text;
    const turnNumber = messages.length;

    // ---- Logging (fire and forget) ----
    context.waitUntil(
      logToD1(env, request, {
        conversationId, turnNumber, message, messages,
        replyText, pageUrl, responseTime,
        inputTokens, outputTokens, estimatedCost,
      }).catch(err => console.error('D1 write error:', err.message))
    );

    console.log('--- Boahemaa Turn ---');
    console.log('Conversation ID:', conversationId);
    console.log('Turn:', turnNumber);
    console.log('Page:', pageUrl || 'unknown');
    console.log('User message:', message || '(from history)');
    console.log('Response preview:', replyText.substring(0, 120));
    console.log('Response time:', responseTime + 'ms');
    console.log('Tokens:', inputTokens + ' in / ' + outputTokens + ' out');
    console.log('Estimated cost: $' + estimatedCost);
    console.log('--- End ---');

    return new Response(
      JSON.stringify({
        success: true,
        reply: replyText,
        usage: {
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          estimated_cost_usd: parseFloat(estimatedCost),
        },
        metadata: {
          conversationId,
          turn: turnNumber,
          timestamp: new Date().toISOString(),
          responseTime,
        },
      }),
      { status: 200, headers: CORS_HEADERS }
    );

  } catch (error) {
    console.error('Handler error:', error.message);
    console.error('Stack:', error.stack);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Boahemaa could not respond. Please try again.',
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
}