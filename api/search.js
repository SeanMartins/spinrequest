export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const limit = url.searchParams.get('limit') || '8';

  if (!q) return new Response(JSON.stringify({ results: [] }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=${limit}`,
      { headers: { 'User-Agent': 'SpinRequest/1.0' } }
    );
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ results: [], error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
