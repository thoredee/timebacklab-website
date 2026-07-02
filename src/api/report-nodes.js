function checkPassword(request, env) {
  const password = request.headers.get('X-Admin-Password') || '';
  return Boolean(env.ADMIN_PASSWORD) && password === env.ADMIN_PASSWORD;
}

function countWords(text) {
  const trimmed = String(text == null ? '' : text).trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export async function handleReportNodes(request, env) {
  if (!checkPassword(request, env)) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
  }

  const result = await env.DB.prepare(
    'SELECT id, node_type, section, role, company_size, tier, question_id, label, body, word_count, updated_at FROM report_nodes ORDER BY section, question_id, company_size, role, tier'
  ).all();

  return new Response(JSON.stringify({ ok: true, nodes: result.results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleUpdateReportNode(request, env) {
  if (!checkPassword(request, env)) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400 });
  }

  if (!body.id) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing id' }), { status: 400 });
  }
  if (typeof body.body !== 'string') {
    return new Response(JSON.stringify({ ok: false, error: 'Missing body' }), { status: 400 });
  }

  const wordCount = countWords(body.body);
  const updatedAt = new Date().toISOString();

  const result = await env.DB.prepare(
    'UPDATE report_nodes SET body = ?1, word_count = ?2, updated_at = ?3 WHERE id = ?4'
  )
    .bind(body.body, wordCount, updatedAt, body.id)
    .run();

  if (!result.meta || result.meta.changes === 0) {
    return new Response(JSON.stringify({ ok: false, error: 'Not found' }), { status: 404 });
  }

  return new Response(
    JSON.stringify({ ok: true, id: body.id, word_count: wordCount, updated_at: updatedAt }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
