/**
 * qa.js — logic for the Question Answering playground only.
 * Loaded exclusively on qa.html.
 */
(function () {
  var CONFIG = {
    apiEndpoint: null, // e.g. "https://your-api.example.com/models/qa"
    apiKey: null
  };

  var EXAMPLE_CONTEXT = 'Karman lunga menyang Pasar Indramayu esuk-esuk kanggo tuku iwak lan sayuran. ' +
    'Ana ing kono, dheweke ketemu karo kancane sing jenenge Surti. ' +
    'Wong loro banjur mangan sega bareng nang warung cedhak pasar.';
  var EXAMPLE_QUESTION = 'Sapa sing ketemu Karman nang pasar?';

  var els = {
    context: document.getElementById('qaContext'),
    question: document.getElementById('qaQuestion'),
    runBtn: document.getElementById('qaRunBtn'),
    status: document.getElementById('qaStatus'),
    output: document.getElementById('qaOutput')
  };

  document.querySelectorAll('[data-example]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      els.context.value = EXAMPLE_CONTEXT;
      els.question.value = EXAMPLE_QUESTION;
    });
  });

  els.runBtn.addEventListener('click', function () {
    var context = els.context.value.trim();
    var question = els.question.value.trim();

    if (!context || !question) {
      setStatus('idle', 'Lengkapi dulu');
      return;
    }
    setStatus('busy', 'Mencari jawaban…');

    callQaModel(context, question)
      .then(renderAnswer)
      .catch(renderError);
  });

  function callQaModel(context, question) {
    if (CONFIG.apiEndpoint) {
      return fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: CONFIG.apiKey ? 'Bearer ' + CONFIG.apiKey : undefined
        },
        body: JSON.stringify({ context: context, question: question })
      }).then(function (res) {
        if (!res.ok) throw new Error('Model tanya-jawab mengembalikan status ' + res.status);
        return res.json(); // expected: { answer: "...", confidence: 0.0-1.0 }
      });
    }

    // --- Mock inference: naive keyword-overlap "extraction" ---
    return new Promise(function (resolve) {
      setTimeout(function () {
        var sentences = context.split(/(?<=[.!?])\s+/).filter(Boolean);
        var qWords = question.toLowerCase().replace(/[?.,!]/g, '').split(/\s+/);

        var best = sentences[0] || context;
        var bestScore = -1;
        sentences.forEach(function (s) {
          var score = qWords.filter(function (w) { return s.toLowerCase().indexOf(w) !== -1; }).length;
          if (score > bestScore) { bestScore = score; best = s; }
        });

        resolve({ answer: best.trim(), confidence: Math.min(0.95, 0.4 + bestScore * 0.12) });
      }, 700);
    });
  }

  function renderAnswer(result) {
    els.output.className = 'output-box is-ready';
    els.output.innerHTML =
      '<div class="qa-answer"><span class="qa-span">' + escapeHtml(result.answer) + '</span></div>' +
      '<div class="qa-confidence">Keyakinan model: ' + Math.round((result.confidence || 0) * 100) + '%</div>';
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
