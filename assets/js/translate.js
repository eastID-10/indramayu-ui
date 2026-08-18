const API_BASE = 'https://kindling-shifty-stumble.ngrok-free.dev';

const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const translateBtn = document.getElementById('translateBtn');
const btnLabel = document.getElementById('btnLabel');
const btnSpinner = document.getElementById('btnSpinner');
const clearBtnInput = document.getElementById('clearBtnInput');
const copyInputBtn = document.getElementById('copyInputBtn');
const copyOutputBtn = document.getElementById('copyOutputBtn');
const charCount = document.getElementById('charCount');
const statusDot = document.getElementById('statusDot');
const toast = document.getElementById('toast');
const swapDirectionBtn = document.getElementById('swapDirectionBtn');
const dirFromLabel = document.getElementById('dirFromLabel');
const dirToLabel = document.getElementById('dirToLabel');
const inputLabel = document.getElementById('inputLabel');
const outputLabel = document.getElementById('outputLabel');
const langToggleBtn = document.getElementById('langToggleBtn');
const langToggleLabel = document.getElementById('langToggleLabel');
const htmlRoot = document.getElementById('htmlRoot');

// =====================================================================
// SITE LANGUAGE (page UI: Indonesian / English)
// This is independent from `direction`, which controls the actual
// Indonesian <-> Indramayu translation feature below. Sample chips and
// any live translation output are intentionally left untranslated,
// since those are content fed into / produced by the translator itself.
// =====================================================================
const UI_STRINGS = {
  swap_btn_title: { id: 'Balik arah terjemahan', en: 'Swap translation direction' },
  copy_text_title: { id: 'Salin teks', en: 'Copy text' },
  clear_title: { id: 'Hapus', en: 'Clear' },
  translate_btn_title: { id: 'Terjemahkan', en: 'Translate' },
  copy_result_title: { id: 'Salin hasil', en: 'Copy result' },
  output_placeholder: { id: 'Hasil terjemahan akan muncul di sini…', en: 'Your translation will appear here…' },
  example_label: { id: 'Contoh kalimat:', en: 'Example sentences:' },

  hero_title_line1: { id: 'Bahasa Indonesia', en: 'Indonesian' },
  hero_title_line2: { id: 'Bahasa Indramayu', en: 'Indramayu' },
  hero_subtitle: {
    id: 'Aplikasi penerjemah dua arah, Bahasa Indonesia ke Bahasa Indramayu dan sebaliknya, ditujukan untuk melestarikan bahasa daerah sekaligus memudahkan komunikasi lintas bahasa.',
    en: 'A two-way translator between Indonesian and Indramayu, built to help preserve a regional language while making cross-language communication easier.'
  },

  about_eyebrow: { id: 'Tentang DermayonTL', en: 'About DermayonTL' },
  about_title_line1: { id: 'AWAL', en: 'HOW IT' },
  about_title_line2: { id: 'MULA DERMAYONTL', en: 'ALL BEGAN' },
  about_paragraph: {
    id: 'DermayonTL berfokus pada pelestarian bahasa daerah — menjembatani Bahasa Indonesia dan Bahasa Jawa Dialek Indramayu melalui teknologi AI.',
    en: 'DermayonTL is focused on preserving a regional language — bridging Indonesian and the Indramayu dialect of Javanese through AI technology.'
  },
  about_glyph_label: { id: 'Indonesia → Dermayon', en: 'Indonesian → Dermayon' },

  history_eyebrow: { id: 'Cerita Sejarah', en: 'Our History' },
  history_subtitle: {
    id: 'Berawal dari keresahan akan bahasa daerah yang perlahan terlupakan',
    en: 'It began with a concern over a regional language slowly being forgotten'
  },
  history_slide_eyebrow: { id: 'Implementasi', en: 'Implementation' },
  history_slide_title: { id: 'Aplikasi Web Terbuka untuk Semua', en: 'A Web App Open to Everyone' },
  history_slide_paragraph: {
    id: 'Mayoritas model AI berfokus pada Bahasa Indonesia atau Bahasa Jawa standar. DermayonTL mengisi celah ini dengan model Machine Translation yang secara khusus dilatih untuk dialek Indramayu menggunakan pendekatan hibrida data manual dan semi-otomatis.',
    en: 'Most AI models focus on standard Indonesian or standard Javanese. DermayonTL fills that gap with a Machine Translation model trained specifically for the Indramayu dialect, using a hybrid approach of manual and semi-automatic data.'
  },

  cta_button: { id: '← Coba Translator', en: '← Try the Translator' },

  footer_link_about: { id: 'Tentang', en: 'About' },
  footer_link_research: { id: 'Riset', en: 'Research' },
  footer_col2_line1: { id: 'Bahasa Dermayon', en: 'Dermayon Language' },
  footer_col2_line2: { id: 'Indramayu, Jawa Barat', en: 'Indramayu, West Java' },
  footer_tagline: {
    id: 'DermayonTL · Proyek Machine Translation Dialek Indramayu',
    en: 'DermayonTL · Indramayu Dialect Machine Translation Project'
  },
  footer_copyright: {
    id: '© 2026 <strong class="text-gray-500">DermayonTL</strong> &mdash; Model MT Bahasa Indramayu · Powered by Llama 3 Fine-Tuned',
    en: '© 2026 <strong class="text-gray-500">DermayonTL</strong> &mdash; Indramayu Language MT Model · Powered by Fine-Tuned Llama 3'
  },
};

