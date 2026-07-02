// GET /api/report?token=<submission_id>
// Assembles a personalised detailed report for a completed quiz submission by
// pulling the matching report_nodes content from D1. Public (the token is the
// unguessable magic-link key) — no admin password. This is the concept-test
// version: match answers to content and return it assembled, no payment gate yet.

const CATEGORY_ORDER = ['systems', 'delegation', 'prioritisation', 'tech'];

const SECTION_TITLES = {
  systems: 'Systems',
  delegation: 'Delegation',
  prioritisation: 'Prioritisation',
  tech: 'Technology',
};

const SECTION_INTROS = {
  systems: 'The tools you run on and how information moves between them.',
  delegation: 'The work that only lands on your desk, and what could move off it.',
  prioritisation: 'Where your attention goes, and what keeps hijacking it.',
  tech: 'How ready your tools and data really are for automation.',
};

// Quiz role keys map to the report_nodes role keys.
const ROLE_MAP = { operator: 'boss', leader: 'lead', office: 'office', field: 'field' };

const ROLE_LABELS = {
  operator: 'Business owner',
  leader: 'Team lead',
  office: 'Delivery team (office)',
  field: 'Delivery team (field)',
};

const SIZE_LABELS = {
  solo: 'Solo or micro (1 to 5 people)',
  small: 'Small team (6 to 25 people)',
  medium: 'Medium or large (26+ people)',
};

const TIER_NAMES = {
  trapped: 'Trapped',
  overloaded: 'Overloaded',
  stretched: 'Stretched',
  driver: "In the driver's seat",
};

// Same banding the quiz uses: average answer (1 to 4) -> percent -> tier.
function tierForAverage(avg) {
  const percent = Math.max(0, Math.min(100, Math.round(((avg - 1) / 3) * 100)));
  if (percent <= 24) return 'trapped';
  if (percent <= 49) return 'overloaded';
  if (percent <= 74) return 'stretched';
  return 'driver';
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleReport(request, env) {
  const url = new URL(request.url);
  const token = (url.searchParams.get('token') || '').trim();
  if (!token) {
    return json({ ok: false, error: 'Missing token' }, 400);
  }

  const row = await env.DB.prepare('SELECT * FROM submissions WHERE submission_id = ?1')
    .bind(token)
    .first();

  if (!row) {
    return json({ ok: false, error: 'Report not found' }, 404);
  }

  let answers = [];
  try {
    answers = JSON.parse(row.answers_json || '[]');
  } catch (e) {
    answers = [];
  }

  const role = ROLE_MAP[row.role] || 'boss';
  const size = row.business_size || 'solo';

  // Group answers by section and work out which questions to flag (Heavy/Moderate).
  const bySection = {};
  CATEGORY_ORDER.forEach(function (key) {
    bySection[key] = [];
  });
  answers.forEach(function (a) {
    if (bySection[a.category]) bySection[a.category].push(a);
  });

  // Collect every node id we need so we can fetch them in one query.
  const summaryIds = [];
  const questionIds = [];
  const sectionPlan = CATEGORY_ORDER.map(function (key) {
    const list = bySection[key];
    const values = list.map(function (a) { return Number(a.value) || 0; }).filter(Boolean);
    const avg = values.length ? values.reduce(function (s, v) { return s + v; }, 0) / values.length : 4;
    const tier = tierForAverage(avg);
    const summaryId = 'sum-' + key + '-' + size + '-' + role + '-' + tier;
    summaryIds.push(summaryId);

    // Flag the questions answered Heavy (1) or Moderate (2) as the leaks to explain.
    const flagged = list
      .filter(function (a) { return Number(a.value) <= 2; })
      .map(function (a) {
        const num = String(a.id).replace(/^[a-z]+/i, '');
        const qNodeId = 'q' + num + '-' + role + '-' + size;
        questionIds.push(qNodeId);
        return { answer: a, nodeId: qNodeId };
      });

    return { key: key, tier: tier, summaryId: summaryId, flagged: flagged };
  });

  const allIds = summaryIds.concat(questionIds);
  const nodeMap = {};
  if (allIds.length) {
    const placeholders = allIds.map(function (_, i) { return '?' + (i + 1); }).join(', ');
    const res = await env.DB.prepare(
      'SELECT id, body FROM report_nodes WHERE id IN (' + placeholders + ')'
    ).bind(...allIds).all();
    (res.results || []).forEach(function (n) { nodeMap[n.id] = n.body; });
  }

  const sections = sectionPlan.map(function (plan) {
    const questions = plan.flagged
      .filter(function (f) { return nodeMap[f.nodeId]; })
      .map(function (f) {
        return {
          question: f.answer.question,
          answerLabel: f.answer.label,
          body: nodeMap[f.nodeId],
        };
      });
    return {
      key: plan.key,
      title: SECTION_TITLES[plan.key],
      intro: SECTION_INTROS[plan.key],
      tier: plan.tier,
      tierName: TIER_NAMES[plan.tier],
      summary: nodeMap[plan.summaryId] || null,
      questions: questions,
    };
  });

  const report = {
    submissionId: row.submission_id,
    companyName: row.company_name || '',
    createdAt: row.created_at,
    score: row.score_percent,
    tierKey: row.tier_key,
    tierName: row.tier_name || TIER_NAMES[row.tier_key] || '',
    leakCategory: row.leak_category,
    leakCategoryName: SECTION_TITLES[row.leak_category] || row.leak_category,
    roleLabel: ROLE_LABELS[row.role] || row.role,
    sizeLabel: SIZE_LABELS[row.business_size] || row.business_size,
    sections: sections,
  };

  return json({ ok: true, report: report });
}
