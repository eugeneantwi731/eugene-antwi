const Anthropic = require('@anthropic-ai/sdk');
const { MongoClient, ServerApiVersion } = require('mongodb');

// Reuse connection across warm function invocations
let cachedClient = null;

async function getMongoClient() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  await client.connect();
  cachedClient = client;
  return client;
}

exports.handler = async (event, context) => {
  // Keep connection alive between Netlify function invocations
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message, conversationId, conversationHistory, pageUrl } = JSON.parse(event.body);

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const messages = conversationHistory || [
      { role: "user", content: message }
    ];

    const startTime = Date.now();
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: messages
    });
    const responseTime = Date.now() - startTime;

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const estimatedCost = ((inputTokens * 0.000001) + (outputTokens * 0.000002)).toFixed(6);
    const replyText = response.content[0].text;
    const turnNumber = conversationHistory?.length || 1;

    // Save to MongoDB
    try {
      const client = await getMongoClient();
      const db = client.db("boahemaa");

      // Log individual message turn
      await db.collection("conversations").insertOne({
        conversation_id: conversationId,
        turn: turnNumber,
        user_message: message,
        assistant_response: replyText,
        page_url: pageUrl || null,
        ip: event.headers['x-forwarded-for'] || 'unknown',
        user_agent: event.headers['user-agent'] || 'unknown',
        response_time_ms: responseTime,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
        estimated_cost_usd: parseFloat(estimatedCost),
        created_at: new Date(),
      });

      // Upsert session summary (one doc per conversation)
      await db.collection("sessions").updateOne(
        { conversation_id: conversationId },
        {
          $set: {
            last_active: new Date(),
            page_url: pageUrl || null,
            ip: event.headers['x-forwarded-for'] || 'unknown',
          },
          $inc: {
            total_turns: 1,
            total_tokens: inputTokens + outputTokens,
            total_cost_usd: parseFloat(estimatedCost),
          },
          $setOnInsert: {
            conversation_id: conversationId,
            started_at: new Date(),
          }
        },
        { upsert: true }
      );

    } catch (dbError) {
      // Don't fail the whole request if DB write fails
      console.error('MongoDB error:', dbError.message);
    }

    // Keep your existing console logs for Netlify's built-in log viewer
    console.log('--- Boahemaa Turn ---');
    console.log('Conversation ID:', conversationId);
    console.log('Turn:', turnNumber);
    console.log('Page:', pageUrl || 'unknown');
    console.log('User message:', message);
    console.log('Response preview:', replyText.substring(0, 100));
    console.log('Response time:', responseTime + 'ms');
    console.log('Tokens:', inputTokens + ' in / ' + outputTokens + ' out');
    console.log('Estimated cost: $' + estimatedCost);
    console.log('--- End ---');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        response: response,
        metadata: {
          conversationId,
          timestamp: new Date().toISOString(),
          responseTime
        }
      })
    };

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};