// Word-by-word "foundation" statement, kept as a token list (rather than
// one string) so the staggered reveal animation still works per-word
// regardless of which language is active.
const FOUNDATION_WORDS = {
  id: [
    'APLIKASI', 'INI', 'MENERJEMAHKAN', 'BAHASA', 'DERMAYON', 'MENGGUNAKAN', 'METODE',
    { text: 'MODEL LLMs', highlight: true },
    'YANG', 'DILATIH', 'DARI', 'DATASET', 'BAHASA', 'INDONESIA', 'KE', 'BAHASA', 'INDRAMAYU.'
  ],
  en: [
    'THIS', 'APP', 'TRANSLATES', 'THE', 'DERMAYON', 'LANGUAGE', 'USING',
    { text: 'LLM MODELS', highlight: true },
    'TRAINED', 'ON', 'A', 'DATASET', 'FROM', 'INDONESIAN', 'TO', 'INDRAMAYU', 'LANGUAGE.'
  ],
};

let uiLang = 'id';

function renderFoundationWords() {
  const foundationText = document.getElementById('foundationText');
  if (!foundationText) return;
  const wasActive = foundationText.querySelector('.reveal-word.active') !== null
    || foundationText.dataset.revealed === 'true';

  foundationText.innerHTML = '';
  FOUNDATION_WORDS[uiLang].forEach((token, i) => {
    const span = document.createElement('span');
    const isHighlight = typeof token === 'object' && token.highlight;
    const text = typeof token === 'object' ? token.text : token;
    span.textContent = text;
    if (isHighlight) {
      span.className = 'highlight-word';
    } else {
      span.className = 'reveal-word uppercase';
      span.style.transitionDelay = `${i * 40}ms`;
      if (wasActive) span.classList.add('active');
    }
    foundationText.appendChild(span);
    foundationText.appendChild(document.createTextNode(' '));
  });

  if (wasActive) foundationText.dataset.revealed = 'true';
}

function applyUILanguage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (UI_STRINGS[key]) el.textContent = UI_STRINGS[key][uiLang];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (UI_STRINGS[key]) el.innerHTML = UI_STRINGS[key][uiLang];
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (UI_STRINGS[key]) el.title = UI_STRINGS[key][uiLang];
  });

  renderFoundationWords();
  applyDirectionToUI();
  clearOutputToPlaceholder();

  if (htmlRoot) htmlRoot.lang = uiLang;
  if (langToggleLabel) langToggleLabel.textContent = uiLang === 'id' ? 'EN' : 'ID';
}

if (langToggleBtn) {
  langToggleBtn.addEventListener('click', () => {
    uiLang = uiLang === 'id' ? 'en' : 'id';
    try { localStorage.setItem('dermayontl_ui_lang', uiLang); } catch (e) { /* ignore */ }
    applyUILanguage();
  });
}

try {
  const savedLang = localStorage.getItem('dermayontl_ui_lang');
  if (savedLang === 'id' || savedLang === 'en') uiLang = savedLang;
} catch (e) { /* ignore */ }

