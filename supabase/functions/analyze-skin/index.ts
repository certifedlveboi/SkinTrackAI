import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
  imageBase64: string;
}

interface N8nResponse {
  skinScore?: number;
  skinType?: string;
  detectedFeatures?: {
    hydration?: number;
    acne?: number;
    texture?: number;
    redness?: number;
    darkSpots?: number;
    wrinkles?: number;
    pores?: number;
    oiliness?: number;
    sunDamage?: number;
  };
  concerns?: string[];
  recommendations?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { imageBase64 }: AnalyzeRequest = await req.json();

    if (!imageBase64) {
      throw new Error('No image provided');
    }

    console.log('Sending image to n8n webhook for analysis...');

    // Get n8n webhook URL from environment
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    if (!n8nWebhookUrl) {
      throw new Error('N8N_WEBHOOK_URL not configured');
    }

    console.log('n8n webhook URL configured:', n8nWebhookUrl.substring(0, 50) + '...');
    console.log('Image size (base64):', imageBase64.length, 'characters');

    const requestBody = {
      userId: user.id,
      image: imageBase64,
      timestamp: new Date().toISOString(),
    };

    console.log('Sending POST request to n8n...');

    let n8nResponse: Response;
    try {
      n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('n8n response status:', n8nResponse.status);
      console.log('n8n response headers:', JSON.stringify(Object.fromEntries(n8nResponse.headers.entries())));
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error(`Failed to reach n8n webhook: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }

    if (!n8nResponse.ok) {
      let errorText = '';
      try {
        errorText = await n8nResponse.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      console.error('n8n webhook error response:', errorText);
      throw new Error(`n8n webhook failed: ${n8nResponse.status} - ${errorText}`);
    }

    let n8nData: N8nResponse;
    try {
      const responseText = await n8nResponse.text();
      console.log('n8n raw response:', responseText.substring(0, 500));
      n8nData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse n8n response:', parseError);
      throw new Error('n8n returned invalid JSON response');
    }

    console.log('Successfully received analysis from n8n');

    // Map n8n response to our analysis format
    const analysis = {
      skinScore: n8nData.skinScore || 75,
      skinType: n8nData.skinType || 'Normal',
      detectedFeatures: {
        hydration: n8nData.detectedFeatures?.hydration || 75,
        acne: n8nData.detectedFeatures?.acne || 20,
        texture: n8nData.detectedFeatures?.texture || 80,
        redness: n8nData.detectedFeatures?.redness || 15,
        darkSpots: n8nData.detectedFeatures?.darkSpots || 25,
        wrinkles: n8nData.detectedFeatures?.wrinkles || 10,
        pores: n8nData.detectedFeatures?.pores || 30,
        oiliness: n8nData.detectedFeatures?.oiliness || 40,
        sunDamage: n8nData.detectedFeatures?.sunDamage || 20,
      },
      concerns: (n8nData.concerns || []).map((concern, index) => ({
        type: concern,
        severity: index === 0 ? 'moderate' : 'mild',
        location: 'forehead',
      })),
      recommendations: n8nData.recommendations || [
        'Use a hydrating serum daily',
        'Apply SPF 50+ sunscreen',
        'Maintain consistent skincare routine',
      ],
    };

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in analyze-skin function:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
