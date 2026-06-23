/* ══════════════════════════════════════════
   AGAPE — CONTACT — main.js
   ══════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────
   1. NAVBAR — scroll shadow + mobile close
   ────────────────────────────────────────── */
(function initNavbar() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const collapse = document.getElementById('navMain');
      if (collapse && collapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(collapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });
})();


/* ──────────────────────────────────────────
   2. FADE-UP — IntersectionObserver reveal
   ────────────────────────────────────────── */
(function initFadeUp() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.13 });

  els.forEach(el => observer.observe(el));
})();


/* ──────────────────────────────────────────
   3. CONTACT FORM
      - Live blur validation
      - Character counter on textarea
      - Submit with spinner + success state
   ────────────────────────────────────────── */
(function initContactForm() {
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('contactBtn');
  const successMsg = document.getElementById('contactSuccess');
  const textarea   = document.getElementById('cMessage');
  const charCount  = document.getElementById('charCount');
  const MAX_CHARS  = 500;

  if (!form) return;

  /* ── Helpers ── */
  const isEmail  = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const notEmpty = v => v.length > 0;

  function setField(inputId, errId, valid) {
    const input = document.getElementById(inputId);
    const err   = document.getElementById(errId);
    if (!input || !err) return valid;
    input.classList.toggle('is-invalid', !valid);
    err.classList.toggle('show', !valid);
    return valid;
  }

  function validateName()    { return setField('cName',    'cNameErr',    notEmpty(document.getElementById('cName')?.value.trim() || '')); }
  function validateEmail()   { return setField('cEmail',   'cEmailErr',   isEmail(document.getElementById('cEmail')?.value.trim() || '')); }
  function validateMessage() { return setField('cMessage', 'cMessageErr', notEmpty(document.getElementById('cMessage')?.value.trim() || '')); }

  /* ── Live blur validation ── */
  document.getElementById('cName')?.addEventListener('blur', validateName);
  document.getElementById('cEmail')?.addEventListener('blur', validateEmail);
  document.getElementById('cMessage')?.addEventListener('blur', validateMessage);

  /* ── Real-time input clear on typing ── */
  ['cName', 'cEmail', 'cMessage'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', function () {
      this.classList.remove('is-invalid');
      const errEl = document.getElementById(id + 'Err');
      if (errEl) errEl.classList.remove('show');
    });
  });

  /* ── Character counter ── */
  if (textarea && charCount) {
    textarea.setAttribute('maxlength', MAX_CHARS);

    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = len;
      const wrap = charCount.closest('.char-count');
      if (wrap) wrap.classList.toggle('warn', len >= MAX_CHARS * 0.9);
    });
  }

  /* ── Submit ── */
  form.addEventListener('submit', e => {
    e.preventDefault();

    const v1 = validateName();
    const v2 = validateEmail();
    const v3 = validateMessage();

    if (!v1 || !v2 || !v3) {
      // Shake the form card
      const card = form.closest('.form-card');
      if (card) {
        card.classList.add('shake');
        card.addEventListener('animationend', () => card.classList.remove('shake'), { once: true });
      }
      return;
    }

    /* Show spinner */
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    if (btnText)    btnText.classList.add('d-none');
    if (btnSpinner) btnSpinner.classList.remove('d-none');
    submitBtn.disabled = true;

    /* Simulate async send (1.8s) */
    setTimeout(() => {
      form.classList.add('d-none');
      if (successMsg) {
        successMsg.classList.remove('d-none');
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 1800);
  });

  /* ── Shake keyframe ── */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-6px); }
      40%       { transform: translateX(6px); }
      60%       { transform: translateX(-4px); }
      80%       { transform: translateX(4px); }
    }
    .shake { animation: shake 0.45s ease; }
  `;
  document.head.appendChild(style);
})();


/* ──────────────────────────────────────────
   4. INFO CARDS — entrance stagger on scroll
   ────────────────────────────────────────── */
(function initInfoCards() {
  const cards = document.querySelectorAll('.info-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach(card => {
    card.style.opacity    = '0';
    card.style.transform  = 'translateY(20px)';
    card.style.transition = 'opacity 0.55s ease, transform 0.55s ease, box-shadow 0.22s ease, transform 0.22s ease';
    observer.observe(card);
  });
})();


/* ──────────────────────────────────────────
   5. MAP CARD — tooltip on hover
   ────────────────────────────────────────── */
(function initMapCard() {
  const mapCard = document.querySelector('.map-card');
  if (!mapCard) return;

  // Subtle parallax on mouse move over map
  mapCard.addEventListener('mousemove', e => {
    const rect  = mapCard.getBoundingClientRect();
    const xPct  = ((e.clientX - rect.left) / rect.width  - 0.5) * 6;
    const yPct  = ((e.clientY - rect.top)  / rect.height - 0.5) * 6;
    mapCard.style.transform = `perspective(600px) rotateY(${xPct}deg) rotateX(${-yPct}deg)`;
  });

  mapCard.addEventListener('mouseleave', () => {
    mapCard.style.transform = '';
    mapCard.style.transition = 'transform 0.5s ease';
  });

  mapCard.addEventListener('mouseenter', () => {
    mapCard.style.transition = 'transform 0.1s ease';
  });
})();


/* ──────────────────────────────────────────
   6. COPY-TO-CLIPBOARD — click email/phone
   ────────────────────────────────────────── */
(function initCopyToClipboard() {
  const copyTargets = document.querySelectorAll('.info-link');
  if (!copyTargets.length) return;

  /* Inject toast styles */
  const style = document.createElement('style');
  style.textContent = `
    .copy-toast {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      background: var(--dark);
      color: #fff;
      font-size: 0.82rem;
      font-family: 'DM Sans', sans-serif;
      padding: 8px 18px;
      border-radius: 50px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      opacity: 0;
      transition: opacity 0.25s ease, transform 0.25s ease;
      pointer-events: none;
      z-index: 9999;
      white-space: nowrap;
    }
    .copy-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  `;
  document.head.appendChild(style);

  const toast = document.createElement('div');
  toast.className = 'copy-toast';
  document.body.appendChild(toast);

  let toastTimer;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  copyTargets.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href') || '';
      const text = href.replace('mailto:', '').replace('tel:', '');

      if (navigator.clipboard && text) {
        e.preventDefault();
        navigator.clipboard.writeText(text).then(() => {
          showToast(`✓ Copied: ${text}`);
        }).catch(() => {
          // Fallback: just follow the link
          window.location.href = href;
        });
      }
    });
  });
})();


/* ──────────────────────────────────────────
   7. BACK-TO-TOP BUTTON
   ────────────────────────────────────────── */
(function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<i class="bi bi-arrow-up"></i>';

  const style = document.createElement('style');
  style.textContent = `
    #backToTop {
      position: fixed;
      bottom: 28px; right: 28px;
      width: 44px; height: 44px;
      border-radius: 50%;
      background: var(--red);
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      box-shadow: 0 4px 16px rgba(200,16,46,0.35);
      opacity: 0;
      transform: translateY(12px);
      transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s;
      pointer-events: none;
      z-index: 998;
    }
    #backToTop.show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: all;
    }
    #backToTop:hover { background: var(--red-dk); }
  `;
  document.head.appendChild(style);
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ──────────────────────────────────────────
   8. SUBJECT SELECT — style placeholder option
   ────────────────────────────────────────── */
(function initSelectPlaceholder() {
  const sel = document.getElementById('cSubject');
  if (!sel) return;

  function updateColor() {
    sel.style.color = sel.value === '' ? '#aaa' : 'var(--dark)';
  }

  sel.addEventListener('change', updateColor);
  updateColor();
})();