// ---- Bidirectional translation direction state ----
// 'idn-imy' = Bahasa Indonesia -> Bahasa Indramayu
// 'imy-idn' = Bahasa Indramayu -> Bahasa Indonesia
// Labels below are duplicated per UI language so the direction bar
// matches whichever site language is active, without touching the
// actual translation request (still just 'idn-imy' / 'imy-idn').
const DIRECTIONS = {
  'idn-imy': {
    id: {
      from: 'Bahasa Indonesia',
      to: 'Bahasa Indramayu',
      inputPlaceholder: 'Ketik atau tempel teks Bahasa Indonesia di sini…',
      outputPlaceholder: 'Hasil terjemahan Bahasa Indramayu akan muncul di sini…',
    },
    en: {
      from: 'Indonesian',
      to: 'Indramayu',
      inputPlaceholder: 'Type or paste Indonesian text here…',
      outputPlaceholder: 'The Indramayu translation will appear here…',
    },
  },
  'imy-idn': {
    id: {
      from: 'Bahasa Indramayu',
      to: 'Bahasa Indonesia',
      inputPlaceholder: 'Ketik atau tempel teks Bahasa Indramayu di sini…',
      outputPlaceholder: 'Hasil terjemahan Bahasa Indonesia akan muncul di sini…',
    },
    en: {
      from: 'Indramayu',
      to: 'Indonesian',
      inputPlaceholder: 'Type or paste Indramayu text here…',
      outputPlaceholder: 'The Indonesian translation will appear here…',
    },
  },
};

let direction = 'idn-imy';
let toastTimer;

function currentDirCfg() {
  return DIRECTIONS[direction][uiLang];
}

function currentPlaceholder() {
  return currentDirCfg().outputPlaceholder;
}

function setOutput(text) {
  outputText.innerHTML = '';
  outputText.textContent = text;
}

function clearOutputToPlaceholder() {
  outputText.innerHTML = `<span class="text-gray-400 font-normal italic">${currentPlaceholder()}</span>`;
}

function labelWord(lang, key) {
  // "Kalimat X" / "X Sentence" style label built from the from/to name
  return lang === 'id' ? `Kalimat ${key.replace('Bahasa ', '')}` : `${key} Sentence`;
}

function applyDirectionToUI() {
  const cfg = currentDirCfg();
  dirFromLabel.textContent = cfg.from;
  dirToLabel.textContent = cfg.to;
  inputLabel.textContent = labelWord(uiLang, cfg.from);
  outputLabel.textContent = labelWord(uiLang, cfg.to);
  inputText.placeholder = cfg.inputPlaceholder;
}

applyDirectionToUI();

function setStatus(state) {
  statusDot.className = 'w-2 h-2 rounded-full transition-all duration-300 ';
  if (state === 'ok') statusDot.className += 'bg-emerald-500 shadow-[0_0_0_3px_rgba(52,211,153,0.2)]';
  if (state === 'error') statusDot.className += 'bg-red-500 shadow-[0_0_0_3px_rgba(248,113,113,0.2)]';
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ---- Auto-translate: fires 5s after the user stops typing ----
const AUTO_TRANSLATE_DELAY_MS = 5000;
let autoTranslateTimer;
let lastAutoTranslatedText = '';

function scheduleAutoTranslate() {
  clearTimeout(autoTranslateTimer);
  const text = inputText.value.trim();
  if (!text || text === lastAutoTranslatedText) return;

  autoTranslateTimer = setTimeout(() => {
    // Guard against the text having changed again right at the edge of the timer
    if (inputText.value.trim() === text) doTranslate();
  }, AUTO_TRANSLATE_DELAY_MS);
}

inputText.addEventListener('input', () => {
  const len = inputText.value.length;
  charCount.textContent = `${len} / 500`;
  charCount.style.color = len > 450 ? '#D94F4F' : '';

  if (len === 0) {
    clearTimeout(autoTranslateTimer);
    lastAutoTranslatedText = '';
    clearOutputToPlaceholder();
    setStatus(null);
  } else {
    scheduleAutoTranslate();
  }
});

translateBtn.addEventListener('click', () => {
  clearTimeout(autoTranslateTimer);
  doTranslate();
});
inputText.addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    clearTimeout(autoTranslateTimer);
    doTranslate();
  }
});

// Guard against overlapping requests: the manual button click and the
// 5s auto-translate timer used to be able to fire doTranslate() at the
// same time, sending two concurrent POSTs to a backend that can only
// safely process one translation at a time. This flag makes sure only
// one request is ever in flight, and lets us cancel a stale one if the
// user fires a newer request before the old one comes back.
let isTranslating = false;
let currentAbortController = null;

