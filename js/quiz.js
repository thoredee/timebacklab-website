// timebacklab — Timeback Score Quiz

document.addEventListener('DOMContentLoaded', function () {
  const root = document.getElementById('quiz-root');
  if (!root) return;

  const CATEGORY_ORDER = ['systems', 'delegation', 'prioritisation', 'tech'];

  const CATEGORY_INFO = {
    systems: { title: 'The systems you run on.', desc: 'Your documents, invoices, records. Where they live. How they move from place to place.' },
    delegation: { title: 'What only you can do.', desc: 'The work that lands on your desk. Who handles what and when.' },
    prioritisation: { title: 'Where your attention goes.', desc: 'How your time gets allocated. Meetings, messages, urgent tasks and focused work.' },
    tech: { title: 'How ready you really are.', desc: 'Your tools, your data and whether they could support automation.' },
  };

  const LEAK_NAMES = { systems: 'Systems', delegation: 'Delegation', prioritisation: 'Prioritisation', tech: 'Tech' };

  const LEAK_COPY = {
    systems: "Your tools don't talk to each other, so you're stuck doing the talking for them.",
    delegation: "Work that isn't yours to do keeps landing on your desk.",
    prioritisation: "Your best hours keep getting hijacked by everyone else's priorities.",
    tech: "Your data isn't ready for the automation you actually need.",
  };

  const SCALE_OPTIONS = [
    { value: 1, title: 'Heavy', sub: 'It dominates my week more than it needs to.' },
    { value: 2, title: 'Moderate', sub: "It's a regular chore I could do without." },
    { value: 3, title: 'Low', sub: 'It fits within my role and I can cope with it.' },
    { value: 4, title: 'Zero', sub: "It's a non-issue for me." },
  ];

  const GATING1_OPTIONS = [
    { key: 'solo', label: 'Solo or micro', sub: '1 to 5 people' },
    { key: 'small', label: 'Small team', sub: '6 to 25 people' },
    { key: 'medium', label: 'Medium or large', sub: '26+ people' },
  ];

  const GATING2_OPTIONS = [
    { key: 'operator', label: 'The big boss', sub: 'I run the business and wear all the hats.' },
    { key: 'leader', label: 'The team lead', sub: 'I lead a major department or team.' },
    { key: 'office', label: 'The delivery team, office', sub: 'I execute the work mostly from a desk or counter.' },
    { key: 'field', label: 'The delivery team, field', sub: 'I execute the work mostly on-site or on the road.' },
  ];

  const QUESTION_BANKS = {
    operator: [
      { id: 'op1', category: 'systems', question: 'How much time goes on manually creating invoices, chasing payments or reconciling receipts?' },
      { id: 'op2', category: 'systems', question: 'How much time do you lose retyping customer details or orders from emails and DMs into your spreadsheets or accounting software?' },
      { id: 'op3', category: 'systems', question: 'How much time do you spend hunting for documents, supplier invoices or notes scattered across different folders and apps?' },
      { id: 'op4', category: 'delegation', question: 'How often do you do low-value, repetitive admin simply because it feels faster to just do it yourself?' },
      { id: 'op5', category: 'prioritisation', question: 'How often is your deep focus broken by things like client emails, messages or notifications, pulling you away from the work that matters?' },
      { id: 'op6', category: 'prioritisation', question: "How often do you log back onto your computer after 8pm to catch up on what you couldn't get to during the day?" },
      { id: 'op7', category: 'delegation', question: 'How long does it take to manually set up a new client, project or order across all your different processes?' },
      { id: 'op8', category: 'tech', question: "How often does a new tool you bought to save time end up creating more admin because it doesn't sync with what you already use?" },
      { id: 'op9', category: 'tech', question: 'How much of your actual work is still done by hand, even though you use AI for some small tasks?' },
      { id: 'op10', category: 'tech', question: 'If you tried to run your business through an AI agent today, how fast would it fail because your data and files are too messy to understand?' },
    ],
    leader: [
      { id: 'ld1', category: 'systems', question: 'How much time is lost waiting on financial or operational reports because your team has to compile the data by hand?' },
      { id: 'ld2', category: 'systems', question: 'How much payroll is spent on staff acting as human bridges, exporting CSVs from one platform just to format and upload them into another?' },
      { id: 'ld3', category: 'systems', question: 'When leadership needs a contract or historical project data, how much time gets wasted finding the single source of truth?' },
      { id: 'ld4', category: 'delegation', question: 'How often do processes stall because one person is on holiday and the knowledge only lives in their head?' },
      { id: 'ld5', category: 'prioritisation', question: 'How much time is burned on meetings about meetings, or chasing people on Teams and Slack just for a simple approval?' },
      { id: 'ld6', category: 'prioritisation', question: 'How often do you notice key team members working late or over the weekend just to stay afloat?' },
      { id: 'ld7', category: 'delegation', question: 'When you hit a growth bottleneck, how often is your default move to hire more admin staff rather than fix the broken process?' },
      { id: 'ld8', category: 'tech', question: 'How often do different departments buy their own software, leaving you with a bloated stack where nothing talks to each other?' },
      { id: 'ld9', category: 'tech', question: 'How often do you buy enterprise AI tools or copilots, only to see them used for basic task speed-ups instead of real automation?' },
      { id: 'ld10', category: 'tech', question: 'How much does the fear of AI making an unapproved financial call or leaking data stop you deploying autonomous workflows?' },
    ],
    office: [
      { id: 'of1', category: 'systems', question: 'How much of your week goes on re-keying data, exporting or copy-pasting information from one system to another?' },
      { id: 'of2', category: 'systems', question: 'How much time do you lose shoulder-tapping coworkers to figure out a process because nothing is documented centrally?' },
      { id: 'of3', category: 'systems', question: 'How often do you enter the same information into three or four different tools just to close out one task?' },
      { id: 'of4', category: 'delegation', question: 'How much of your week is spent pausing your work, waiting for a manager to approve something simple before you can move on?' },
      { id: 'of5', category: 'prioritisation', question: 'How often is your deep focus broken by chat messages, emails or quick-question meetings?' },
      { id: 'of6', category: 'prioritisation', question: 'At the end of the day, how often do you feel drained by admin noise rather than by the real work you were hired to do?' },
      { id: 'of7', category: 'prioritisation', question: 'How often do you or your colleagues log back on in the evening or at the weekend to catch up on actual work?' },
      { id: 'of8', category: 'delegation', question: 'When tasks are handed to you, how often do you end up chasing the delegator for missing instructions or context?' },
      { id: 'of9', category: 'tech', question: 'When the company brings in a new tool to save time, how often does it just add another layer of admin instead of talking to what you already use?' },
      { id: 'of10', category: 'tech', question: 'How much of your daily repetitive work is still completely manual, despite all the talk about using AI?' },
    ],
    field: [
      { id: 'fd1', category: 'systems', question: 'After a full day on-site, how much time goes on paperwork or logging hours in your van or at home?' },
      { id: 'fd2', category: 'systems', question: 'How often do you capture notes or signatures on paper, or a basic app, only to retype them into the main system later?' },
      { id: 'fd3', category: 'systems', question: 'How much time goes on proving to the office you did the work, photos, compliance boxes, rather than doing the work itself?' },
      { id: 'fd4', category: 'delegation', question: 'How much time is wasted standing around waiting for the office to approve a quote or confirm a decision?' },
      { id: 'fd5', category: 'prioritisation', question: 'How often is your schedule ripped up by last-minute changes or poor routing from the office?' },
      { id: 'fd6', category: 'prioritisation', question: "How often is your phone blowing up with calls or texts from the office while you're trying to get a job done?" },
      { id: 'fd7', category: 'delegation', question: 'When you arrive on-site, how often are you missing information, forcing you to call the office or ask the customer to repeat themselves?' },
      { id: 'fd8', category: 'tech', question: 'How much time is lost to field software that freezes or makes you type the same information more than once?' },
      { id: 'fd9', category: 'tech', question: "How often does poor signal on-site cause your tech to fail, forcing you into manual workarounds?" },
      { id: 'fd10', category: 'tech', question: 'How often do you feel stuck using software clearly designed for someone at a desk, not someone on the move?' },
    ],
  };

  const TIERS = [
    {
      key: 'trapped', min: 0, max: 24, name: 'Trapped', tag: 'Tier 1',
      headline: ['Held hostage.', 'By your own systems.'],
      narrative: "High friction, manual workarounds and chaotic systems are today's reality. The grind is winning, and burnout is close.",
      prescription: "You need a full process rebuild before the cracks get wider. We take this off your plate entirely: a fundamental systems rebuild and a tech migration built around how your business actually runs, not a patch on top of what isn't working.",
      cta: 'Book your rebuild call',
    },
    {
      key: 'overloaded', min: 25, max: 49, name: 'Overloaded', tag: 'Tier 2',
      headline: ['Overloaded.', 'Not out of options.'],
      narrative: "Some systems exist, but they don't talk to each other. Your team plugs the gaps by hand, and the tools bought to save time are quietly creating more of it.",
      prescription: "It's time to eliminate the manual bridges. We work alongside your team to integrate your workflows properly, coaching you through the fix so the systems finally talk to each other.",
      cta: 'Solve it with us',
    },
    {
      key: 'stretched', min: 50, max: 74, name: 'Stretched', tag: 'Tier 3',
      headline: ['Stretched thin.', 'Not stuck.'],
      narrative: "You run a tight ship. Everything holds together, but only because you're the one holding it. Constant intervention is the cost of that control.",
      prescription: "The fastest wins here are the marginal ones. A focused audit and the right toolkit will free up real capacity, without you having to rebuild anything that already works.",
      cta: 'Speak to us',
    },
    {
      key: 'driver', min: 75, max: 100, name: "In the driver's seat", tag: 'Tier 4',
      headline: ["In the driver's seat.", 'Ready to scale.'],
      narrative: "Your operations are smooth, documented and largely automated. Basic admin drag isn't holding you back any more.",
      prescription: "You're ready for what's next: agentic AI and decision intelligence, built to multiply your output without adding headcount.",
      cta: 'Talk about scale',
    },
  ];

  const state = {
    step: -1,
    gating1: null,
    gating2: null,
    answers: {},
    companyName: '',
    email: '',
    marketingOptIn: false,
    submitted: false,
    submissionId: null,
  };

  function getBank() {
    return state.gating2 ? QUESTION_BANKS[state.gating2] : [];
  }

  function currentCategoryKey() {
    const step = state.step;
    if (step >= 2 && step <= 5) return CATEGORY_ORDER[step - 2];
    return null;
  }

  function currentQuestions() {
    const cat = currentCategoryKey();
    if (!cat) return [];
    return getBank().filter(function (q) { return q.category === cat; });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function canProceed() {
    const step = state.step;
    if (step === -1) return isValidEmail(state.email);
    if (step === 0) return !!state.gating1;
    if (step === 1) return !!state.gating2;
    if (step >= 2 && step <= 5) {
      const qs = currentQuestions();
      return qs.length > 0 && qs.every(function (q) { return !!state.answers[q.id]; });
    }
    return true;
  }

  function computeScore() {
    const answers = state.answers;
    const bank = getBank();
    const raw = bank.reduce(function (sum, q) { return sum + (answers[q.id] || 0); }, 0);
    const percent = Math.max(0, Math.min(100, Math.round(((raw - 10) / 30) * 100)));

    const catTotals = {};
    const catCounts = {};
    bank.forEach(function (q) {
      const v = answers[q.id] || 0;
      catTotals[q.category] = (catTotals[q.category] || 0) + v;
      catCounts[q.category] = (catCounts[q.category] || 0) + 1;
    });
    let leakCat = CATEGORY_ORDER[0];
    let leakAvg = Infinity;
    CATEGORY_ORDER.forEach(function (cat) {
      const avg = catCounts[cat] ? catTotals[cat] / catCounts[cat] : 0;
      if (avg < leakAvg) { leakAvg = avg; leakCat = cat; }
    });

    let tier = TIERS[0];
    for (let i = 0; i < TIERS.length; i++) {
      if (percent >= TIERS[i].min && percent <= TIERS[i].max) { tier = TIERS[i]; break; }
    }
    return { percent: percent, leakCat: leakCat, tier: tier };
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goNext() {
    if (!canProceed()) return;
    if (state.step === -1) {
      const params = new URLSearchParams(window.location.search);
      params.set('marketingOptIn', state.marketingOptIn ? '1' : '0');
      window.history.replaceState({}, '', 'quiz.html?' + params.toString());
    }
    state.step = Math.min(6, state.step + 1);
    render();
    scrollTop();
  }

  function goBack() {
    if (state.step === 0) {
      state.step = -1;
    } else {
      state.step = Math.max(-1, state.step - 1);
    }
    render();
    scrollTop();
  }

  function restart() {
    state.step = -1;
    state.gating1 = null;
    state.gating2 = null;
    state.answers = {};
    state.companyName = '';
    state.email = '';
    state.marketingOptIn = false;
    state.submitted = false;
    render();
    scrollTop();
  }

  function submitResults() {
    if (state.submitted) return;
    state.submitted = true;

    const result = computeScore();
    const bank = getBank();
    const answers = bank.map(function (q) {
      const value = state.answers[q.id];
      const option = SCALE_OPTIONS.filter(function (o) { return o.value === value; })[0];
      return {
        id: q.id,
        category: q.category,
        question: q.question,
        value: value,
        label: option ? option.title : null,
      };
    });

    const payload = {
      companyName: state.companyName,
      email: state.email,
      marketingOptIn: state.marketingOptIn,
      businessSize: state.gating1,
      role: state.gating2,
      scorePercent: 100 - result.percent,
      tierKey: result.tier.key,
      tierName: result.tier.name,
      leakCategory: result.leakCat,
      answers: answers,
    };

    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.submissionId) {
          state.submissionId = data.submissionId;
          const link = document.getElementById('report-cta-link');
          if (link) {
            link.setAttribute('href', 'report.html?token=' + encodeURIComponent(state.submissionId));
          }
        }
      })
      .catch(function () {
        // Silently ignore network errors; the result still renders for the user.
      });
  }

  function toggleMarketingOptIn() {
    state.marketingOptIn = !state.marketingOptIn;
    render();
  }

  function selectGating1(key) {
    state.gating1 = key;
    render();
  }

  function selectGating2(key) {
    state.gating2 = key;
    state.answers = {};
    render();
  }

  function selectAnswer(id, value) {
    state.answers[id] = value;
    render();
  }

  function renderGating1() {
    return (
      '<div>' +
      '<h1>What’s the size of your business?</h1>' +
      '<p>This shapes which questions we ask, and how we read your answers.</p>' +
      '<div class="gating-grid">' +
      GATING1_OPTIONS.map(function (opt) {
        const selected = state.gating1 === opt.key;
        return (
          '<button type="button" class="option-card gating-option' + (selected ? ' selected' : '') + '" data-action="gating1" data-key="' + opt.key + '">' +
          '<div class="option-title">' + escapeHtml(opt.label) + '</div>' +
          '<div class="option-sub">' + escapeHtml(opt.sub) + '</div>' +
          '</button>'
        );
      }).join('') +
      '</div></div>'
    );
  }

  function renderGating2() {
    return (
      '<div>' +
      '<h1>What’s your role, day to day?</h1>' +
      '<p>This decides which ten questions come next.</p>' +
      '<div class="role-grid">' +
      GATING2_OPTIONS.map(function (opt) {
        const selected = state.gating2 === opt.key;
        return (
          '<button type="button" class="option-card gating-option' + (selected ? ' selected' : '') + '" data-action="gating2" data-key="' + opt.key + '">' +
          '<div class="option-title">' + escapeHtml(opt.label) + '</div>' +
          '<div class="option-sub">' + escapeHtml(opt.sub) + '</div>' +
          '</button>'
        );
      }).join('') +
      '</div></div>'
    );
  }

  function renderCategory() {
    const cat = currentCategoryKey();
    const info = CATEGORY_INFO[cat];
    const questions = currentQuestions();
    return (
      '<div>' +
      '<h1>' + escapeHtml(info.title) + '</h1>' +
      '<p>' + escapeHtml(info.desc) + '</p>' +
      '<div class="quiz-questions">' +
      questions.map(function (q) {
        return (
          '<div class="quiz-question-block">' +
          '<div class="question-text">' + escapeHtml(q.question) + '</div>' +
          '<div class="option-grid">' +
          SCALE_OPTIONS.map(function (opt) {
            const selected = state.answers[q.id] === opt.value;
            return (
              '<button type="button" class="option-card scale-option' + (selected ? ' selected' : '') + '" data-action="answer" data-qid="' + q.id + '" data-value="' + opt.value + '">' +
              '<div class="option-title">' + escapeHtml(opt.title) + '</div>' +
              '<div class="option-sub">' + escapeHtml(opt.sub) + '</div>' +
              '</button>'
            );
          }).join('') +
          '</div></div>'
        );
      }).join('') +
      '</div></div>'
    );
  }

  function renderIntro() {
    const emailError = state.email && !isValidEmail(state.email);

    return (
      '<section class="quiz-stage">' +
      '<div class="quiz-card">' +
      '<div class="quiz-progress-row">' +
      '<div class="quiz-progress-label">Your progress</div>' +
      '<div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:4%"></div></div>' +
      '</div>' +
      '<div class="intro-content">' +
      '<h1 class="intro-headline">Where\'s your time really going?</h1>' +
      '<p class="intro-subtext">10 quick questions, less than 5 minutes. We\'ll name your #1 time leak and exactly what to do about it.</p>' +
      '<div class="intro-form">' +
      '<div class="intro-form-label">Before we begin, tell us about you</div>' +
      '<form id="intro-form" class="intro-form-fields">' +
      '<div class="form-field">' +
      '<label class="form-label">Company name <span class="form-label-tag">(Optional)</span></label>' +
      '<input type="text" class="form-input" id="company-input" placeholder="The Timeback Lab Company" value="' + escapeHtml(state.companyName) + '">' +
      '</div>' +
      '<div class="form-field">' +
      '<label class="form-label">Email address <span class="form-label-tag">(Required so we can email you the results)</span></label>' +
      '<input type="email" class="form-input' + (emailError ? ' error' : '') + '" id="email-input" placeholder="you@company.com" value="' + escapeHtml(state.email) + '">' +
      (emailError ? '<div class="form-error">Please enter a valid email address</div>' : '') +
      '</div>' +
      '</form>' +
      '<div class="marketing-checkbox-block">' +
      '<button type="button" class="checkbox-row" data-action="toggle-marketing" aria-label="Toggle marketing opt-in">' +
      '<svg class="checkbox-box' + (state.marketingOptIn ? ' checked' : '') + '" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="24" height="24" rx="6" ' + (state.marketingOptIn ? 'fill="#EE0072" stroke="#EE0072" stroke-width="2"' : 'fill="#FFD0DC" stroke="#26292A" stroke-width="3"') + '/>' +
      (state.marketingOptIn ? '<path d="M8 12L11 15L16 8" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' : '') +
      '</svg>' +
      '<label class="checkbox-label">Yes, I\'d like occasional tips and toolkits on cutting operational noise, regaining control and finding the freedom to actually grow my business. If you don\'t like it, unsubscribe anytime.</label>' +
      '</button>' +
      '</div>' +
      '<div class="consent-text">' +
      'By clicking \'Let\'s go\', you agree to our <a href="legal.html#terms" class="consent-link">Terms &amp; Conditions</a> and acknowledge our <a href="legal.html#privacy" class="consent-link">Privacy Policy</a>.' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="intro-button-row">' +
      '<button type="button" class="cta-button" data-action="next"' + (canProceed() ? '' : ' disabled') + '>Let\'s go</button>' +
      '</div>' +
      '</div>' +
      '</section>'
    );
  }

  function renderQuizCard() {
    const step = state.step;
    const totalSteps = 7;
    const progressPercent = Math.round(((step + 2) / totalSteps) * 100);
    const proceedable = canProceed();
    const nextLabel = step <= 1 ? 'Continue' : (step === 5 ? 'See my score' : 'Next section');

    let body = '';
    if (step === 0) body = renderGating1();
    else if (step === 1) body = renderGating2();
    else if (step >= 2 && step <= 5) body = renderCategory();

    return (
      '<section class="quiz-stage">' +
      '<div class="quiz-card">' +
      '<div class="quiz-progress-row">' +
      '<div class="quiz-progress-label">Your progress</div>' +
      '<div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:' + progressPercent + '%"></div></div>' +
      '</div>' +
      body +
      '<div class="quiz-nav-row">' +
      '<button type="button" class="quiz-back-btn" data-action="back">Go back</button>' +
      '<button type="button" class="quiz-next-btn" data-action="next"' + (proceedable ? '' : ' disabled') + '>' + escapeHtml(nextLabel) + '</button>' +
      '</div>' +
      '</div>' +
      '</section>'
    );
  }

  function renderResults() {
    const result = computeScore();
    const tier = result.tier;
    const displayScore = 100 - result.percent;
    const r = 88;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - displayScore / 100);
    const leakName = LEAK_NAMES[result.leakCat];
    const leakBlurb = LEAK_COPY[result.leakCat];

    return (
      '<section class="results-section" data-tier="' + tier.key + '">' +
      '<div class="results-inner">' +
      '<div class="results-top-row">' +
      '<div>' +
      '<h1 class="results-headline">' + escapeHtml(tier.headline[0]) + '<br>' + escapeHtml(tier.headline[1]) + '</h1>' +
      '<p class="results-narrative">' + escapeHtml(tier.narrative) + ' ' + escapeHtml(tier.prescription) + '</p>' +
      '<div class="results-cta-row">' +
      '<a href="#" class="results-cta-btn">' + escapeHtml(tier.cta) + '</a>' +
      '<button type="button" class="results-restart-btn" data-action="restart">Retake the diagnostic</button>' +
      '</div>' +
      '</div>' +
      '<div class="results-cards-row">' +
      '<div class="gauge-card">' +
      '<div class="gauge-wrap">' +
      '<svg width="100%" height="100%" viewBox="0 0 210 210">' +
      '<circle cx="105" cy="105" r="' + r + '" fill="none" class="gauge-track"></circle>' +
      '<circle cx="105" cy="105" r="' + r + '" fill="none" class="gauge-fill" style="stroke-dasharray:' + circumference + ' ' + circumference + '; stroke-dashoffset:' + offset + '"></circle>' +
      '</svg>' +
      '<div class="gauge-center">' +
      '<div class="gauge-number">' + displayScore + '%</div>' +
      '<div class="gauge-label">Timeback Score</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="prescription-card">' +
      '<div class="leak-name">' + escapeHtml(leakName) + '</div>' +
      '<div class="leak-blurb">Your number one time leak is ' + escapeHtml(leakName) + '. ' + escapeHtml(leakBlurb) + '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</section>' +
      '<section class="report-section">' +
      '<div class="report-inner">' +
      '<div class="report-image-wrap">' +
      '<img src="images/quiz-report-photo.webp" alt="A person reading the Timeback Lab company score report">' +
      '</div>' +
      '<div class="report-copy">' +
      '<h2>Your score is the headline. The report is the story.</h2>' +
      '<p>You could potentially recover ' + displayScore + '% of your time back to focus on what matters most. We can go deeper than a single number. Your full company report breaks down every time leak we found, benchmarks you against businesses like yours, and ranks the fixes by how much time they’ll actually give back. Everything you need to act, in one document.</p>' +
      '<a href="' + (state.submissionId ? 'report.html?token=' + encodeURIComponent(state.submissionId) : '#') + '" id="report-cta-link" class="report-cta-btn">Order your report</a>' +
      '</div>' +
      '</div>' +
      '</section>'
    );
  }

  function render() {
    if (state.step === -1) {
      root.innerHTML = renderIntro();
    } else if (state.step < 6) {
      root.innerHTML = renderQuizCard();
    } else {
      root.innerHTML = renderResults();
      submitResults();
    }
  }

  function updateIntroForm() {
    const companyInput = document.getElementById('company-input');
    const emailInput = document.getElementById('email-input');
    if (companyInput) state.companyName = companyInput.value;
    if (emailInput) state.email = emailInput.value;
    render();
  }

  root.addEventListener('click', function (e) {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const action = el.getAttribute('data-action');
    if (action === 'gating1') selectGating1(el.getAttribute('data-key'));
    else if (action === 'gating2') selectGating2(el.getAttribute('data-key'));
    else if (action === 'answer') selectAnswer(el.getAttribute('data-qid'), Number(el.getAttribute('data-value')));
    else if (action === 'next') goNext();
    else if (action === 'back') goBack();
    else if (action === 'restart') restart();
    else if (action === 'toggle-marketing') toggleMarketingOptIn();
  });

  root.addEventListener('change', function (e) {
    if (e.target.id === 'company-input' || e.target.id === 'email-input') {
      updateIntroForm();
    }
  });

  root.addEventListener('input', function (e) {
    if (e.target.id === 'email-input') {
      updateIntroForm();
    }
  });

  render();
});
