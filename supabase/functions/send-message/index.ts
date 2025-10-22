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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { campaign_id, customer_ids } = await req.json();

    if (!campaign_id || !customer_ids || !Array.isArray(customer_ids)) {
      throw new Error('campaign_id and customer_ids array are required');
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaign_id)
      .eq('user_id', user.id)
      .single();

    if (campaignError) throw campaignError;

    // Get customer details
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .in('id', customer_ids)
      .eq('user_id', user.id);

    if (customersError) throw customersError;

    const results = [];

    // Send messages to each customer
    for (const customer of customers) {
      try {
        // Simulate message sending based on delivery channel
        let deliveryStatus = 'sent';
        
        console.log(`Sending ${campaign.delivery_channel} to ${customer.email}`);
        console.log(`Message: ${campaign.message}`);

        // In a real implementation, you would:
        // - For email: integrate with SendGrid, Resend, or similar
        // - For SMS: integrate with Twilio, AWS SNS, or similar
        // - For WhatsApp: integrate with WhatsApp Business API

        // Create message log
        const { data: log, error: logError } = await supabase
          .from('message_logs')
          .insert({
            customer_id: customer.id,
            campaign_id: campaign.id,
            delivery_status: deliveryStatus,
          })
          .select()
          .single();

        if (logError) {
          console.error('Error creating log:', logError);
          deliveryStatus = 'failed';
        }

        results.push({
          customer_id: customer.id,
          customer_email: customer.email,
          status: deliveryStatus,
          log_id: log?.id,
        });
      } catch (error) {
        console.error(`Error sending to ${customer.email}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          customer_id: customer.id,
          customer_email: customer.email,
          status: 'failed',
          error: errorMessage,
        });
      }
    }

    // Update campaign status to active if not already
    if (campaign.status === 'draft') {
      await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', campaign_id);
    }

    return new Response(JSON.stringify({ 
      message: 'Messages sent',
      results,
      total: results.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-message function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
