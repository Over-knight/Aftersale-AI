# Supabase Edge Functions Setup

## API Key Setup

The `generate-campaign` function has been updated to use **Google Gemini API** (FREE tier available).

### How to Get Your FREE Google Gemini API Key:

1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click "Get API Key" → "Create API Key"
4. Copy the generated key

### Add the API Key to Supabase:

#### Option 1: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project: https://supabase.com/dashboard/project/iviuepdbmkszuhtdmksd
2. Click **Project Settings** (gear icon)
3. Go to **Edge Functions** → **Secrets**
4. Add new secret:
   - Name: `GOOGLE_GEMINI_API_KEY`
   - Value: Your API key from step 3 above
5. Click **Save**

#### Option 2: Via Supabase CLI
```bash
supabase secrets set GOOGLE_GEMINI_API_KEY=your_actual_key_here
```

## Alternative API Options

If you prefer other AI providers, here are alternatives:

### OpenAI (GPT-3.5/4)
- Website: https://platform.openai.com/api-keys
- Cost: ~$0.0005 per request
- Replace endpoint in `generate-campaign/index.ts` with:
  ```typescript
  https://api.openai.com/v1/chat/completions
  ```

### Groq (Fast & FREE tier)
- Website: https://console.groq.com/
- Cost: FREE tier available
- Very fast inference
- Replace endpoint with:
  ```typescript
  https://api.groq.com/openai/v1/chat/completions
  ```

### Anthropic Claude
- Website: https://console.anthropic.com/
- Cost: Pay as you go
- High quality responses

## Testing the Function

After setting up the API key, test it:

```bash
curl -X POST https://iviuepdbmkszuhtdmksd.supabase.co/functions/v1/generate-campaign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "event_type": "after_purchase",
    "tone": "casual",
    "customer_name": "John Doe",
    "products": ["Product A"]
  }'
```

## Deploying Functions

Deploy all functions:
```bash
supabase functions deploy
```

Deploy specific function:
```bash
supabase functions deploy generate-campaign
```

## Environment Variables Required

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `GOOGLE_GEMINI_API_KEY` | Google AI API key | https://aistudio.google.com/app/apikey |
| `SUPABASE_URL` | Auto-provided by Supabase | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided by Supabase | - |
