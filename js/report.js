// timebacklab — detailed report renderer
// Reads ?token= from the URL, fetches the assembled report from /api/report,
// and renders it into the off-white body. Concept-test build.

document.addEventListener('DOMContentLoaded', function () {
  const root = document.getElementById('report-root');
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';

  // Wire up the private-link box.
  const linkInput = document.getElementById('magic-link-input');
  const copyBtn = document.getElementById('magic-link-copy');
  if (linkInput) linkInput.value = window.location.href;
  if (copyBtn && linkInput) {
    copyBtn.addEventListener('click', function () {
      linkInput.select();
      const done = function () {
        copyBtn.textContent = 'Copied';
        setTimeout(function () { copyBtn.textContent = 'Copy link'; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(linkInput.value).then(done, function () {
          document.execCommand('copy');
          done();
        });
      } else {
        document.execCommand('copy');
        done();
      }
    });
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderState(message) {
    root.innerHTML = '<div class="report-state">' + escapeHtml(message) + '</div>';
  }

  if (!token) {
    renderState('This link is missing its report reference. Please use the link from your results page.');
    return;
  }

  // Each leak area gets its own brand colour, reused across the priority
  // diagram and the section accents so the report reads as one system.
  const SECTION_COLORS = {
    systems: '#00BBFF',
    delegation: '#FF4081',
    prioritisation: '#C87DFF',
    tech: '#C6E000',
  };

  function colorFor(key) {
    return SECTION_COLORS[key] || '#480078';
  }

  // Circular Timeback Score gauge, mirroring the quiz results screen.
  function buildGauge(score) {
    const pct = Math.max(0, Math.min(100, Number(score) || 0));
    const r = 76;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - pct / 100);
    return (
      '<div class="report-gauge">' +
      '<svg viewBox="0 0 180 180" width="100%" height="100%">' +
      '<circle cx="90" cy="90" r="' + r + '" fill="none" class="report-gauge-track"></circle>' +
      '<circle cx="90" cy="90" r="' + r + '" fill="none" class="report-gauge-fill" ' +
      'style="stroke-dasharray:' + c + ' ' + c + ';stroke-dashoffset:' + offset + '"></circle>' +
      '</svg>' +
      '<div class="report-gauge-center">' +
      '<div class="report-gauge-num">' + pct + '%</div>' +
      '<div class="report-gauge-cap">Timeback Score</div>' +
      '</div>' +
      '</div>'
    );
  }

  // Horizontal ranked bars: the four leak areas ordered biggest-first.
  function buildPriority(report) {
    const rows = (report.sections || [])
      .map(function (s) {
        return { key: s.key, title: s.title, leakScore: Number(s.leakScore) || 0 };
      })
      .sort(function (a, b) { return b.leakScore - a.leakScore; });

    if (!rows.length) return '';

    let html = '<div class="report-priority-card">';
    html += '<div class="report-priority-head">';
    html += '<h3>Your time leaks, in priority order</h3>';
    html += '<p>Where to focus first for the biggest time back. The longer the bar, the more time this area is quietly costing you right now.</p>';
    html += '</div>';
    html += '<div class="priority-list">';
    rows.forEach(function (row, i) {
      const isTop = row.key === report.leakCategory || i === 0;
      const color = colorFor(row.key);
      html += '<div class="priority-row' + (isTop ? ' is-top' : '') + '">';
      html += '<div class="priority-rank">' + (i + 1) + '</div>';
      html += '<div class="priority-main">';
      html += '<div class="priority-label">' + escapeHtml(row.title);
      if (isTop) html += '<span class="priority-tag">Start here</span>';
      html += '</div>';
      html += '<div class="priority-track">';
      html += '<div class="priority-fill" style="width:' + row.leakScore + '%;background:' + color + '"></div>';
      html += '</div>';
      html += '</div>';
      html += '<div class="priority-value">' + row.leakScore + '<span>%</span></div>';
      html += '</div>';
    });
    html += '</div></div>';
    return html;
  }

  function renderReport(report) {
    const company = report.companyName ? escapeHtml(report.companyName) : 'Your business';
    const tier = report.tier || null;

    let html = '';

    // Purple summary header — same headline + story as the results screen.
    html += '<div class="report-topcard">';
    html += '<div class="report-topcard-main">';
    html += '<div class="report-eyebrow">Timeback Diagnostic Report</div>';
    html += '<h2 class="report-company">' + company + '</h2>';
    html += '<p class="report-meta">' + escapeHtml(report.sizeLabel) + ' &middot; ' + escapeHtml(report.roleLabel) + '</p>';
    if (tier && tier.headline && tier.headline.length) {
      html += '<h1 class="report-headline">' + escapeHtml(tier.headline[0]) +
        (tier.headline[1] ? '<br>' + escapeHtml(tier.headline[1]) : '') + '</h1>';
    }
    if (tier) {
      html += '<p class="report-narrative">' + escapeHtml(tier.narrative) + ' ' + escapeHtml(tier.prescription) + '</p>';
    }
    html += '<p class="report-leak">Your number one time leak is <strong>' + escapeHtml(report.leakCategoryName) + '</strong>.</p>';
    html += '</div>';
    html += '<div class="report-scorebox">';
    html += buildGauge(report.score);
    html += '<div class="report-tier-badge">' + escapeHtml(report.tierName) + '</div>';
    html += '</div>';
    html += '</div>';

    // Priority diagram.
    html += buildPriority(report);

    // One block per section: summary first, then what it means for you.
    (report.sections || []).forEach(function (section) {
      const isLeak = section.key === report.leakCategory;
      const color = colorFor(section.key);
      html += '<div class="report-section-block' + (isLeak ? ' is-leak' : '') + '" style="--accent:' + color + '">';
      html += '<div class="report-section-head">';
      html += '<h3><span class="section-dot"></span>' + escapeHtml(section.title) + (isLeak ? '<span class="leak-flag">Top leak</span>' : '') + '</h3>';
      html += '<span class="report-section-tier">' + escapeHtml(section.tierName) + '</span>';
      html += '</div>';
      html += '<p class="report-section-intro">' + escapeHtml(section.intro) + '</p>';

      if (section.summary) {
        html += '<p class="report-summary">' + escapeHtml(section.summary) + '</p>';
      }

      if (section.questions && section.questions.length) {
        html += '<div class="report-what">';
        html += '<h4 class="report-what-head">What this means for you</h4>';
        html += '<div class="report-findings">';
        section.questions.forEach(function (q) {
          html += '<div class="report-finding">';
          html += '<p class="report-finding-body">' + escapeHtml(q.body) + '</p>';
          html += '</div>';
        });
        html += '</div></div>';
      } else {
        html += '<p class="report-clear">No significant time leaks flagged here. This is a strength to build on.</p>';
      }

      html += '</div>';
    });

    // Closing CTA.
    html += '<div class="report-closing">';
    html += '<h3>Ready to turn this into hours back?</h3>';
    html += '<p>This report shows where the time is going. The next step is a conversation about how to get it back.</p>';
    html += '<a href="#" class="report-closing-btn">Speak to us</a>';
    html += '</div>';

    root.innerHTML = html;
  }

  renderState('Loading your report…');

  fetch('/api/report?token=' + encodeURIComponent(token))
    .then(function (res) {
      return res.json().then(function (data) { return { ok: res.ok, data: data }; });
    })
    .then(function (result) {
      if (result.ok && result.data && result.data.ok && result.data.report) {
        renderReport(result.data.report);
      } else if (result.data && result.data.error === 'Report not found') {
        renderState('We could not find a report for this link. It may have expired or the link is incomplete.');
      } else {
        renderState('Something went wrong loading your report. Please try again in a moment.');
      }
    })
    .catch(function () {
      renderState('Something went wrong loading your report. Please check your connection and try again.');
    });
});
