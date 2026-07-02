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

  function renderReport(report) {
    const company = report.companyName ? escapeHtml(report.companyName) : 'Your business';

    let html = '';

    // Summary header card.
    html += '<div class="report-topcard">';
    html += '<div class="report-topcard-main">';
    html += '<div class="report-eyebrow">Timeback Diagnostic Report</div>';
    html += '<h2 class="report-company">' + company + '</h2>';
    html += '<p class="report-meta">' + escapeHtml(report.sizeLabel) + ' &middot; ' + escapeHtml(report.roleLabel) + '</p>';
    html += '<p class="report-leak">Your number one time leak is <strong>' + escapeHtml(report.leakCategoryName) + '</strong>.</p>';
    html += '</div>';
    html += '<div class="report-scorebox">';
    html += '<div class="report-score-number">' + escapeHtml(report.score) + '%</div>';
    html += '<div class="report-score-label">Timeback Score</div>';
    html += '<div class="report-tier-badge">' + escapeHtml(report.tierName) + '</div>';
    html += '</div>';
    html += '</div>';

    // One block per section.
    (report.sections || []).forEach(function (section) {
      const isLeak = section.key === report.leakCategory;
      html += '<div class="report-section-block' + (isLeak ? ' is-leak' : '') + '">';
      html += '<div class="report-section-head">';
      html += '<h3>' + escapeHtml(section.title) + (isLeak ? '<span class="leak-flag">Top leak</span>' : '') + '</h3>';
      html += '<span class="report-section-tier">' + escapeHtml(section.tierName) + '</span>';
      html += '</div>';
      html += '<p class="report-section-intro">' + escapeHtml(section.intro) + '</p>';

      if (section.summary) {
        html += '<p class="report-summary">' + escapeHtml(section.summary) + '</p>';
      }

      if (section.questions && section.questions.length) {
        html += '<div class="report-findings">';
        section.questions.forEach(function (q) {
          html += '<div class="report-finding">';
          html += '<div class="report-finding-q">' + escapeHtml(q.question);
          if (q.answerLabel) {
            html += ' <span class="report-finding-answer">Your answer: ' + escapeHtml(q.answerLabel) + '</span>';
          }
          html += '</div>';
          html += '<p class="report-finding-body">' + escapeHtml(q.body) + '</p>';
          html += '</div>';
        });
        html += '</div>';
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
