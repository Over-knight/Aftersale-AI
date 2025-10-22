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

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const saleId = pathParts[pathParts.length - 1];

    // GET all sales or single sale
    if (req.method === 'GET') {
      if (saleId && saleId !== 'sales') {
        const { data, error } = await supabase
          .from('sales')
          .select('*, customers(*)')
          .eq('id', saleId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await supabase
        .from('sales')
        .select('*, customers(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST - Create sale / Ingest sale event
    if (req.method === 'POST') {
      const body = await req.json();
      const { customer_id, products, amount, trigger_campaign } = body;

      if (!customer_id || !products || !amount) {
        throw new Error('customer_id, products, and amount are required');
      }

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: user.id,
          customer_id,
          products,
          amount,
        })
        .select('*, customers(*)')
        .single();

      if (saleError) throw saleError;

      // If trigger_campaign is true, create a thank you campaign
      if (trigger_campaign) {
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .insert({
            user_id: user.id,
            name: `Thank You - ${sale.customers.name}`,
            message: `Dear ${sale.customers.name}, thank you for your recent purchase! We appreciate your business.`,
            type: 'thank_you',
            delivery_channel: 'email',
            status: 'active',
            tone: 'formal',
          })
          .select()
          .single();

        if (!campaignError) {
          console.log('Auto-created campaign:', campaign.id);
        }
      }

      return new Response(JSON.stringify(sale), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PUT - Update sale
    if (req.method === 'PUT') {
      const body = await req.json();
      const { customer_id, products, amount } = body;

      const { data, error } = await supabase
        .from('sales')
        .update({ customer_id, products, amount })
        .eq('id', saleId)
        .eq('user_id', user.id)
        .select('*, customers(*)')
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in sales function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
