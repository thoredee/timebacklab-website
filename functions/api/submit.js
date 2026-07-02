function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), { status: 400 });
  }

  if (!isValidEmail(body.email)) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid email' }), { status: 400 });
  }
  if (!Array.isArray(body.answers)) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing answers' }), { status: 400 });
  }

  const cf = request.cf || {};
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const userAgent = request.headers.get('User-Agent') || '';

  const stmt = env.DB.prepare(
    'INSERT INTO submissions (created_at, company_name, email, marketing_opt_in, business_size, role, score_percent, tier_key, tier_name, leak_category, answers_json, ip_address, country, region, city, timezone, isp, asn, colo, user_agent) ' +
    'VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20)'
  ).bind(
    new Date().toISOString(),
    body.companyName || '',
    body.email,
    body.marketingOptIn ? 1 : 0,
    body.businessSize || '',
    body.role || '',
    Number.isFinite(body.scorePercent) ? body.scorePercent : null,
    body.tierKey || '',
    body.tierName || '',
    body.leakCategory || '',
    JSON.stringify(body.answers),
    ip,
    cf.country || '',
    cf.region || '',
    cf.city || '',
    cf.timezone || '',
    cf.asOrganization || '',
    cf.asn ? String(cf.asn) : '',
    cf.colo || '',
    userAgent
  );

  await stmt.run();

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
