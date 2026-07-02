export async function onRequestGet(context) {
  const { request, env } = context;

  const password = request.headers.get('X-Admin-Password') || '';
  if (!env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
  }

  const result = await env.DB.prepare(
    'SELECT * FROM submissions ORDER BY created_at DESC'
  ).all();

  return new Response(JSON.stringify({ ok: true, submissions: result.results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
