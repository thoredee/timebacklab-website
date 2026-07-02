function checkPassword(request, env) {
  const password = request.headers.get('X-Admin-Password') || '';
  return Boolean(env.ADMIN_PASSWORD) && password === env.ADMIN_PASSWORD;
}

export async function handleAdminSubmissions(request, env) {
  if (!checkPassword(request, env)) {
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

export async function handleDeleteSubmission(request, env) {
  if (!checkPassword(request, env)) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400 });
  }

  if (!body.submissionId) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing submissionId' }), { status: 400 });
  }

  await env.DB.prepare('DELETE FROM submissions WHERE submission_id = ?1')
    .bind(body.submissionId)
    .run();

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
