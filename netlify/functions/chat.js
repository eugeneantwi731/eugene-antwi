const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message, conversationId, conversationHistory } = JSON.parse(event.body);
    
    // Log conversation metadata
    console.log('--- New Conversation ---');
    console.log('ID:', conversationId);
    console.log('Timestamp:', new Date().toISOString());
    console.log('IP:', event.headers['x-forwarded-for'] || 'Unknown');
    console.log('User Agent:', event.headers['user-agent']);
    console.log('Turn:', conversationHistory?.length || 1);
    console.log('User message:', message);

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const messages = conversationHistory || [
      { role: "user", content: message }
    ];

    const startTime = Date.now();
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: messages
    });
    const responseTime = Date.now() - startTime;

    // Log response metrics
    console.log('Response preview:', response.content[0].text.substring(0, 100));
    console.log('Response time:', responseTime + 'ms');
    console.log('Input tokens:', response.usage.input_tokens);
    console.log('Output tokens:', response.usage.output_tokens);
    console.log('Total tokens:', response.usage.input_tokens + response.usage.output_tokens);
    console.log('Estimated cost: $' + 
      ((response.usage.input_tokens * 0.000003) + 
       (response.usage.output_tokens * 0.000015)).toFixed(6));
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