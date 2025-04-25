import { supabase } from '@/lib/supabaseClient';

export async function POST(request) {
  try {
    const data = await request.json();

    // Remove any ID field that might be coming from the client
    const { id, ...dataWithoutId } = data;

    console.log('API received data:', data);
    console.log('API cleaned data:', dataWithoutId);

    // Create a new survey response without specifying an ID
    const { data: response, error } = await supabase
      .from('survey_responses')
      .insert([dataWithoutId]);

    if (error) {
      console.error('API survey submission error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data: response }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Survey submission error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