async function doTranslate() {
  const text = inputText.value.trim();
  if (!text) return;
  clearTimeout(autoTranslateTimer);

  // If a previous request is still in flight, cancel it — the user's
  // newer input/click always wins, and we avoid ever having two
  // requests racing against each other.
  if (isTranslating && currentAbortController) {
    currentAbortController.abort();
  }

  isTranslating = true;
  currentAbortController = new AbortController();
  const thisController = currentAbortController;

  translateBtn.disabled = true;
  inputText.disabled = true;
  btnLabel.classList.add('hidden');
  btnSpinner.classList.remove('hidden');
  outputText.innerHTML = '';
  outputText.classList.add('loading-dots');
  setStatus(null);

  try {
    const endpoint = `${API_BASE}/translate`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, direction }),
      signal: thisController.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // 503 = server busy / GPU out of memory (see backend semaphore + queue cap).
      // Give the user a clear, actionable message instead of a raw error.
      if (res.status === 503) {
        throw new Error(err.detail || 'Server sedang sibuk, coba lagi sebentar.');
      }
      throw new Error(err.detail || `Error ${res.status}`);
    }

    const data = await res.json();
    setOutput(data.translate);
    setStatus('ok');
    lastAutoTranslatedText = text;

  } catch (err) {
    if (err.name === 'AbortError') {
      // A newer request superseded this one — stay quiet, the newer
      // request will update the UI when it resolves.
      return;
    }
    clearOutputToPlaceholder();
    setStatus('error');
    showToast('❌ ' + err.message);
  } finally {
    // Only clear the "in flight" UI state if this is still the
    // most recent request (an aborted, older request's `finally`
    // shouldn't stomp on the newer request's UI state).
    if (thisController === currentAbortController) {
      isTranslating = false;
      translateBtn.disabled = false;
      inputText.disabled = false;
      btnLabel.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
      outputText.classList.remove('loading-dots');
    }
  }
}

swapDirectionBtn.addEventListener('click', () => {
  clearTimeout(autoTranslateTimer);
  direction = direction === 'idn-imy' ? 'imy-idn' : 'idn-imy';

  // If there's a real translated result already showing, carry it over
  // into the input box (classic "swap" UX) instead of just clearing everything.
  const currentOutput = outputText.innerText.trim();
  const hasRealOutput = currentOutput
    && currentOutput !== DIRECTIONS['idn-imy'][uiLang].outputPlaceholder
    && currentOutput !== DIRECTIONS['imy-idn'][uiLang].outputPlaceholder;

  applyDirectionToUI();

  if (hasRealOutput) {
    inputText.value = currentOutput;
    charCount.textContent = `${inputText.value.length} / 500`;
    lastAutoTranslatedText = '';
  }

  clearOutputToPlaceholder();
  setStatus(null);
  const cfg = currentDirCfg();
  showToast(`🔁 ${cfg.from} → ${cfg.to}`);
});

clearBtnInput.addEventListener('click', () => {
  clearTimeout(autoTranslateTimer);
  lastAutoTranslatedText = '';
  inputText.value = '';
  charCount.textContent = '0 / 500';
  clearOutputToPlaceholder();
  setStatus(null);
  inputText.focus();
});

copyInputBtn.addEventListener('click', () => {
  const t = inputText.value.trim();
  if (!t) return;
  const msg = uiLang === 'id' ? '✅ Teks disalin!' : '✅ Text copied!';
  navigator.clipboard.writeText(t).then(() => showToast(msg));
});

copyOutputBtn.addEventListener('click', () => {
  const t = outputText.innerText.trim();
  if (!t || t === currentPlaceholder()) return;
  const msg = uiLang === 'id' ? '✅ Terjemahan disalin!' : '✅ Translation copied!';
  navigator.clipboard.writeText(t).then(() => showToast(msg));
});

// Initialize AOS (Animate On Scroll)
AOS.init({
  duration: 900,
  once: true,
  easing: "ease-out-cubic",
  offset: 80
});

// Initialize Locomotive Scroll
const scroll = new LocomotiveScroll({
  el: document.querySelector('[data-scroll-container]'),
  smooth: true,
  multiplier: 1.2, // Adjust scroll speed here
  getDirection: true, // needed for the velocity-based skew effect
  getSpeed: true      // needed for the velocity-based skew effect
});

// ---- Global scroll progress bar ----
const scrollProgressEl = document.getElementById('scrollProgress');

// ---- History: vertical-scroll-drives-horizontal pinned gallery ----
const historyPinWrapper = document.getElementById('historyPinWrapper');
const historyPinInner = document.getElementById('historyPinInner');
const historyTrack = document.getElementById('historyTrack');
const historySlides = document.querySelectorAll('.history-slide');
const historyDots = document.querySelectorAll('.history-dot');

