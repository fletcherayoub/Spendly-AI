import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageUri } = await req.json();

    // Secure server-side processing with AI provider (e.g. Gemini / OpenAI Vision)
    const mockExtraction = {
      merchant: 'Supermarket',
      date: new Date().toISOString().split('T')[0],
      subtotal: 42.50,
      tax: 4.25,
      total: 46.75,
      currency: 'USD',
      category: 'Groceries',
      confidence: 0.95,
      items: [
        { name: 'Organic Milk 1L', quantity: 2, unit_price: 3.50, total_price: 7.00 },
        { name: 'Whole Wheat Bread', quantity: 1, unit_price: 4.25, total_price: 4.25 },
      ]
    };

    return new Response(JSON.stringify(mockExtraction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
