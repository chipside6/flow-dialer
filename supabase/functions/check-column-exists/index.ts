
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { table_name, column_name } = await req.json()
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Query information_schema to check if column exists
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', table_name)
      .eq('column_name', column_name)
      .single()
    
    if (error) {
      return new Response(
        JSON.stringify({ error: true, message: error.message }),
        { headers: { 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // If data exists, the column exists
    const exists = data !== null
    
    return new Response(
      JSON.stringify({ exists }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: true, message: err.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
