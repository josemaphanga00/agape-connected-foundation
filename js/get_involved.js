/* ══════════════════════════════════════════
   AGAPE — GET INVOLVED — main.js
   ══════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────
   1. NAVBAR — scroll shadow + active state
   ────────────────────────────────────────── */
(function initNavbar() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Close mobile menu on nav link click
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
   2. FADE-UP — scroll reveal
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
   3. DONATION WIDGET
      - Amount button selection
      - Custom amount input sync
      - Frequency toggle
      - Dynamic button label
   ────────────────────────────────────────── */
(function initDonationWidget() {
  const amountBtns   = document.querySelectorAll('.amount-btn');
  const customInput  = document.getElementById('customAmount');
  const freqBtns     = document.querySelectorAll('.freq-btn');
  const donateBtn    = document.getElementById('donateBtn');
  const donateBtnAmt = document.getElementById('donateBtnAmount');

  if (!donateBtn) return;

  let selectedAmount = 50;   // default
  let selectedFreq   = 'once';

  // ── Sync button label ──
  function updateButtonLabel() {
    const freqLabel = selectedFreq === 'monthly' ? '/mo' : '';
    donateBtnAmt.textContent = `$${selectedAmount}${freqLabel}`;
  }

  // ── Amount buttons ──
  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedAmount = parseInt(btn.dataset.amount, 10);
      if (customInput) customInput.value = '';
      updateButtonLabel();

      // Pulse the donate button
      donateBtn.classList.add('pulse-once');
      donateBtn.addEventListener('animationend', () => {
        donateBtn.classList.remove('pulse-once');
      }, { once: true });
    });
  });

  // ── Custom amount input ──
  if (customInput) {
    customInput.addEventListener('input', () => {
      const val = parseFloat(customInput.value);
      if (val > 0) {
        amountBtns.forEach(b => b.classList.remove('active'));
        selectedAmount = val;
        updateButtonLabel();
      }
    });

    customInput.addEventListener('blur', () => {
      if (!customInput.value || parseFloat(customInput.value) <= 0) {
        // Revert to $50 default if invalid
        amountBtns.forEach(b => b.classList.remove('active'));
        const defaultBtn = document.querySelector('.amount-btn[data-amount="50"]');
        if (defaultBtn) defaultBtn.classList.add('active');
        selectedAmount = 50;
        customInput.value = '';
        updateButtonLabel();
      }
    });
  }

  // ── Frequency toggle ──
  freqBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      freqBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedFreq = btn.dataset.freq;
      updateButtonLabel();
    });
  });

  // ── Donate button click — mock checkout ──
  donateBtn.addEventListener('click', () => {
    if (selectedAmount <= 0) return;

    // Visual feedback
    donateBtn.textContent = '✓ Redirecting to checkout…';
    donateBtn.style.background = 'var(--red-dk)';
    donateBtn.disabled = true;

    setTimeout(() => {
      donateBtn.innerHTML = `Donate <span id="donateBtnAmount">$${selectedAmount}${selectedFreq === 'monthly' ? '/mo' : ''}</span>`;
      donateBtn.style.background = '';
      donateBtn.disabled = false;
    }, 2200);
  });

  // ── Inject pulse-once keyframe ──
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulseOnce {
      0%   { box-shadow: 0 0 0 0   rgba(200,16,46,0.5); }
      70%  { box-shadow: 0 0 0 12px rgba(200,16,46,0); }
      100% { box-shadow: 0 0 0 0   rgba(200,16,46,0); }
    }
    .pulse-once { animation: pulseOnce 0.6s ease-out forwards; }
  `;
  document.head.appendChild(style);

  updateButtonLabel();
})();


/* ──────────────────────────────────────────
   4. INTEREST CHIPS — toggle checked state
   ────────────────────────────────────────── */
(function initInterestChips() {
  const chips = document.querySelectorAll('.interest-chip');
  if (!chips.length) return;

  chips.forEach(chip => {
    const checkbox = chip.querySelector('input[type="checkbox"]');

    // Set initial visual state
    if (checkbox && checkbox.checked) chip.classList.add('checked');

    chip.addEventListener('click', () => {
      if (!checkbox) return;
      checkbox.checked = !checkbox.checked;
      chip.classList.toggle('checked', checkbox.checked);

      // Hide error if at least one checked
      const anyChecked = document.querySelectorAll('.interest-chip.checked').length > 0;
      const errEl = document.getElementById('vInterestErr');
      if (anyChecked && errEl) errEl.classList.remove('show');
    });
  });
})();


/* ──────────────────────────────────────────
   5. VOLUNTEER FORM — validation + submit
   ────────────────────────────────────────── */
(function initVolunteerForm() {
  const form        = document.getElementById('volunteerForm');
  const successMsg  = document.getElementById('volunteerSuccess');
  const submitBtn   = document.getElementById('volunteerBtn');
  if (!form) return;

  // ── Field validator helper ──
  function validate(inputId, errId, checkFn) {
    const input  = document.getElementById(inputId);
    const errEl  = document.getElementById(errId);
    if (!input || !errEl) return true;
    const valid = checkFn(input.value.trim());
    input.classList.toggle('is-invalid', !valid);
    errEl.classList.toggle('show', !valid);
    return valid;
  }

  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const notEmpty = v => v.length > 0;

  // ── Live validation on blur ──
  document.getElementById('vFirstName')?.addEventListener('blur', () =>
    validate('vFirstName', 'vFirstNameErr', notEmpty));
  document.getElementById('vLastName')?.addEventListener('blur', () =>
    validate('vLastName', 'vLastNameErr', notEmpty));
  document.getElementById('vEmail')?.addEventListener('blur', () =>
    validate('vEmail', 'vEmailErr', isEmail));

  // ── Submit ──
  form.addEventListener('submit', e => {
    e.preventDefault();

    const v1 = validate('vFirstName', 'vFirstNameErr', notEmpty);
    const v2 = validate('vLastName',  'vLastNameErr',  notEmpty);
    const v3 = validate('vEmail',     'vEmailErr',     isEmail);

    const anyInterest = document.querySelectorAll('.interest-chip.checked').length > 0;
    const errInterest = document.getElementById('vInterestErr');
    if (!anyInterest && errInterest) errInterest.classList.add('show');

    if (!v1 || !v2 || !v3 || !anyInterest) return;

    // ── Show spinner ──
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    if (btnText)    btnText.classList.add('d-none');
    if (btnSpinner) btnSpinner.classList.remove('d-none');
    submitBtn.disabled = true;

    // ── Simulate async submission ──
    setTimeout(() => {
      form.classList.add('d-none');
      if (successMsg) successMsg.classList.remove('d-none');

      // Scroll success into view
      successMsg?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1600);
  });
})();


/* ──────────────────────────────────────────
   6. IMPACT CARD — highlight on amount select
   ────────────────────────────────────────── */
(function initImpactHighlight() {
  const amountBtns = document.querySelectorAll('.amount-btn');
  const impactRows = document.querySelectorAll('.impact-row');
  if (!amountBtns.length || !impactRows.length) return;

  // Map amount → impact row index
  const amountMap = { '25': 0, '50': 1, '100': 2, '250': 3 };

  function highlightRow(amount) {
    impactRows.forEach((row, i) => {
      row.style.transition    = 'background 0.3s ease, border-radius 0.3s ease';
      row.style.background    = i === amountMap[String(amount)] ? 'rgba(200,16,46,0.06)' : '';
      row.style.borderRadius  = i === amountMap[String(amount)] ? '6px' : '';
      row.style.padding       = i === amountMap[String(amount)] ? '10px 8px' : '';

      const amtEl = row.querySelector('.impact-amount');
      if (amtEl) {
        amtEl.style.transform  = i === amountMap[String(amount)] ? 'scale(1.1)' : '';
        amtEl.style.transition = 'transform 0.25s ease';
      }
    });
  }

  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => highlightRow(btn.dataset.amount));
  });

  // Highlight default ($50)
  highlightRow(50);
})();


/* ──────────────────────────────────────────
   7. SMOOTH SCROLL — internal anchor links
   ────────────────────────────────────────── */
(function initSmoothScroll() {
  const nav = document.getElementById('mainNav');

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = (nav ? nav.offsetHeight : 70) + 16;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });
})();


/* ──────────────────────────────────────────
   8. BACK-TO-TOP BUTTON
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
      z-index: 999;
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
   9. WAY ITEMS — scroll into section on click
   ────────────────────────────────────────── */
(function initWayItems() {
  const targets = { 0: '#donate', 1: '#volunteer', 2: '#partner' };
  const nav     = document.getElementById('mainNav');

  document.querySelectorAll('.way-item').forEach((item, i) => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      const target = document.querySelector(targets[i]);
      if (!target) return;
      const offset = (nav ? nav.offsetHeight : 70) + 20;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });
})();
