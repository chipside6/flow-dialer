
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing userId parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Generating SIP config for user ${userId}`);

    // 1. Get user's trunks
    const { data: trunks, error: trunksError } = await supabaseClient
      .from('user_trunks')
      .select('*')
      .eq('user_id', userId);

    if (trunksError) {
      console.error('Error fetching trunks:', trunksError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch trunks' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!trunks || trunks.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No trunks found for user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // 2. Generate SIP configuration
    let sipConfig = `;SIP Configuration for user ${userId}\n`;
    sipConfig += `;Generated at ${new Date().toISOString()}\n\n`;

    for (const trunk of trunks) {
      sipConfig += `[${trunk.sip_user}]\n`;
      sipConfig += `type=friend\n`;
      sipConfig += `host=dynamic\n`;
      sipConfig += `context=from-goip\n`;
      sipConfig += `secret=${trunk.sip_pass}\n`;
      sipConfig += `disallow=all\n`;
      sipConfig += `allow=ulaw\n`;
      sipConfig += `allow=alaw\n`;
      sipConfig += `dtmfmode=rfc2833\n`;
      sipConfig += `insecure=port,invite\n`;
      sipConfig += `nat=force_rport,comedia\n`;
      sipConfig += `qualify=yes\n`;
      sipConfig += `directmedia=no\n\n`;
    }

    // 3. Store the configuration in the database
    const { error: configError } = await supabaseClient
      .from('asterisk_configs')
      .upsert({
        user_id: userId,
        config_type: 'sip',
        config_name: 'sip.conf',
        config_content: sipConfig,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,config_type' });

    if (configError) {
      console.error('Error storing SIP config:', configError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to store SIP configuration' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // 4. Return the generated configuration
    return new Response(
      JSON.stringify({
        success: true,
        message: 'SIP configuration generated successfully',
        config: sipConfig
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating SIP config:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
