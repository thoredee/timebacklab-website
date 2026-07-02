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

// The headline + overall summary shown on the purple results screen. Mirrored
// here so the report can open with the same story the quiz-taker just read.
const TIER_CONTENT = {
  trapped: {
    headline: ['Held hostage.', 'By your own systems.'],
    narrative: "High friction, manual workarounds and chaotic systems are today's reality. The grind is winning, and burnout is close.",
    prescription: "You need a full process rebuild before the cracks get wider. We take this off your plate entirely: a fundamental systems rebuild and a tech migration built around how your business actually runs, not a patch on top of what isn't working.",
  },
  overloaded: {
    headline: ['Overloaded.', 'Not out of options.'],
    narrative: "Some systems exist, but they don't talk to each other. Your team plugs the gaps by hand, and the tools bought to save time are quietly creating more of it.",
    prescription: "It's time to eliminate the manual bridges. We work alongside your team to integrate your workflows properly, coaching you through the fix so the systems finally talk to each other.",
  },
  stretched: {
    headline: ['Stretched thin.', 'Not stuck.'],
    narrative: "You run a tight ship. Everything holds together, but only because you're the one holding it. Constant intervention is the cost of that control.",
    prescription: "The fastest wins here are the marginal ones. A focused audit and the right toolkit will free up real capacity, without you having to rebuild anything that already works.",
  },
  driver: {
    headline: ["In the driver's seat.", 'Ready to scale.'],
    narrative: "Your operations are smooth, documented and largely automated. Basic admin drag isn't holding you back any more.",
    prescription: "You're ready for what's next: agentic AI and decision intelligence, built to multiply your output without adding headcount.",
  },
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

    return { key: key, tier: tier, avg: avg, summaryId: summaryId, flagged: flagged };
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
    // Leak severity 0–100: higher = more time being lost in this area (lower
    // average answer). Drives the priority-order diagram on the report page.
    const leakScore = Math.max(0, Math.min(100, Math.round(((4 - plan.avg) / 3) * 100)));
    return {
      key: plan.key,
      title: SECTION_TITLES[plan.key],
      intro: SECTION_INTROS[plan.key],
      tier: plan.tier,
      tierName: TIER_NAMES[plan.tier],
      leakScore: leakScore,
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
    tier: TIER_CONTENT[row.tier_key] || null,
    sections: sections,
  };

  return json({ ok: true, report: report });
}
