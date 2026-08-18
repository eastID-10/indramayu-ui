/**
 * postag.js — logic for the POS Tagging playground only.
 * Loaded exclusively on postag.html.
 */
(function () {
  var CONFIG = {
    apiEndpoint: null, // e.g. "https://your-api.example.com/models/postag"
    apiKey: null
  };

  var EXAMPLES = [
    'Karman mangan sega karo iwak nang pawon.',
    'Bocah kae maca buku anyar ing perpustakaan.'
  ];

  // Toy tag dictionary for the mock inference below.
  var MOCK_TAGS = {
    'karman': 'NOUN', 'mangan': 'VERB', 'sega': 'NOUN', 'karo': 'CONJ',
    'iwak': 'NOUN', 'nang': 'PREP', 'pawon': 'NOUN',
    'bocah': 'NOUN', 'kae': 'DET', 'maca': 'VERB', 'buku': 'NOUN',
    'anyar': 'ADJ', 'ing': 'PREP', 'perpustakaan': 'NOUN'
  };

  var els = {
    input: document.getElementById('posInput'),
    runBtn: document.getElementById('posRunBtn'),
    status: document.getElementById('posStatus'),
    output: document.getElementById('posOutput')
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
    setStatus('busy', 'Memproses…');

    callPosModel(text)
      .then(renderTags)
      .catch(renderError);
  });

  function callPosModel(text) {
    if (CONFIG.apiEndpoint) {
      return fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: CONFIG.apiKey ? 'Bearer ' + CONFIG.apiKey : undefined
        },
        body: JSON.stringify({ text: text })
      }).then(function (res) {
        if (!res.ok) throw new Error('Model kelas kata mengembalikan status ' + res.status);
        return res.json(); // expected: { tokens: [{ text, tag }] }
      });
    }

    // --- Mock inference ---
    return new Promise(function (resolve) {
      setTimeout(function () {
        var tokens = text.split(/\s+/).filter(Boolean).map(function (w) {
          var clean = w.toLowerCase().replace(/[.,!?]/g, '');
          return { text: w, tag: MOCK_TAGS[clean] || 'X' };
        });
        resolve({ tokens: tokens });
      }, 600);
    });
  }

  function renderTags(result) {
    var tokens = (result && result.tokens) || [];
    if (!tokens.length) {
      els.output.className = 'output-box is-empty';
      els.output.innerHTML = '<p class="empty-msg">Tidak ada token untuk ditandai.</p>';
      setStatus('done', 'Selesai');
      return;
    }

    var html = tokens.map(function (t) {
      return '<span class="pos-token"><span class="w">' + escapeHtml(t.text) +
        '</span><span class="t">' + escapeHtml(t.tag) + '</span></span>';
    }).join('');

    els.output.className = 'output-box is-ready';
    els.output.innerHTML = '<div class="pos-line">' + html + '</div>';
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
