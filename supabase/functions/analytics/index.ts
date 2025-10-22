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
    const endpoint = url.searchParams.get('endpoint');

    // Get retention metrics
    if (endpoint === 'retention') {
      // Calculate total customers
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Calculate repeat customers (customers with more than 1 sale)
      const { data: salesData } = await supabase
        .from('sales')
        .select('customer_id')
        .eq('user_id', user.id);

      const customerSaleCounts = salesData?.reduce((acc: Record<string, number>, sale: any) => {
        acc[sale.customer_id] = (acc[sale.customer_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const repeatCustomers = Object.values(customerSaleCounts).filter((count: unknown) => (count as number) > 1).length;
      const retentionRate = totalCustomers ? ((repeatCustomers / totalCustomers) * 100).toFixed(1) : '0.0';

      return new Response(JSON.stringify({
        total_customers: totalCustomers || 0,
        repeat_customers: repeatCustomers,
        retention_rate: `${retentionRate}%`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get message metrics
    if (endpoint === 'messages') {
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id')
        .eq('user_id', user.id);

      const campaignIds = campaigns?.map((c: any) => c.id) || [];

      if (campaignIds.length === 0) {
        return new Response(JSON.stringify({
          total_sent: 0,
          total_opened: 0,
          total_clicked: 0,
          open_rate: '0%',
          click_rate: '0%',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: logs } = await supabase
        .from('message_logs')
        .select('*')
        .in('campaign_id', campaignIds);

      const totalSent = logs?.length || 0;
      const totalOpened = logs?.filter((l: any) => l.opened).length || 0;
      const totalClicked = logs?.filter((l: any) => l.clicked).length || 0;

      const openRate = totalSent ? ((totalOpened / totalSent) * 100).toFixed(1) : '0.0';
      const clickRate = totalSent ? ((totalClicked / totalSent) * 100).toFixed(1) : '0.0';

      return new Response(JSON.stringify({
        total_sent: totalSent,
        total_opened: totalOpened,
        total_clicked: totalClicked,
        open_rate: `${openRate}%`,
        click_rate: `${clickRate}%`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get campaign summaries
    if (endpoint === 'campaign-summaries') {
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const summaries = [];

      for (const campaign of campaigns || []) {
        const { data: logs } = await supabase
          .from('message_logs')
          .select('*')
          .eq('campaign_id', campaign.id);

        const sent = logs?.length || 0;
        const opened = logs?.filter((l: any) => l.opened).length || 0;
        const openRate = sent ? ((opened / sent) * 100).toFixed(1) : '0.0';

        summaries.push({
          id: campaign.id,
          name: campaign.name,
          type: campaign.type,
          status: campaign.status,
          sent,
          open_rate: `${openRate}%`,
          created_at: campaign.created_at,
        });
      }

      return new Response(JSON.stringify(summaries), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get sales over time for charts
    if (endpoint === 'sales-timeline') {
      const { data: sales } = await supabase
        .from('sales')
        .select('created_at, amount')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      return new Response(JSON.stringify(sales || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analytics function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: message === 'Unauthorized' ? 401 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
