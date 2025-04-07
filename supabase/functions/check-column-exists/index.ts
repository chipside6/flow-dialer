
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { table_name, column_name } = await req.json()
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Use the column_exists RPC function we just created
    const { data, error } = await supabase
      .rpc('column_exists', { table_name, column_name })
    
    if (error) {
      console.error('Error checking if column exists:', error)
      
      // Fall back to direct query if the RPC function fails
      try {
        // Try a direct query to information_schema
        const { data: directData, error: directError } = await supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_schema', 'public')
          .eq('table_name', table_name)
          .eq('column_name', column_name)
          .maybeSingle()
        
        if (directError) {
          throw directError
        }
        
        // Column exists if we got data back
        const exists = directData !== null
        
        return new Response(
          JSON.stringify({ exists }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (fallbackErr) {
        console.error('Fallback query also failed:', fallbackErr)
        return new Response(
          JSON.stringify({ error: true, message: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    }
    
    return new Response(
      JSON.stringify({ exists: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Error in check-column-exists function:', err)
    return new Response(
      JSON.stringify({ error: true, message: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
