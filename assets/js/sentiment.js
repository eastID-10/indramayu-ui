/**
 * sentiment.js — logic for the Sentiment Analysis playground only.
 * Loaded exclusively on sentiment.html.
 */
(function () {
  var CONFIG = {
    apiEndpoint: null, // e.g. "https://your-api.example.com/models/sentiment"
    apiKey: null
  };

  var EXAMPLES = [
    'Panganan nang warung kae enak banget, aku seneng!',
    'Aku kuciwa, layanane elek lan suwe banget.',
    'Sesuk aku arep menyang pasar kanggo tuku beras.'
  ];

  var POS_WORDS = ['enak', 'seneng', 'apik', 'apikan', 'bagus', 'seru', 'demen'];
  var NEG_WORDS = ['kuciwa', 'elek', 'sedih', 'nesu', 'jengkel', 'ala'];

  var els = {
    input: document.getElementById('senInput'),
    runBtn: document.getElementById('senRunBtn'),
    status: document.getElementById('senStatus'),
    output: document.getElementById('senOutput')
  };

  document.querySelectorAll('[data-example]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      els.input.value = EXAMPLES[Number(btn.getAttribute('data-example'))];
      els.input.focus();
    });
  });

  els.runBtn.addEventListener('click', function () {
    var text = els.input.value.trim();
    if (!text) {
      setStatus('idle', 'Isi teks dulu');
      return;
    }
    setStatus('busy', 'Menganalisis…');

    callSentimentModel(text)
      .then(renderResult)
      .catch(renderError);
  });

  function callSentimentModel(text) {
    if (CONFIG.apiEndpoint) {
      return fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: CONFIG.apiKey ? 'Bearer ' + CONFIG.apiKey : undefined
        },
        body: JSON.stringify({ text: text })
      }).then(function (res) {
        if (!res.ok) throw new Error('Model sentimen mengembalikan status ' + res.status);
        return res.json(); // expected: { label: "positive"|"negative"|"neutral", scores: {positive, negative, neutral} }
      });
    }

    // --- Mock inference: simple lexicon scoring ---
    return new Promise(function (resolve) {
      setTimeout(function () {
        var lower = text.toLowerCase();
        var pos = POS_WORDS.filter(function (w) { return lower.indexOf(w) !== -1; }).length;
        var neg = NEG_WORDS.filter(function (w) { return lower.indexOf(w) !== -1; }).length;

        var label = 'neutral';
        if (pos > neg) label = 'positive';
        else if (neg > pos) label = 'negative';

        var base = 0.34;
        var scores = { positive: base, negative: base, neutral: base };
        scores[label] = 0.6 + Math.min(0.35, (Math.max(pos, neg)) * 0.12);
        var rest = (1 - scores[label]) / 2;
        Object.keys(scores).forEach(function (k) { if (k !== label) scores[k] = rest; });

        resolve({ label: label, scores: scores });
      }, 600);
    });
  }

  function renderResult(result) {
    var labelText = { positive: 'Positif', negative: 'Negatif', neutral: 'Netral' }[result.label] || result.label;
    var badgeClass = { positive: 'pos', negative: 'neg', neutral: 'neu' }[result.label] || 'neu';
    var scores = result.scores || {};

    var rows = ['positive', 'neutral', 'negative'].map(function (key) {
      var pct = Math.round((scores[key] || 0) * 100);
      var rowLabel = { positive: 'Positif', neutral: 'Netral', negative: 'Negatif' }[key];
      return '<div class="meter-row"><span>' + rowLabel + '</span>' +
        '<div class="meter-track"><div class="meter-fill" style="width:' + pct + '%"></div></div>' +
        '<span>' + pct + '%</span></div>';
    }).join('');

    els.output.className = 'output-box is-ready';
    els.output.innerHTML =
      '<div class="sentiment-result">' +
      '<span class="sentiment-badge ' + badgeClass + '">' + labelText + '</span>' +
      '<div class="meter">' + rows + '</div>' +
      '</div>';
    setStatus('done', 'Selesai');
  }

  function renderError(err) {
    els.output.className = 'output-box is-ready';
    els.output.innerHTML = '<p style="color:var(--danger);">Gagal memproses: ' + escapeHtml(err.message) + '</p>';
    setStatus('idle', 'Gagal');
  }

  function setStatus(state, label) {
    els.status.textContent = label;
    els.status.className = 'status-badge' + (state === 'busy' ? ' is-busy' : state === 'done' ? ' is-done' : '');
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
})();
