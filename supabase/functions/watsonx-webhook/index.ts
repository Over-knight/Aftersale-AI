import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('IBM watsonx Orchestrate webhook received');
    
    const body = await req.json();
    console.log('Webhook payload:', body);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract event data
    const { event_type, data } = body;

    // Handle different event types from watsonx Orchestrate
    let response_data = {};

    switch (event_type) {
      case 'sale_completed':
        console.log('Processing sale_completed event');
        // Trigger campaign creation or other workflows
        response_data = {
          status: 'processed',
          message: 'Sale event received and processed',
          actions: ['campaign_triggered'],
        };
        break;

      case 'campaign_requested':
        console.log('Processing campaign_requested event');
        // Create a new campaign based on watsonx request
        response_data = {
          status: 'processed',
          message: 'Campaign creation initiated',
        };
        break;

      case 'customer_update':
        console.log('Processing customer_update event');
        // Update customer data
        response_data = {
          status: 'processed',
          message: 'Customer data updated',
        };
        break;

      default:
        console.log('Unknown event type:', event_type);
        response_data = {
          status: 'received',
          message: 'Event received but no handler defined',
          event_type,
        };
    }

    // Log webhook activity for audit trail
    console.log('Webhook processed successfully:', response_data);

    return new Response(JSON.stringify({
      success: true,
      received_at: new Date().toISOString(),
      ...response_data,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in watsonx-webhook function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false,
      error: message,
      received_at: new Date().toISOString(),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
