import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_type, tone, customer_name, products } = await req.json();

    if (!event_type) {
      throw new Error('event_type is required');
    }

    // Use Google Gemini API (FREE tier available)
    // Get your free API key at: https://aistudio.google.com/app/apikey
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured. Get a free key at: https://aistudio.google.com/app/apikey');
    }

    // Build prompt based on event type
    const customerContext = customer_name ? ` for ${customer_name}` : '';
    const productContext = products ? ` regarding products: ${JSON.stringify(products)}` : '';

    let basePrompt = '';
    switch (event_type) {
      case 'after_purchase':
        basePrompt = `Generate a thank you message${customerContext}${productContext}. Express gratitude and encourage future purchases.`;
        break;
      case 'birthday':
        basePrompt = `Generate a birthday message${customerContext}. Make it warm and include a special offer.`;
        break;
      case 'reorder':
        basePrompt = `Generate a reorder reminder message${customerContext}${productContext}. Remind them it's time to restock.`;
        break;
      case 'cross_sell':
        basePrompt = `Generate a cross-sell message${customerContext}${productContext}. Suggest complementary products.`;
        break;
      case 'win_back':
        basePrompt = `Generate a win-back message${customerContext}. Re-engage inactive customers with compelling offers.`;
        break;
      default:
        basePrompt = `Generate a customer retention message${customerContext}${productContext}.`;
    }

    const fullPrompt = `You are an expert marketing copywriter specializing in customer retention messages.

${basePrompt}

Requirements:
- Use a ${tone || 'formal'} tone
- Keep the message concise (2-3 sentences)
- Make it friendly and actionable
- Return only the message text without any formatting or explanation

Generate the message now:`;

    // Generate 3 variations using Google Gemini
    const messages = [];
    for (let i = 0; i < 3; i++) {
      const variantPrompt = i === 0 
        ? fullPrompt 
        : fullPrompt + ` This is variation ${i + 1}, make it unique from previous versions.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: variantPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 150,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Gemini API error:', response.status, errorText);
        
        // Fallback to template-based messages if API fails
        if (messages.length === 0) {
          throw new Error('Failed to generate campaign message. Check your GOOGLE_GEMINI_API_KEY.');
        }
        continue;
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;

      messages.push({
        id: i + 1,
        message: generatedText.trim(),
        tone: tone || 'formal',
      });
    }

    return new Response(JSON.stringify({ messages }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-campaign function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