function updateHistoryPin(scrollY) {
  if (!historyPinWrapper || !historyPinInner || !historyTrack) return;

  const wrapperTop = historyPinWrapper.offsetTop;
  const wrapperHeight = historyPinWrapper.offsetHeight;
  const vh = window.innerHeight;
  const start = wrapperTop;
  const end = wrapperTop + wrapperHeight - vh;

  let progress = 0;

  if (scrollY < start) {
    historyPinInner.classList.remove('is-fixed', 'is-bottom');
    historyPinInner.style.top = '';
    progress = 0;
  } else if (scrollY <= end) {
    historyPinInner.classList.add('is-fixed');
    historyPinInner.classList.remove('is-bottom');
    historyPinInner.style.top = '0px';
    progress = (scrollY - start) / ((end - start) || 1);
  } else {
    historyPinInner.classList.remove('is-fixed');
    historyPinInner.classList.add('is-bottom');
    historyPinInner.style.top = Math.max(wrapperHeight - vh, 0) + 'px';
    progress = 1;
  }

  progress = Math.min(Math.max(progress, 0), 1);

  const maxTranslate = Math.max(historyTrack.scrollWidth - window.innerWidth, 0);
  historyTrack.style.transform = `translate3d(${-progress * maxTranslate}px,0,0)`;

  const activeIndex = Math.round(progress * (historySlides.length - 1));
  historySlides.forEach((slide, i) => {
    slide.style.opacity = i === activeIndex ? '1' : '0.3';
  });
  historyDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === activeIndex);
  });
}

// ---- Velocity-based skew on images while scrolling fast ----
let skewResetTimer;
function applySkew(speed) {
  const clamped = Math.max(Math.min((speed || 0) * 1.4, 8), -8);
  document.querySelectorAll('.skew-el').forEach(el => {
    el.style.transform = `skewY(${clamped}deg)`;
  });
  clearTimeout(skewResetTimer);
  skewResetTimer = setTimeout(() => {
    document.querySelectorAll('.skew-el').forEach(el => {
      el.style.transform = 'skewY(0deg)';
    });
  }, 160);
}

// Update AOS when Locomotive Scrolls (Crucial step for fade animations)
let lastScrollY = 0;
scroll.on('scroll', (args) => {
  AOS.refresh();
  lastScrollY = args.scroll.y;

  if (scrollProgressEl && args.limit && args.limit.y) {
    const pct = Math.min(Math.max(args.scroll.y / args.limit.y, 0), 1) * 100;
    scrollProgressEl.style.width = pct + '%';
  }

  updateHistoryPin(args.scroll.y);
  applySkew(args.speed);
});

// Recalculate pin geometry on resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    scroll.update();
    updateHistoryPin(lastScrollY);
  }, 150);
});

// ---- Foundation: staggered word-by-word reveal ----
function setupFoundationObserver() {
  const foundationText = document.getElementById('foundationText');
  if (!foundationText) return;
  const foundationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        foundationText.querySelectorAll('.reveal-word').forEach((w) => w.classList.add('active'));
        foundationText.dataset.revealed = 'true';
        foundationObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  foundationObserver.observe(foundationText);
}

// ---- About: decorative glyph draws itself in on scroll ----
const aboutGlyph = document.getElementById('aboutGlyph');
if (aboutGlyph) {
  const glyphObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        aboutGlyph.querySelectorAll('circle, path').forEach((shape) => {
          shape.style.transition = 'stroke-dashoffset 1.1s ease';
          shape.style.strokeDashoffset = '0';
        });
        glyphObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  glyphObserver.observe(aboutGlyph);
}

// ---- Magnetic CTA button ----
const magneticCta = document.getElementById('magneticCta');
if (magneticCta) {
  magneticCta.addEventListener('mousemove', (e) => {
    const rect = magneticCta.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    magneticCta.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  });
  magneticCta.addEventListener('mouseleave', () => {
    magneticCta.style.transform = 'translate(0px, 0px)';
  });
}

// Example chips click handling integrated with Locomotive scrollTo
// NOTE: chip text/data-text stay in Indonesian on purpose, since they are
// sample input sentences for the translator engine, not UI copy.
document.querySelectorAll('.example-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    inputText.value = chip.dataset.text;
    charCount.textContent = `${inputText.value.length} / 500`;
    doTranslate();
    // Locomotive scroll to section instead of native scrollIntoView
    scroll.scrollTo('#translator');
  });
});

// ---- Initial render: apply saved/default UI language ----
renderFoundationWords();
setupFoundationObserver();
applyUILanguage();