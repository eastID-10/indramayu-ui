/**
 * main.js
 * Shared behaviour for every page: mobile nav toggle + active-link marking +
 * bilingual language switcher (ID / EN).
 * Feature pages load THIS file first, then their own dedicated script
 * (e.g. ner.js, translate.js) which only knows about its own playground.
 */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
      });
    });
  }

  // Mark the current page's nav link as active based on the filename.
  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-page]').forEach(function (a) {
    if (a.getAttribute('data-page') === current) {
      a.classList.add('is-active');
    }
  });

  // ───────────────────── Language Switcher ─────────────────────
  var switcher = document.getElementById('langSwitcher');
  var langBtn = document.getElementById('langBtn');
  var langLabel = document.getElementById('langLabel');
  var dropdown = document.getElementById('langDropdown');

  if (switcher && langBtn && dropdown) {
    // Restore saved language (default: id)
    var savedLang = localStorage.getItem('bi-lang') || 'id';
    applyLanguage(savedLang);

    // Toggle dropdown
    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      switcher.classList.toggle('is-open');
    });

    // Handle option clicks
    dropdown.querySelectorAll('.lang-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        var lang = this.getAttribute('data-lang');
        applyLanguage(lang);
        localStorage.setItem('bi-lang', lang);
        switcher.classList.remove('is-open');
      });
    });

    // Close dropdown on outside click
    document.addEventListener('click', function () {
      switcher.classList.remove('is-open');
    });
    switcher.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  function applyLanguage(lang) {
    // Update label in button
    if (langLabel) {
      langLabel.textContent = lang.toUpperCase();
    }

    // Update html lang attribute
    var htmlRoot = document.getElementById('htmlRoot');
    if (htmlRoot) {
      htmlRoot.setAttribute('lang', lang);
    }

    // Update active state on dropdown options
    if (dropdown) {
      dropdown.querySelectorAll('.lang-option').forEach(function (opt) {
        opt.classList.toggle('is-active', opt.getAttribute('data-lang') === lang);
      });
    }

    // Swap text content for all elements with data-lang-* attributes
    var attr = 'data-lang-' + lang;
    document.querySelectorAll('[' + attr + ']').forEach(function (el) {
      var newContent = el.getAttribute(attr);
      if (newContent !== null) {
        // Check if the element contains an SVG (like buttons with arrow icons)
        var svg = el.querySelector('svg');
        if (svg && el.children.length > 0) {
          // Preserve the SVG: set text, then re-append SVG
          var svgClone = svg.cloneNode(true);
          el.innerHTML = newContent + ' ';
          el.appendChild(svgClone);
        } else {
          el.innerHTML = newContent;
        }
      }
    });
  }
})();
