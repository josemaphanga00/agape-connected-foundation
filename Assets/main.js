/* ══════════════════════════════════════════
   AGAPE CONNECTED FOUNDATION — main.js
   ══════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────
   1. NAVBAR — scroll shadow + active link
   ────────────────────────────────────────── */
(function initNavbar() {
  const nav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

  // Add shadow on scroll
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Smooth-scroll + active state on click
  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offset = nav.offsetHeight + 12;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      // Close mobile menu
      const collapse = document.getElementById('navMain');
      if (collapse && collapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(collapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });

  // Highlight nav link based on scroll position
  const sections = Array.from(document.querySelectorAll('section[id], footer[id]'));

  function updateActiveLink() {
    const scrollY = window.scrollY + nav.offsetHeight + 60;
    let current = '';

    sections.forEach(sec => {
      if (sec.offsetTop <= scrollY) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${current}`);
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();


/* ──────────────────────────────────────────
   2. FADE-UP — IntersectionObserver
   ────────────────────────────────────────── */
(function initFadeUp() {
  const fadeEls = document.querySelectorAll('.fade-up');

  if (!fadeEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  fadeEls.forEach(el => observer.observe(el));
})();


/* ──────────────────────────────────────────
   3. PROGRESS BAR — hero fundraising bar
   ────────────────────────────────────────── */
(function initProgressBar() {
  const bar = document.getElementById('heroProgressBar');
  if (!bar) return;

  const targetWidth = parseInt(bar.dataset.width, 10) || 70;

  // Trigger after short delay so CSS transition runs
  setTimeout(() => {
    bar.style.width = targetWidth + '%';
  }, 700);
})();


/* ──────────────────────────────────────────
   4. COUNTER ANIMATION — stats section
   ────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  /**
   * Animate a single counter element from 0 → target.
   * @param {HTMLElement} el
   */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800; // ms
    const frameDuration = 1000 / 60; // ~16ms per frame
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    // Ease-out quad
    const easeOut = t => t * (2 - t);

    const timer = setInterval(() => {
      frame++;
      const progress = easeOut(frame / totalFrames);
      const value = Math.round(progress * target);
      el.textContent = value.toLocaleString();

      if (frame >= totalFrames) {
        el.textContent = target.toLocaleString();
        clearInterval(timer);
      }
    }, frameDuration);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach(c => observer.observe(c));
})();


/* ──────────────────────────────────────────
   5. PROGRAM CARDS — image overflow clip fix
   ────────────────────────────────────────── */
(function initProgramCards() {
  // The CSS handles the scale hover; this ensures overflow:hidden is applied
  // even if the browser doesn't inherit it from border-radius alone.
  document.querySelectorAll('.program-card').forEach(card => {
    card.style.overflow = 'hidden';
  });
})();


/* ──────────────────────────────────────────
   6. DONATE BUTTON — pulse on idle
   ────────────────────────────────────────── */
(function initDonatePulse() {
  const donateBtns = document.querySelectorAll('.btn-donate-nav, .btn-red');
  if (!donateBtns.length) return;

  // Add a CSS keyframe via <style> injection
  const style = document.createElement('style');
  style.textContent = `
    @keyframes subtlePulse {
      0%   { box-shadow: 0 0 0 0   rgba(200,16,46,0.45); }
      70%  { box-shadow: 0 0 0 10px rgba(200,16,46,0); }
      100% { box-shadow: 0 0 0 0   rgba(200,16,46,0); }
    }
    .btn-pulse {
      animation: subtlePulse 2s ease-out infinite;
    }
  `;
  document.head.appendChild(style);

  // Pulse the nav donate button after 4 seconds of inactivity
  let idleTimer;

  function resetIdle() {
    clearTimeout(idleTimer);
    document.querySelectorAll('.btn-donate-nav').forEach(b => b.classList.remove('btn-pulse'));
    idleTimer = setTimeout(() => {
      document.querySelectorAll('.btn-donate-nav').forEach(b => b.classList.add('btn-pulse'));
    }, 4000);
  }

  ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach(evt =>
    window.addEventListener(evt, resetIdle, { passive: true })
  );

  resetIdle();
})();


/* ──────────────────────────────────────────
   7. BACK-TO-TOP — floating button
   ────────────────────────────────────────── */
(function initBackToTop() {
  // Create button
  const btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<i class="bi bi-arrow-up"></i>';

  const style = document.createElement('style');
  style.textContent = `
    #backToTop {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #C8102E;
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
    #backToTop:hover {
      background: #9b0b21;
    }
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
   8. TESTIMONIAL CAROUSEL — auto-rotate on mobile
   ────────────────────────────────────────── */
(function initTestimonialCarousel() {
  // Only activate on smaller screens where cards stack
  function isMobile() {
    return window.innerWidth < 768;
  }

  if (!isMobile()) return;

  const cards = document.querySelectorAll('.testimonial-card');
  if (cards.length < 2) return;

  let current = 0;

  function showCard(index) {
    cards.forEach((card, i) => {
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      if (i === index) {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      } else {
        card.style.opacity = '0.4';
        card.style.transform = 'scale(0.97)';
      }
    });
  }

  showCard(0);

  setInterval(() => {
    current = (current + 1) % cards.length;
    showCard(current);
  }, 4000);

  window.addEventListener('resize', () => {
    if (!isMobile()) {
      cards.forEach(card => {
        card.style.opacity = '';
        card.style.transform = '';
      });
    }
  });
})();


/* ──────────────────────────────────────────
   9. FORM — simple newsletter stub (footer)
   ────────────────────────────────────────── */
(function initNewsletterStub() {
  // Inject a small email signup into the footer Connect column
  const connectList = document.querySelector('footer .col-lg-3 ul');
  if (!connectList) return;

  const li = document.createElement('li');
  li.style.marginTop = '1rem';
  li.innerHTML = `
    <form id="newsletterForm" style="display:flex;gap:6px;flex-wrap:wrap;">
      <input
        type="email"
        id="newsletterEmail"
        placeholder="Your email"
        required
        style="
          flex:1;min-width:140px;
          padding:7px 12px;
          border:1px solid rgba(255,255,255,0.15);
          background:rgba(255,255,255,0.07);
          color:#fff;
          border-radius:4px;
          font-size:0.82rem;
          outline:none;
          font-family:'DM Sans',sans-serif;
        "
      />
      <button
        type="submit"
        style="
          padding:7px 14px;
          background:#C8102E;
          color:#fff;
          border:none;
          border-radius:4px;
          font-size:0.82rem;
          font-weight:600;
          cursor:pointer;
          font-family:'DM Sans',sans-serif;
          transition:background 0.2s;
        "
        onmouseover="this.style.background='#9b0b21'"
        onmouseout="this.style.background='#C8102E'"
      >Join</button>
    </form>
    <p id="newsletterMsg" style="font-size:0.78rem;margin-top:6px;color:rgba(255,255,255,0.5);display:none;"></p>
  `;
  connectList.appendChild(li);

  document.getElementById('newsletterForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value.trim();
    const msg = document.getElementById('newsletterMsg');

    if (email) {
      msg.textContent = '✓ Thanks! You\'re on the list.';
      msg.style.color = '#a8e6b8';
      msg.style.display = 'block';
      this.reset();
      setTimeout(() => { msg.style.display = 'none'; }, 4000);
    }
  });
})();
