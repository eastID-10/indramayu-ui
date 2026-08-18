/**
 * ner.js — logic for the Named Entity Recognition playground only.
 * This file is loaded exclusively on ner.html, kept separate from the
 * other four models on purpose (each was trained/served independently).
 */
(function () {
  // ---------------------------------------------------------------
  // 1. CONFIG — point this at your real fine-tuned Llama 3 NER endpoint.
  // ---------------------------------------------------------------
  var CONFIG = {
    apiEndpoint: null, // e.g. "https://your-api.example.com/models/ner"
    apiKey: null
  };

  var LABEL_NAMES = { PER: 'Orang', LOC: 'Tempat', ORG: 'Organisasi' };

  var EXAMPLES = [
    'Karman lunga menyang Pasar Indramayu bareng kancane.',
    'Bupati Indramayu miwiti acara nang Pendopo Kabupaten dina Setu wingi.',
    'Sekolahan SMA 1 Sindang ana ing cedhak Kali Cimanuk.'
  ];

  var els = {
    input: document.getElementById('nerInput'),
    runBtn: document.getElementById('nerRunBtn'),
    status: document.getElementById('nerStatus'),
    output: document.getElementById('nerOutput')
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

    callNerModel(text)
      .then(renderEntities)
      .catch(function (err) {
        renderError(err);
      });
  });

  // ---------------------------------------------------------------
  // 2. INFERENCE — swap the body of this function for a real fetch().
  // ---------------------------------------------------------------
  function callNerModel(text) {
    if (CONFIG.apiEndpoint) {
      return fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: CONFIG.apiKey ? 'Bearer ' + CONFIG.apiKey : undefined
        },
        body: JSON.stringify({ text: text })
      }).then(function (res) {
        if (!res.ok) throw new Error('Model NER mengembalikan status ' + res.status);
        return res.json(); // expected: { tokens: [{ text, label }] }
      });
    }

    // --- Mock inference (no backend wired up yet) ---
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve({ tokens: mockTag(text) });
      }, 650);
    });
  }

  function mockTag(text) {
    var knownPer = ['karman', 'bupati'];
    var knownLoc = ['indramayu', 'pendopo', 'kabupaten', 'sindang', 'cimanuk', 'pasar'];
    var knownOrg = ['sma', 'sekolahan'];

    return text.split(/(\s+)/).filter(function (t) { return t.length; }).map(function (word) {
      var clean = word.toLowerCase().replace(/[.,!?]/g, '');
      var label = null;
      if (knownPer.indexOf(clean) !== -1) label = 'PER';
      else if (knownLoc.indexOf(clean) !== -1) label = 'LOC';
      else if (knownOrg.indexOf(clean) !== -1) label = 'ORG';
      return { text: word, label: label };
    });
  }

  // ---------------------------------------------------------------
  // 3. RENDER
  // ---------------------------------------------------------------
  function renderEntities(result) {
    var tokens = (result && result.tokens) || [];
    if (!tokens.length) {
      els.output.className = 'output-box is-empty';
      els.output.innerHTML = '<p class="empty-msg">Model tidak menemukan entitas pada teks ini.</p>';
      setStatus('done', 'Selesai');
      return;
    }

    var html = tokens.map(function (tok) {
      if (!tok.label || !tok.text.trim()) return escapeHtml(tok.text);
      return '<span class="entity">' + escapeHtml(tok.text.trim()) +
        '<sup>' + (LABEL_NAMES[tok.label] || tok.label) + '</sup></span>';
    }).join('');

    els.output.className = 'output-box is-ready';
    els.output.innerHTML = '<div style="line-height:2.1;">' + html + '</div>';
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
